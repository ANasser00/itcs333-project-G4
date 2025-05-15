<?php
/**
 * Group Model
 * Handles database operations for study groups
 */
class Group {
    // Database connection and table
    private $conn;
    private $table = 'study_groups';
    
    // Group properties
    public $id;
    public $title;
    public $course_code;
    public $academic_year;
    public $meeting_location;
    public $description;
    public $contact_email;
    public $created_at;
    public $comments = [];
    
    /**
     * Constructor with DB connection
     * @param PDO $db Database connection
     */
    public function __construct($db) {
        $this->conn = $db;
    }
    
    /**
     * Get all study groups with pagination
     * @param int $page Page number
     * @param int $per_page Records per page
     * @return array Query result and pagination data
     */
    public function read($page = 1, $per_page = 10) {
        // Check for valid database connection
        if (!$this->conn) {
            throw new Exception("Database connection is not available");
        }
        
        // Calculate offset
        $offset = ($page - 1) * $per_page;
        
        try {
            // Count total records first for pagination
            $count_query = "SELECT COUNT(*) as total FROM " . $this->table;
            $count_stmt = $this->conn->prepare($count_query);
            $count_stmt->execute();
            $total_row = $count_stmt->fetch(PDO::FETCH_ASSOC);
            $total_records = $total_row['total'];
            
            // Get paginated results
            $query = "SELECT 
                        id, title, course_code, academic_year, meeting_location, 
                        description, contact_email, created_at
                      FROM " . $this->table . " 
                      ORDER BY created_at DESC
                      LIMIT :limit OFFSET :offset";
            
            $stmt = $this->conn->prepare($query);
        } catch (PDOException $e) {
            // Log the error and throw a more descriptive exception
            error_log('Database query error in Group::read(): ' . $e->getMessage());
            throw new Exception("Database operation failed: " . $e->getMessage());
        }
        $stmt->bindValue(':limit', $per_page, PDO::PARAM_INT);
        $stmt->bindValue(':offset', $offset, PDO::PARAM_INT);
        $stmt->execute();
        
        // Format results and add pagination data
        $groups = [];
        while($row = $stmt->fetch(PDO::FETCH_ASSOC)) {
            // Simplify data structure for frontend compatibility
            $group = [
                'id' => $row['id'],
                'title' => $row['title'],
                'course' => $row['course_code'], // Frontend expects 'course' not 'course_code'
                'year' => $row['academic_year'], // Frontend expects 'year' not 'academic_year'
                'location' => $row['meeting_location'], // Frontend expects 'location' not 'meeting_location'
                'description' => $row['description'],
                'contact' => $row['contact_email'], // Frontend expects 'contact' not 'contact_email'
                'created_at' => $row['created_at'] // Include created_at for sorting
            ];
            
            $groups[] = $group;
        }
        
        // Create pagination data
        $pagination = [
            'current_page' => (int)$page,
            'per_page' => (int)$per_page,
            'total_records' => (int)$total_records,
            'total_pages' => ceil($total_records / $per_page)
        ];
        
        return [
            'groups' => $groups,
            'pagination' => $pagination
        ];
    }
    
    /**
     * Get a single study group by ID
     * @param int $id Group ID
     * @return bool True if success, false otherwise
     */
    public function read_single($id) {
        // Check for valid database connection
        if (!$this->conn) {
            throw new Exception("Database connection is not available");
        }
        
        try {
            // PostgreSQL uses LIMIT x OFFSET y syntax, not LIMIT x,y
            $query = "SELECT 
                        id, title, course_code, academic_year, meeting_location, 
                        description, contact_email, created_at
                      FROM " . $this->table . " 
                      WHERE id = :id
                      LIMIT 1";
            
            $stmt = $this->conn->prepare($query);
            $stmt->bindValue(':id', $id, PDO::PARAM_INT);
            $stmt->execute();
            
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
        } catch (PDOException $e) {
            // Log the error and throw a more descriptive exception
            error_log('Database query error in Group::read_single(): ' . $e->getMessage());
            throw new Exception("Database operation failed: " . $e->getMessage());
        }
        
        // If no group found
        if(!$row) {
            return false;
        }
        
        // Set properties
        $this->id = $row['id'];
        $this->title = $row['title'];
        $this->course_code = $row['course_code'];
        $this->academic_year = $row['academic_year'];
        $this->meeting_location = $row['meeting_location'];
        $this->description = $row['description'];
        $this->contact_email = $row['contact_email'];
        $this->created_at = $row['created_at'];
        
        // Get comments for this group if comments table exists
        try {
            $comment_query = "SELECT * FROM group_comments WHERE group_id = :group_id ORDER BY created_at ASC";
            $comment_stmt = $this->conn->prepare($comment_query);
            $comment_stmt->bindParam(':group_id', $this->id);
            $comment_stmt->execute();
            
            while($comment_row = $comment_stmt->fetch(PDO::FETCH_ASSOC)) {
                $this->comments[] = [
                    'id' => $comment_row['id'],
                    'author' => [
                        'name' => $comment_row['author_name'],
                        'initials' => $this->getInitials($comment_row['author_name'])
                    ],
                    'date' => $comment_row['created_at'],
                    'content' => $comment_row['content']
                ];
            }
        } catch(PDOException $e) {
            // Comments table might not exist yet, so we'll just return an empty array
            $this->comments = [];
        }
        
        return true;
    }
    
