<?php
/**
 * Database Class
 * Handles the connection to the PostgreSQL database using PDO
 */
class Database {
    // Database connection parameters
    private $conn;
    
    /**
     * Connect to the database
     * @return PDO|null The database connection or null on failure
     */
    public function connect() {
        $this->conn = null;
        
        try {
            // Get individual environment variables instead of parsing the URL
            $host = getenv('PGHOST');
            $port = getenv('PGPORT');
            $dbname = getenv('PGDATABASE');
            $user = getenv('PGUSER');
            $password = getenv('PGPASSWORD');
            
            // Create a new PDO instance for PostgreSQL
            $dsn = "pgsql:host=$host;port=$port;dbname=$dbname";
            
            // Add connection timeout options
            $options = [
                PDO::ATTR_TIMEOUT => 5, // 5 seconds timeout
                PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
                PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
                PDO::ATTR_EMULATE_PREPARES => false,
            ];
            
            // Attempt connection with retry
            $maxRetries = 3;
            $retryDelay = 1; // in seconds
            
            for ($attempt = 1; $attempt <= $maxRetries; $attempt++) {
                try {
                    $this->conn = new PDO($dsn, $user, $password, $options);
                    // If we get here, connection succeeded
                    break;
                } catch (PDOException $e) {
                    error_log("Database connection attempt $attempt failed: " . $e->getMessage());
                    
                    if ($attempt < $maxRetries) {
                        // Wait before trying again
                        sleep($retryDelay);
                        // Increase delay for next attempt
                        $retryDelay *= 2;
                    } else {
                        // Last attempt failed, re-throw the exception
                        throw $e;
                    }
                }
            }
            
        } catch(PDOException $e) {
            // Log detailed error
            error_log('Database Connection Error: ' . $e->getMessage());
            error_log('DSN: pgsql:host=' . $host . ';port=' . $port . ';dbname=' . $dbname);
            // Don't log username/password for security
        }
        
        return $this->conn;
    }
}
