<?php
/**
 * Update Study Group API
 * Handles updates to existing study groups
 */

// Set headers with full CORS support
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: PUT, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache preflight request for 24 hours

// Include required files
require_once '../../config/Database.php';
require_once '../../models/Group.php';
require_once '../../utils/Response.php';
require_once '../../utils/Logger.php';
require_once '../../utils/Validator.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Response::success(null, 'Preflight OK');
}

// Check if PUT request
if ($_SERVER['REQUEST_METHOD'] !== 'PUT') {
    Response::error('Method not allowed', 405);
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'), true);

// Log the request
Logger::info('PUT request to groups/update.php: ' . json_encode($data));

// Validate input
$validator = new Validator();

// Check if ID is provided
if (!isset($data['id'])) {
    Response::error('Group ID is required', 400);
}

// Validate ID
if (!$validator->id($data['id'])) {
    Response::error($validator->getFirstError(), 400);
}

// Validate required fields if they are being updated
$requiredFields = [];
if (isset($data['title'])) $requiredFields[] = 'title';
if (isset($data['course_code'])) $requiredFields[] = 'course_code';
if (isset($data['description'])) $requiredFields[] = 'description';

if (!empty($requiredFields) && !$validator->required($data, $requiredFields)) {
    Response::error($validator->getFirstError(), 400);
}

// Validate email if provided
if (isset($data['contact_email']) && !empty($data['contact_email'])) {
    if (!$validator->email($data['contact_email'])) {
        Response::error($validator->getFirstError(), 400);
    }
}

// Validate academic year if provided
if (isset($data['academic_year']) && !empty($data['academic_year'])) {
    if (!$validator->academicYear($data['academic_year'])) {
        Response::error($validator->getFirstError(), 400);
    }
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->connect();
    
    // Create group object
    $group = new Group($db);
    
    // First check if the group exists
    if (!$group->read_single($data['id'])) {
        Response::error('Study group not found', 404);
    }
    
    // Set the group ID
    $group->id = $data['id'];
    
    // Update only the fields that are provided
    if (isset($data['title'])) $group->title = $data['title'];
    if (isset($data['course_code'])) $group->course_code = $data['course_code'];
    if (isset($data['academic_year'])) $group->academic_year = $data['academic_year'];
    if (isset($data['meeting_location'])) $group->meeting_location = $data['meeting_location'];
    if (isset($data['description'])) $group->description = $data['description'];
    if (isset($data['contact_email'])) $group->contact_email = $data['contact_email'];
    
    // Handle comment operations if needed
    if (isset($data['comments'])) {
        // First, clear existing comments for this group
        if ($group->clearComments($data['id'])) {
            // Add each comment back
            $success = true;
            foreach ($data['comments'] as $comment) {
                if (!$group->addComment(
                    $data['id'],
                    isset($comment['author']) ? $comment['author']['name'] : 'Anonymous',
                    $comment['content']
                )) {
                    $success = false;
                    break;
                }
            }
            
            if (!$success) {
                Logger::error('Failed to add some comments for group ' . $data['id']);
                Response::error('Failed to update comments', 500);
            } else {
                Logger::info('Successfully updated comments for group ' . $data['id']);
            }
        } else {
            Logger::error('Failed to clear comments for group ' . $data['id']);
            Response::error('Failed to update comments', 500);
        }
    }
    
    // Update the group
    if ($group->update()) {
        Response::success(null, 'Study group updated successfully');
    } else {
        Response::error('Failed to update study group', 500);
    }
} catch (Exception $e) {
    Logger::error('Update group error: ' . $e->getMessage());
    Response::error('Server error', 500);
}