    /**
     * Create a new study group
     * @return bool True if created successfully, false otherwise
     */
    public function create() {
        // Query for PostgreSQL
        $query = "INSERT INTO " . $this->table . " 
                  (title, course_code, academic_year, meeting_location, description, contact_email)
                  VALUES 
                  (:title, :course_code, :academic_year, :meeting_location, :description, :contact_email)
                  RETURNING id";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->title = htmlspecialchars(strip_tags($this->title));
        $this->course_code = htmlspecialchars(strip_tags($this->course_code));
        $this->academic_year = htmlspecialchars(strip_tags($this->academic_year));
        $this->meeting_location = htmlspecialchars(strip_tags($this->meeting_location));
        $this->description = htmlspecialchars(strip_tags($this->description));
        $this->contact_email = htmlspecialchars(strip_tags($this->contact_email));
        
        $stmt->bindParam(':title', $this->title);
        $stmt->bindParam(':course_code', $this->course_code);
        $stmt->bindParam(':academic_year', $this->academic_year);
        $stmt->bindParam(':meeting_location', $this->meeting_location);
        $stmt->bindParam(':description', $this->description);
        $stmt->bindParam(':contact_email', $this->contact_email);
        
        // Execute query
        if($stmt->execute()) {
            // Get the inserted ID directly from the RETURNING clause
            $row = $stmt->fetch(PDO::FETCH_ASSOC);
            $this->id = $row['id'];
            return true;
        }
        
        return false;
    }
    
