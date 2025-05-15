<?php
/**
 * Logger utility class
 * Handles logging of messages to the error log
 */
class Logger {
    /**
     * Log an info message
     * @param string $message The message to log
     */
    public static function info($message) {
        error_log('[INFO] ' . $message);
    }
    
    /**
     * Log an error message
     * @param string $message The message to log
     */
    public static function error($message) {
        error_log('[ERROR] ' . $message);
    }
    
    /**
     * Log a debug message
     * @param string $message The message to log
     */
    public static function debug($message) {
        error_log('[DEBUG] ' . $message);
    }
    
    /**
     * Log a warning message
     * @param string $message The message to log
     */
    public static function warning($message) {
        error_log('[WARNING] ' . $message);
    }
    
    /**
     * Log request information
     * @param string $method The HTTP method
     * @param string $endpoint The API endpoint
     * @param mixed $data The request data (will be converted to JSON)
     */
    public static function request($method, $endpoint, $data = null) {
        $message = '[REQUEST] ' . $method . ' ' . $endpoint;
        if ($data !== null) {
            $message .= ' - Data: ' . json_encode($data);
        }
        error_log($message);
    }
}
?>