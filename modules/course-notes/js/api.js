/**
 * API integration for Course Notes application
 * Handles data fetching, error handling, and data transformation
 */

// API endpoints
const API_ENDPOINTS = {
    notes: "https://jsonplaceholder.typicode.com/posts",
    users: "https://jsonplaceholder.typicode.com/users",
    comments: "https://jsonplaceholder.typicode.com/comments",
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
  
      const response = await fetch(endpoint, options)
  
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`)
      }
  
      const data = await response.json()
  
      // End loading state
      document.dispatchEvent(new CustomEvent("loading:end"))
  
      return { data, error: null, headers: response.headers }
    } catch (error) {
      console.error("Fetch error:", error)
  
      // End loading state
      document.dispatchEvent(new CustomEvent("loading:end"))
  
      return { data: null, error: error.message }
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
    // Build query parameters
    const queryParams = new URLSearchParams()
    if (!fetchAll) {
      queryParams.append("_page", page)
      queryParams.append("_limit", limit)
    }else{
        queryParams.append("_limit", 500)
    }
  
    // Add filters to query params
    Object.entries(filters).forEach(([key, value]) => {
      if (value && key !== "course") queryParams.append(key, value)
    })
  
    const url = `${API_ENDPOINTS.notes}?${queryParams.toString()}`
    const result = await fetchData(url)
  
    // Transform data to match our application needs
    if (result.data) {
      // Get total count from headers
      const totalCount = result.headers ? Number.parseInt(result.headers.get("x-total-count") || "0") : 0
  
      // Course mapping
      const courseTypes = ["Computer Science", "Mathematics", "History", "Literature", "Science", "Chemistry"]
      const courseColors = ["green", "blue", "yellow", "purple", "red", "teal"]
  
      // Transform API data to our note format
      let notes = result.data.map((item) => {
        // Assign a consistent course type based on the item ID to ensure consistency
        const courseIndex = item.id % courseTypes.length
  
        return {
          id: item.id,
          title: item.title,
          content: item.body,
          courseId: courseIndex + 1,
          courseType: courseTypes[courseIndex],
          courseColor: courseColors[courseIndex],
          tags: generateRandomTags(),
          createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
          updatedAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
          pages: Math.floor(Math.random() * 20) + 1,
        }
      })
  
      // Apply course filter if specified
      if (filters.course && filters.course !== "All") {
        notes = notes.filter((note) => note.courseType === filters.course)
      }
  
      return {
        notes,
        pagination: {
          currentPage: page,
          totalPages: Math.ceil(totalCount / limit),
          totalItems: totalCount, // Use totalCount from headers instead of notes.length
        },
        error: null,
      }
    }
  
    return { notes: [], pagination: { currentPage: 1, totalPages: 0, totalItems: 0 }, error: result.error }
  }
  
  /**
   * Get a single note by ID
   * @param {number} id - Note ID
   * @returns {Promise} - Promise with note data
   */
  async function getNoteById(id) {
    const result = await fetchData(`${API_ENDPOINTS.notes}/${id}`)
  
    if (result.data) {
      // Course mapping - ensure consistent course type based on ID
      const courseTypes = ["Computer Science", "Mathematics", "History", "Literature", "Science", "Chemistry"]
      const courseColors = ["green", "blue", "yellow", "purple", "red", "teal"]
      const courseIndex = result.data.id % courseTypes.length
  
      // Transform API data to our note format
      const note = {
        id: result.data.id,
        title: result.data.title,
        content: result.data.body,
        courseId: courseIndex + 1,
        courseType: courseTypes[courseIndex],
        courseColor: courseColors[courseIndex],
        tags: generateRandomTags(),
        createdAt: new Date(Date.now() - Math.floor(Math.random() * 10000000000)).toISOString(),
        updatedAt: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
        pages: Math.floor(Math.random() * 20) + 1,
        // Additional details for the detail view
        attachments: generateRandomAttachments(),
      }
  
      // Get comments for this note
      const commentsResult = await fetchData(`${API_ENDPOINTS.comments}?postId=${id}`)
      if (commentsResult.data) {
        note.comments = commentsResult.data.map((comment) => ({
          id: comment.id,
          name: comment.name,
          email: comment.email,
          body: comment.body,
          date: new Date(Date.now() - Math.floor(Math.random() * 5000000000)).toISOString(),
          initials: getInitials(comment.name),
        }))
      } else {
        note.comments = []
      }
  
      return { note, error: null }
    }
  
    return { note: null, error: result.error }
  }
  
  /**
   * Create a new note
   * @param {Object} noteData - Note data to create
   * @returns {Promise} - Promise with created note
   */
  async function createNote(noteData) {
    const result = await fetchData(API_ENDPOINTS.notes, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(noteData),
    })
  
    return result
  }
  
  /**
   * Generate random tags for mock data
   * @returns {Array} - Array of random tags
   */
  function generateRandomTags() {
    const allTags = [
      "algorithms",
      "sorting",
      "big o",
      "calculus",
      "integration",
      "math",
      "history",
      "literature",
      "physics",
      "chemistry",
      "biology",
      "frontend",
      "frameworks",
      "web",
      "renaissance",
      "art",
      "europe",
      "organic",
      "reactions",
      "shakespeare",
      "tragedy",
      "analysis",
    ]
    const numTags = Math.floor(Math.random() * 3) + 1
    const tags = []
  
    for (let i = 0; i < numTags; i++) {
      const randomIndex = Math.floor(Math.random() * allTags.length)
      if (!tags.includes(allTags[randomIndex])) {
        tags.push(allTags[randomIndex])
      }
    }
  
    return tags
  }
  
  /**
   * Generate random attachments for mock data
   * @returns {Array} - Array of random attachments
   */
  function generateRandomAttachments() {
    const attachmentTypes = ["pdf", "doc", "jpg", "png"]
    const attachmentNames = ["lecture_notes", "summary", "cheatsheet", "diagram", "example", "practice_problems"]
    const numAttachments = Math.floor(Math.random() * 3)
    const attachments = []
  
    for (let i = 0; i < numAttachments; i++) {
      const type = attachmentTypes[Math.floor(Math.random() * attachmentTypes.length)]
      const name = attachmentNames[Math.floor(Math.random() * attachmentNames.length)]
      attachments.push({
        id: i + 1,
        name: `${name}_${i + 1}.${type}`,
        type,
        size: `${Math.floor(Math.random() * 5) + 1} MB`,
      })
    }
  
    return attachments
  }
  
  /**
   * Get initials from a name
   * @param {string} name - Full name
   * @returns {string} - Initials
   */
  function getInitials(name) {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .join("")
      .substring(0, 2)
  }
  
  export { getNotes, getNoteById, createNote }
  