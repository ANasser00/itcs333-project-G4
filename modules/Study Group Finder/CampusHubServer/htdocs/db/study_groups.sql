-- Database Schema for Campus Hub Study Groups Module

-- Create database if it doesn't exist
CREATE DATABASE IF NOT EXISTS campus_hub CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Use the database
USE campus_hub;

-- Study Groups Table
CREATE TABLE IF NOT EXISTS study_groups (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    course_code VARCHAR(50) NOT NULL,
    academic_year VARCHAR(50) DEFAULT NULL,
    meeting_location VARCHAR(255) DEFAULT NULL,
    description TEXT NOT NULL,
    contact_email VARCHAR(255) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- Group Comments Table
CREATE TABLE IF NOT EXISTS group_comments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    group_id INT NOT NULL,
    author_name VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (group_id) REFERENCES study_groups(id) ON DELETE CASCADE
) ENGINE=InnoDB;

-- Insert sample data
INSERT INTO study_groups (title, course_code, academic_year, meeting_location, description, contact_email) VALUES
('Algorithm Study Crew', 'ITCS347', '3rd Year', 'Library Room 302', 'Join us every weekend to go over Algorithm problems.', 'algo.crew@example.com'),
('Database Design Group', 'ITCS351', '2nd Year', 'Computer Lab 2', 'Weekly meetups to practice database design and SQL queries.', 'db.group@example.com'),
('Web Development Workshop', 'ITCS222', '3rd Year', 'Innovation Hub', 'Learn modern web development technologies through hands-on projects.', 'web.dev@example.com'),
('AI & Machine Learning', 'ITCS456', '4th Year', 'Science Building 102', 'Explore AI concepts and machine learning algorithms together.', 'aiml.study@example.com'),
('English Literature Circle', 'ENG211', '1st Year', 'Arts Building Lounge', 'Discussion group for English literature enthusiasts.', 'lit.circle@example.com');

-- Insert sample comments
INSERT INTO group_comments (group_id, author_name, content) VALUES
(1, 'Sara Mohammad', 'Looking forward to our next meeting!'),
(1, 'David Chen', 'Can we focus on dynamic programming this week?'),
(2, 'Lisa Johnson', 'I found some great resources on normalization, will share in the next meeting.'),
(3, 'Alex Williams', 'Anyone interested in collaborating on a React project?'),
(4, 'Maya Patel', 'The lecture on neural networks was fascinating, can we discuss more?');
