<?php
/**
 * Response Class
 * Handles API response formatting
 */
class Response {
    /**
     * Send a success response
     * @param mixed $data Data to include in response
     * @param string $message Success message
     * @param int $code HTTP response code
     */
    public static function success($data = null, $message = 'Success', $code = 200) {
        self::send(true, $message, $data, $code);
    }
    
    /**
     * Send an error response
     * @param string $message Error message
     * @param int $code HTTP response code
     * @param mixed $data Additional error data
     */
    public static function error($message = 'Error', $code = 400, $data = null) {
        self::send(false, $message, $data, $code);
    }
    
    /**
     * Send a formatted JSON response
     * @param bool $success Success status
     * @param string $message Response message
     * @param mixed $data Response data
     * @param int $code HTTP response code
     */
    private static function send($success, $message, $data, $code) {
        // Set response status code
        http_response_code($code);
        
        // Create response array
        $response = [
            'success' => $success,
            'message' => $message
        ];
        
        // Add data if provided
        if($data !== null) {
            $response['data'] = $data;
        }
        
        // Set headers
        header('Content-Type: application/json');
        header('Access-Control-Allow-Origin: *');
        header('Access-Control-Allow-Methods: GET, POST, PUT, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Access-Control-Allow-Headers, Authorization, X-Requested-With');
        
        // Output JSON response
        echo json_encode($response);
        exit;
    }
}
