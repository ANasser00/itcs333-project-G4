<?php
// Debug file to examine database and environment

// Set headers with full CORS support
header('Access-Control-Allow-Origin: *'); // Allow requests from any origin
header('Content-Type: application/json');
header('Access-Control-Allow-Methods: GET, OPTIONS');
header('Access-Control-Allow-Headers: Access-Control-Allow-Headers, Content-Type, Access-Control-Allow-Methods, Authorization, X-Requested-With');
header('Access-Control-Max-Age: 86400'); // Cache preflight request for 24 hours

// Enable error reporting
ini_set('display_errors', 1);
ini_set('display_startup_errors', 1);
error_reporting(E_ALL);

// Include required files
require_once '../../config/Database.php';
require_once '../../utils/Response.php';

// Get database credentials
$host = getenv('PGHOST');
$port = getenv('PGPORT');
$dbname = getenv('PGDATABASE');
$user = getenv('PGUSER');
$password = getenv('PGPASSWORD');

$env_info = [
    'host' => $host,
    'port' => $port,
    'dbname' => $dbname,
    'user' => $user,
    // Not showing password for security
    'password_exists' => !empty($password)
];

try {
    // Try to connect to database
    $database = new Database();
    $db = $database->connect();
    
    // Check if connection was successful
    if ($db) {
        // Try a simple query
        $stmt = $db->query("SELECT * FROM study_groups LIMIT 1");
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        
        // Return results
        echo json_encode([
            'success' => true,
            'message' => 'Database connection successful',
            'environment' => $env_info,
            'sample_data' => $row
        ]);
    } else {
        echo json_encode([
            'success' => false,
            'message' => 'Database connection failed',
            'environment' => $env_info
        ]);
    }
} catch (Exception $e) {
    echo json_encode([
        'success' => false,
        'message' => 'Error: ' . $e->getMessage(),
        'environment' => $env_info
    ]);
}
?>