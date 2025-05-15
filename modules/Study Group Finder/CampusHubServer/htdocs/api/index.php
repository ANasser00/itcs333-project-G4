<?php
/**
 * Campus Hub API Documentation
 * This file serves as a simple documentation page for the API endpoints.
 */
header('Content-Type: text/html');
?>
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Campus Hub API Documentation</title>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet">
    <style>
        body {
            font-family: 'Inter', sans-serif;
            line-height: 1.6;
            color: #333;
            max-width: 900px;
            margin: 0 auto;
            padding: 20px;
        }
        h1 {
            color: #4F46E5;
            border-bottom: 2px solid #E5E7EB;
            padding-bottom: 10px;
        }
        h2 {
            color: #4F46E5;
            margin-top: 30px;
        }
        code {
            background-color: #F3F4F6;
            padding: 2px 5px;
            border-radius: 3px;
            font-family: monospace;
        }
        pre {
            background-color: #F3F4F6;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        .endpoint {
            margin-bottom: 30px;
            border: 1px solid #E5E7EB;
            border-radius: 5px;
            padding: 15px;
        }
        .method {
            display: inline-block;
            padding: 3px 8px;
            border-radius: 3px;
            color: white;
            font-weight: bold;
            margin-right: 10px;
        }
        .get { background-color: #22C55E; }
        .post { background-color: #3B82F6; }
        .put { background-color: #F59E0B; }
        .delete { background-color: #EF4444; }
    </style>
</head>
<body>
    <h1>Campus Hub API Documentation</h1>
    <p>Welcome to the Campus Hub API documentation. Below you'll find information about available endpoints for the Study Group Finder module.</p>
    
    <h2>Study Groups Endpoints</h2>
    
    <div class="endpoint">
        <h3><span class="method get">GET</span> /api/groups/read.php</h3>
        <p>Retrieve a list of all study groups or a specific study group by ID.</p>
        <h4>Parameters:</h4>
        <ul>
            <li><code>id</code> (optional) - Get a specific study group by ID</li>
            <li><code>page</code> (optional) - Page number for pagination (default: 1)</li>
            <li><code>per_page</code> (optional) - Records per page (default: 10)</li>
        </ul>
        <h4>Response Example:</h4>
        <pre>{
  "success": true,
  "data": [
    {
      "id": 1,
      "title": "Algorithm Study Crew",
      "course_code": "ITCS347",
      "academic_year": "3rd Year",
      "meeting_location": "Library Room 302",
      "description": "Join us every weekend to go over Algorithm problems.",
      "contact_email": "algo.crew@example.com",
      "created_at": "2023-05-01 14:30:00"
    },
    ...
  ],
  "pagination": {
    "current_page": 1,
    "per_page": 10,
    "total_records": 25,
    "total_pages": 3
  }
}</pre>
    </div>
    
    <div class="endpoint">
        <h3><span class="method post">POST</span> /api/groups/create.php</h3>
        <p>Create a new study group.</p>
        <h4>Request Body:</h4>
        <pre>{
  "title": "Algorithm Study Crew",
  "course_code": "ITCS347",
  "academic_year": "3rd Year",
  "meeting_location": "Library Room 302",
  "description": "Join us every weekend to go over Algorithm problems.",
  "contact_email": "algo.crew@example.com"
}</pre>
        <h4>Response Example:</h4>
        <pre>{
  "success": true,
  "message": "Study group created successfully",
  "id": 5
}</pre>
    </div>
    
    <div class="endpoint">
        <h3><span class="method put">PUT</span> /api/groups/update.php</h3>
        <p>Update an existing study group.</p>
        <h4>Request Body:</h4>
        <pre>{
  "id": 5,
  "title": "Algorithm Study Crew - Updated",
  "course_code": "ITCS347",
  "academic_year": "3rd Year",
  "meeting_location": "Library Room 302",
  "description": "Join us every weekend to go over Algorithm problems.",
  "contact_email": "algo.crew@example.com"
}</pre>
        <h4>Response Example:</h4>
        <pre>{
  "success": true,
  "message": "Study group updated successfully"
}</pre>
    </div>
    
    <div class="endpoint">
        <h3><span class="method delete">DELETE</span> /api/groups/delete.php</h3>
        <p>Delete a study group.</p>
        <h4>Request Body:</h4>
        <pre>{
  "id": 5
}</pre>
        <h4>Response Example:</h4>
        <pre>{
  "success": true,
  "message": "Study group deleted successfully"
}</pre>
    </div>

    <p>For any issues or questions, please contact the system administrator.</p>
</body>
</html>
