<?php
/**
 * Validator Class
 * Handles input validation for API requests
 */
class Validator {
    // Stores validation errors
    private $errors = [];
    
    /**
     * Validate that required fields are present
     * @param array $data Data to validate
     * @param array $fields Required fields
     * @return bool True if all required fields are present, false otherwise
     */
    public function required($data, $fields) {
        foreach ($fields as $field) {
            if (!isset($data[$field]) || empty(trim($data[$field]))) {
                $this->errors[$field] = ucfirst($field) . ' is required';
            }
        }
        
        return empty($this->errors);
    }
    
    /**
     * Validate email format
     * @param string $email Email to validate
     * @param bool $required Whether the field is required
     * @return bool True if valid or empty (if not required), false otherwise
     */
    public function email($email, $required = false) {
        // If not required and empty, return true
        if (!$required && empty($email)) {
            return true;
        }
        
        if (empty($email)) {
            $this->errors['email'] = 'Email is required';
            return false;
        }
        
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            $this->errors['email'] = 'Invalid email format';
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate a numeric ID
     * @param mixed $id ID to validate
     * @return bool True if valid, false otherwise
     */
    public function id($id) {
        if (!isset($id) || !is_numeric($id) || (int)$id <= 0) {
            $this->errors['id'] = 'Invalid ID';
            return false;
        }
        
        return true;
    }
    
    /**
     * Validate academic year
     * @param string $year Year to validate
     * @param bool $required Whether the field is required
     * @return bool True if valid or empty (if not required), false otherwise
     */
    public function academicYear($year, $required = false) {
        // If not required and empty, return true
        if (!$required && empty($year)) {
            return true;
        }
        
        if ($required && empty($year)) {
            $this->errors['academic_year'] = 'Academic year is required';
            return false;
        }
        
        $validYears = ['1st Year', '2nd Year', '3rd Year', '4th Year', '1st', '2nd', '3rd', '4th'];
        
        if (!in_array($year, $validYears)) {
            $this->errors['academic_year'] = 'Invalid academic year';
            return false;
        }
        
        return true;
    }
    
    /**
     * Get all validation errors
     * @return array Array of validation errors
     */
    public function getErrors() {
        return $this->errors;
    }
    
    /**
     * Get first validation error
     * @return string|null First error message or null if no errors
     */
    public function getFirstError() {
        if (!empty($this->errors)) {
            return reset($this->errors);
        }
        
        return null;
    }
    
    /**
     * Check if validation has errors
     * @return bool True if has errors, false otherwise
     */
    public function hasErrors() {
        return !empty($this->errors);
    }
}
