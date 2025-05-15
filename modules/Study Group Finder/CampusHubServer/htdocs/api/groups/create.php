<?php
/**
 * Create Study Group API
 * Handles creation of new study groups
 */

// Set headers with full CORS support
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: POST, OPTIONS');
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

// Check if POST request
if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    Response::error('Method not allowed', 405);
}

// Get raw posted data
$data = json_decode(file_get_contents('php://input'), true);

// Log the request
Logger::request('POST', 'groups/create.php', $data);

// Validate input
$validator = new Validator();
$requiredFields = ['title', 'course_code', 'description'];
if (!$validator->required($data, $requiredFields)) {
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
    
    // Set group properties
    $group->title = $data['title'];
    $group->course_code = $data['course_code'];
    $group->description = $data['description'];
    $group->academic_year = $data['academic_year'] ?? '';
    $group->meeting_location = $data['meeting_location'] ?? '';
    $group->contact_email = $data['contact_email'] ?? '';
    
    // Create the group
    if ($group->create()) {
        Response::success(['id' => $group->id], 'Study group created successfully', 201);
    } else {
        Response::error('Failed to create study group', 500);
    }
} catch (Exception $e) {
    Logger::error('Create group error: ' . $e->getMessage());
    Response::error('Server error', 500);
}
