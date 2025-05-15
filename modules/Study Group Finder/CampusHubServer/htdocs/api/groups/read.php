<?php
/**
 * Read Study Group API
 * Handles retrieval of study groups (single or list)
 */

// Set headers with full CORS support
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache preflight request for 24 hours

// Include required files
require_once '../../config/Database.php';
require_once '../../models/Group.php';
require_once '../../utils/Response.php';
require_once '../../utils/Validator.php';
require_once '../../utils/Logger.php';

// Handle preflight OPTIONS request
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    Response::success(null, 'Preflight OK');
}

// Check if GET request
if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    Response::error('Method not allowed', 405);
}

// Log the request
Logger::request('GET', 'groups/read.php', $_GET);

try {
    // Connect to database
    $database = new Database();
    $db = $database->connect();
    
    // Check if database connection was successful
    if (!$db) {
        Logger::error('Failed to connect to database');
        Response::error('Database connection failed. Please try again later.', 503);
        exit;
    }
    
    // Create group object
    $group = new Group($db);
    
    // Check if ID parameter exists
    if (isset($_GET['id'])) {
        // Validate ID
        $validator = new Validator();
        if (!$validator->id($_GET['id'])) {
            Response::error($validator->getFirstError(), 400);
        }
        
        try {
            // Read single group
            if ($group->read_single($_GET['id'])) {
                // Format data for frontend compatibility
                $group_data = [
                    'id' => $group->id,
                    'title' => $group->title,
                    'course' => $group->course_code, // Frontend expects 'course'
                    'year' => $group->academic_year, // Frontend expects 'year'
                    'location' => $group->meeting_location, // Frontend expects 'location'
                    'description' => $group->description,
                    'contact' => $group->contact_email, // Frontend expects 'contact'
                    'created_at' => $group->created_at, // Add created_at for sorting
                    'comments' => $group->comments
                ];
                
                Response::success($group_data);
            } else {
                Response::error('Study group not found', 404);
            }
        } catch (Exception $e) {
            Logger::error('Read single group error: ' . $e->getMessage());
            Response::error('Failed to retrieve group details: ' . $e->getMessage(), 500);
        }
    } else {
        // Read all groups with pagination
        $page = isset($_GET['page']) ? (int)$_GET['page'] : 1;
        $per_page = isset($_GET['per_page']) ? (int)$_GET['per_page'] : 10;
        
        // Validate pagination parameters
        if ($page < 1) $page = 1;
        if ($per_page < 1 || $per_page > 100) $per_page = 10;
        
        try {
            // Get groups
            $result = $group->read($page, $per_page);
            
            // Check if any groups
            if (empty($result['groups'])) {
                Response::success([], 'No study groups found');
            } else {
                // Return groups with pagination
                Response::success([
                    'groups' => $result['groups'],
                    'pagination' => $result['pagination']
                ]);
            }
        } catch (Exception $e) {
            Logger::error('Read all groups error: ' . $e->getMessage());
            Response::error('Failed to retrieve groups: ' . $e->getMessage(), 500);
        }
    }
} catch (Exception $e) {
    Logger::error('Read group error: ' . $e->getMessage());
    Response::error('Server error: ' . $e->getMessage(), 500);
}