    /**
     * Update a study group
     * @return bool True if updated successfully, false otherwise
     */
    public function update() {
        try {
            // Query for PostgreSQL with proper syntax
            $query = "UPDATE " . $this->table . " 
                     SET title = :title,
                         course_code = :course_code,
                         academic_year = :academic_year,
                         meeting_location = :meeting_location,
                         description = :description,
                         contact_email = :contact_email,
                         updated_at = CURRENT_TIMESTAMP
                     WHERE id = :id";
            
            // Clean data
            $id = htmlspecialchars(strip_tags($this->id));
            $title = htmlspecialchars(strip_tags($this->title));
            $course_code = htmlspecialchars(strip_tags($this->course_code));
            $academic_year = htmlspecialchars(strip_tags($this->academic_year));
            $meeting_location = htmlspecialchars(strip_tags($this->meeting_location));
            $description = htmlspecialchars(strip_tags($this->description));
            $contact_email = htmlspecialchars(strip_tags($this->contact_email));
            
            // Prepare and execute statement
            $stmt = $this->conn->prepare($query);
            
            // Bind the parameters with explicit PDO types
            $stmt->bindValue(':id', $id, PDO::PARAM_INT); 
            $stmt->bindValue(':title', $title, PDO::PARAM_STR);
            $stmt->bindValue(':course_code', $course_code, PDO::PARAM_STR);
            $stmt->bindValue(':academic_year', $academic_year, PDO::PARAM_STR);
            $stmt->bindValue(':meeting_location', $meeting_location, PDO::PARAM_STR);
            $stmt->bindValue(':description', $description, PDO::PARAM_STR);
            $stmt->bindValue(':contact_email', $contact_email, PDO::PARAM_STR);
            
            // Execute and return result
            return $stmt->execute();
            
        } catch(PDOException $e) {
            error_log('Update error: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete a study group
     * @return bool True if deleted successfully, false otherwise
     */
    public function delete() {
        // First delete any comments associated with this group
        try {
            $delete_comments = "DELETE FROM group_comments WHERE group_id = :group_id";
            $comment_stmt = $this->conn->prepare($delete_comments);
            $comment_stmt->bindParam(':group_id', $this->id);
            $comment_stmt->execute();
        } catch(PDOException $e) {
            // Comments table might not exist yet, so continue
        }
        
        // Query
        $query = "DELETE FROM " . $this->table . " WHERE id = :id";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $this->id = htmlspecialchars(strip_tags($this->id));
        $stmt->bindParam(':id', $this->id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Add a comment to a study group
     * @param int $group_id Group ID
     * @param string $author_name Author name
     * @param string $content Comment content
     * @return bool True if added successfully, false otherwise
     */
    public function addComment($group_id, $author_name, $content) {
        try {
            // Check if comments table exists, create if not
            $this->ensureCommentsTableExists();
            
            // Query with PostgreSQL syntax
            $query = "INSERT INTO group_comments 
                      (group_id, author_name, content)
                      VALUES (:group_id, :author_name, :content)";
            
            // Clean data
            $clean_group_id = htmlspecialchars(strip_tags($group_id));
            $clean_author_name = htmlspecialchars(strip_tags($author_name));
            $clean_content = htmlspecialchars(strip_tags($content));
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Bind the parameters
            $stmt->bindValue(':group_id', $clean_group_id, PDO::PARAM_INT);
            $stmt->bindValue(':author_name', $clean_author_name, PDO::PARAM_STR);
            $stmt->bindValue(':content', $clean_content, PDO::PARAM_STR);
            
            // Execute query and return result
            return $stmt->execute();
        } catch (PDOException $e) {
            error_log('Error adding comment: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Delete a comment
     * @param int $comment_id Comment ID
     * @return bool True if deleted successfully, false otherwise
     */
    public function deleteComment($comment_id) {
        // Query
        $query = "DELETE FROM group_comments WHERE id = :id";
        
        // Prepare statement
        $stmt = $this->conn->prepare($query);
        
        // Clean and bind data
        $comment_id = htmlspecialchars(strip_tags($comment_id));
        $stmt->bindParam(':id', $comment_id);
        
        // Execute query
        if($stmt->execute()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * Ensure comments table exists
     */
    private function ensureCommentsTableExists() {
        try {
            // PostgreSQL syntax for table creation
            $query = "
                CREATE TABLE IF NOT EXISTS group_comments (
                    id SERIAL PRIMARY KEY,
                    group_id INTEGER NOT NULL,
                    author_name VARCHAR(255) NOT NULL,
                    content TEXT NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                    FOREIGN KEY (group_id) REFERENCES " . $this->table . "(id) ON DELETE CASCADE
                )
            ";
            $this->conn->exec($query);
        } catch(PDOException $e) {
            error_log('Error creating comments table: ' . $e->getMessage());
        }
    }
    
    /**
     * Clear all comments for a group
     * @param int $group_id Group ID
     * @return bool True if successful, false otherwise
     */
    public function clearComments($group_id) {
        try {
            // Check if comments table exists before attempting to delete
            $this->ensureCommentsTableExists();
            
            // Query to delete all comments for this group
            $query = "DELETE FROM group_comments WHERE group_id = :group_id";
            
            // Prepare statement
            $stmt = $this->conn->prepare($query);
            
            // Clean and bind data
            $group_id = htmlspecialchars(strip_tags($group_id));
            $stmt->bindValue(':group_id', $group_id, PDO::PARAM_INT);
            
            // Execute query
            return $stmt->execute();
        } catch(PDOException $e) {
            error_log('Error clearing comments: ' . $e->getMessage());
            return false;
        }
    }
    
    /**
     * Get initials from a name
     * @param string $name Full name
     * @return string Initials
     */
    private function getInitials($name) {
        $words = explode(' ', $name);
        $initials = '';
        
        foreach($words as $word) {
            if(!empty($word[0])) {
                $initials .= strtoupper($word[0]);
            }
        }
        
        return $initials;
    }
}
