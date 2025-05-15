<?php
/**
 * Delete Study Group API
 * Handles deletion of study groups
 */

// Set headers with full CORS support
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: DELETE, OPTIONS');
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

// Check if DELETE request
if ($_SERVER['REQUEST_METHOD'] !== 'DELETE') {
    Response::error('Method not allowed', 405);
}

// Get raw posted data or check query parameters
$data = json_decode(file_get_contents('php://input'), true);

// If ID is in URL
if (isset($_GET['id'])) {
    $id = $_GET['id'];
} 
// If ID is in request body
elseif (isset($data['id'])) {
    $id = $data['id'];
} 
// No ID provided
else {
    Response::error('Group ID is required', 400);
}

// Log the request
Logger::request('DELETE', 'groups/delete.php', ['id' => $id]);

// Validate ID
$validator = new Validator();
if (!$validator->id($id)) {
    Response::error($validator->getFirstError(), 400);
}

try {
    // Connect to database
    $database = new Database();
    $db = $database->connect();
    
    // Create group object
    $group = new Group($db);
    
    // Check if group exists
    if (!$group->read_single($id)) {
        Response::error('Study group not found', 404);
    }
    
    // Set ID to delete
    $group->id = $id;
    
    // Delete the group
    if ($group->delete()) {
        Response::success(null, 'Study group deleted successfully');
    } else {
        Response::error('Failed to delete study group', 500);
    }
} catch (Exception $e) {
    Logger::error('Delete group error: ' . $e->getMessage());
    Response::error('Server error', 500);
}
