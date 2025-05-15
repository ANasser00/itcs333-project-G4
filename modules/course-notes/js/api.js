/**
 * API integration for Course Notes application
 * Handles data fetching, error handling, and data transformation
 * Connects to Replit backend server running MariaDB
 */


// API endpoints - update this to your Replit URL
const API_BASE_URL = "https://3de20392-c7ee-4889-996e-a1c21667d9a9-00-3aqyltz0su95g.sisko.replit.dev";

// API endpoints structure
const API_ENDPOINTS = {
  notes: `${API_BASE_URL}/notes`,
  courses: `${API_BASE_URL}/courses`,
  tags: `${API_BASE_URL}/tags`,
  auth: `${API_BASE_URL}/auth`,
}

/**
 * Get auth token from local storage
 * @returns {string|null} - Auth token or null if not logged in
 */
function getAuthToken() {
  return localStorage.getItem("auth_token");
}

/**
 * Fetch data from API with error handling and loading state
 * @param {string} endpoint - API endpoint to fetch from
 * @param {Object} options - Fetch options
 * @returns {Promise} - Promise with data or error
 */
async function fetchData(endpoint, options = {}) {
  try {
    // Show loading state
    document.dispatchEvent(new CustomEvent("loading:start"))

    // Add auth token to headers if available
    const headers = options.headers || {};
    const token = getAuthToken();
    
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    
    // If content type is not set and method is not GET, set it to JSON
    if (!headers["Content-Type"] && options.method && options.method !== "GET") {
      headers["Content-Type"] = "application/json";
    }
    
    // Add mode: 'cors' to enable CORS requests
    options = {
      ...options,
      headers,
      mode: "cors"
    };

    const response = await fetch(endpoint, options);

    // End loading state in case of any errors
    document.dispatchEvent(new CustomEvent("loading:end"));

    // Handle unauthorized access
    if (response.status === 401) {
      localStorage.removeItem("auth_token");
      localStorage.removeItem("current_user");
      window.location.href = "/login.html";
      return { data: null, error: "Unauthorized access. Please login again." };
    }

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! Status: ${response.status}, ${errorText}`);
    }

    const data = await response.json();
    return { data, error: null, headers: response.headers };
  } catch (error) {
    console.error("Fetch error:", error);
    document.dispatchEvent(new CustomEvent("loading:end"));
    return { data: null, error: error.message };
  }
}

/**
 * Get all course notes
 * @param {Object} filters - Optional filters to apply
 * @param {number} page - Page number for pagination
 * @param {number} limit - Number of items per page
 * @param {boolean} fetchAll - Whether to fetch all notes
 * @returns {Promise} - Promise with notes data
 */
async function getNotes(filters = {}, page = 1, limit = 10, fetchAll = false) {
  try {
    // Build query parameters
    const queryParams = new URLSearchParams();
    
    // Add pagination
    if (!fetchAll) {
      queryParams.append("page", page);
      queryParams.append("limit", limit);
    } else {
      queryParams.append("limit", 500);
    }

    // Add filters to query params
    if (filters.q) queryParams.append("search", filters.q);
    if (filters.course) queryParams.append("course_id", filters.course);
    if (filters._sort && filters._order) {
      queryParams.append("sort", filters._sort);
      queryParams.append("order", filters._order);
    }

    const url = `${API_ENDPOINTS.notes}_fetch.php?${queryParams.toString()}`;
    const result = await fetchData(url);

    if (result.data) {
      return {
        notes: result.data || [],
        pagination: result.data.pagination || { currentPage: 1, totalPages: 0, totalItems: 0 },
        error: null,
      };
    }

    return { 
      notes: [], 
      pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }, 
      error: result.error 
    };
  } catch (error) {
    console.error("Error in getNotes:", error);
    return { 
      notes: [], 
      pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }, 
      error: error.message 
    };
  }
}

/**
 * Get a single note by ID
 * @param {number} id - Note ID
 * @returns {Promise} - Promise with note data
 */
async function getNoteById(id) {
  const result = await fetchData(`${API_ENDPOINTS.notes}_read.php?id=${id}`);

  if (result.data) {
    return { note: result.data, error: null };
  }

  return { note: null, error: result.error };
}

/**
 * Create a new note
 * @param {Object} noteData - Note data to create
 * @returns {Promise} - Promise with created note
 */
async function createNote(noteData) {
  // Adapt the noteData to match the PHP backend expectations
  const adaptedData = {
    title: noteData.title,
    content: noteData.content,
    course_id: noteData.course_id || noteData.course, // Support both formats
    user_id: noteData.user_id || 1 // Default user ID if not provided
  };

  const result = await fetchData(`${API_ENDPOINTS.notes}.add.php`, {
    method: "POST",
    body: JSON.stringify(adaptedData),
  });

  return result;
}

/**
 * Update an existing note
 * @param {number} id - Note ID
 * @param {Object} noteData - Updated note data
 * @returns {Promise} - Promise with updated note
 */
async function updateNote(id, noteData) {
  try {
    // Adapt the noteData to match the PHP backend expectations
    const adaptedData = {
      title: noteData.title,
      content: noteData.content,
      course_id: noteData.course_id || noteData.course, // Support both formats
    }

    console.log("Updating note with data:", adaptedData)

    // Declare fetchData and API_ENDPOINTS variables
   
    

    // Use the fetchData function from the module
    const result = await fetchData(`${API_ENDPOINTS.notes}_update.php?id=${id}`, {
      method: "POST", // Use POST as specified in your PHP file
      body: JSON.stringify(adaptedData),
      headers: {
        "Content-Type": "application/json",
      },
    })

    return result
  } catch (error) {
    console.error("Error in updateNote:", error)
    return { data: null, error: error.message }
  }
}



/**
 * Delete a note
 * @param {number} id - Note ID
 * @returns {Promise} - Promise with result
 */
async function deleteNote(id) {
  const result = await fetchData(`${API_ENDPOINTS.notes}_delete.php?id=${id}`, {
    method: "DELETE",
  });

  return result;
}

/**
 * Get all courses
 * @returns {Promise} - Promise with courses data
 */
async function getCourses() {
  // For now, we'll use the hardcoded course data provided in the PHP script
  const coursesData = [
    {"id":"1","course_code":"CS101","course_name":"Introduction to Programming","created_at":"2025-05-14 09:59:07"},
    {"id":"2","course_code":"CS201","course_name":"Data Structures and Algorithms","created_at":"2025-05-14 09:59:07"},
    {"id":"3","course_code":"MATH101","course_name":"Calculus I","created_at":"2025-05-14 09:59:07"},
    {"id":"4","course_code":"PHY201","course_name":"Physics Mechanics","created_at":"2025-05-14 09:59:07"},
    {"id":"5","course_code":"ENG101","course_name":"English Composition","created_at":"2025-05-14 09:59:07"},
    {"id":"6","course_code":"BIO101","course_name":"Introduction to Biology","created_at":"2025-05-14 09:59:07"}
  ];
  
  return { data: coursesData, error: null };
}

/**
 * Get all tags
 * @returns {Promise} - Promise with tags data
 */
async function getTags() {
  const result = await fetchData(API_ENDPOINTS.tags);
  
  if (result.data) {
    return { tags: result.data.tags || [], error: null };
  }
  
  return { tags: [], error: result.error };
}

/**
 * Login user
 * @param {Object} credentials - User credentials (email and password)
 * @returns {Promise} - Promise with user data and token
 */
async function login(credentials) {
  const result = await fetchData(`${API_ENDPOINTS.auth}/login`, {
    method: "POST",
    body: JSON.stringify(credentials),
  });

  if (result.data && result.data.success) {
    // Store token in localStorage
    localStorage.setItem("auth_token", result.data.token);
    localStorage.setItem("current_user", JSON.stringify(result.data.user));
  }

  return result;
}

/**
 * Register new user
 * @param {Object} userData - User data
 * @returns {Promise} - Promise with user data and token
 */
async function register(userData) {
  const result = await fetchData(`${API_ENDPOINTS.auth}/register`, {
    method: "POST",
    body: JSON.stringify(userData),
  });

  if (result.data && result.data.success) {
    // Store token in localStorage
    localStorage.setItem("auth_token", result.data.token);
    localStorage.setItem("current_user", JSON.stringify(result.data.user));
  }

  return result;
}

/**
 * Logout user
 * @returns {void}
 */
function logout() {
  localStorage.removeItem("auth_token");
  localStorage.removeItem("current_user");
  window.location.href = "/index.html";
}

/**
 * Get current user
 * @returns {Object|null} - Current user object or null if not logged in
 */
function getCurrentUser() {
  const userJSON = localStorage.getItem("current_user");
  return userJSON ? JSON.parse(userJSON) : null;
}

/**
 * Check if user is logged in
 * @returns {boolean} - True if user is logged in, false otherwise
 */
function isLoggedIn() {
  return !!getAuthToken();
}

/**
 * Add comment to a note
 * @param {number} noteId - Note ID
 * @param {Object} commentData - Comment data
 * @returns {Promise} - Promise with created comment
 */
async function addComment(noteId, commentData) {
  const result = await fetchData(`${API_ENDPOINTS.notes}/${noteId}/comments`, {
    method: "POST",
    body: JSON.stringify(commentData),
  });

  return result;
}

export { 
  getNotes, 
  getNoteById, 
  createNote, 
  updateNote, 
  deleteNote, 
  getCourses,
  getTags,
  login, 
  register,
  logout,
  getCurrentUser,
  isLoggedIn,
  addComment
}