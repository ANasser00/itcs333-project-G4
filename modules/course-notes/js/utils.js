/**
 * Utility functions for Course Notes application
 */

/**
 * Get URL parameters as an object
 * @returns {Object} - URL parameters as key-value pairs
 */
function getUrlParams() {
    const params = {}
    const queryString = window.location.search.substring(1)
    const pairs = queryString.split("&")
  
    for (const pair of pairs) {
      const [key, value] = pair.split("=")
      if (key) {
        params[decodeURIComponent(key)] = decodeURIComponent(value || "")
      }
    }
  
    return params
  }
  
  /**
   * Format date to readable string
   * @param {string} dateString - ISO date string
   * @param {Object} options - Intl.DateTimeFormat options
   * @returns {string} - Formatted date string
   */
  function formatDate(dateString, options = {}) {
    const defaultOptions = {
      year: "numeric",
      month: "long",
      day: "numeric",
    }
  
    const dateOptions = { ...defaultOptions, ...options }
  
    return new Date(dateString).toLocaleDateString("en-US", dateOptions)
  }
  
  /**
   * Truncate text to specified length
   * @param {string} text - Text to truncate
   * @param {number} length - Maximum length
   * @returns {string} - Truncated text
   */
  function truncateText(text, length = 100) {
    if (!text || text.length <= length) {
      return text
    }
  
    return text.substring(0, length) + "..."
  }
  
  /**
   * Debounce function to limit function calls
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @returns {Function} - Debounced function
   */
  function debounce(func, wait = 300) {
    let timeout
  
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout)
        func(...args)
      }
  
      clearTimeout(timeout)
      timeout = setTimeout(later, wait)
    }
  }
  
  /**
   * Generate a random ID
   * @returns {string} - Random ID
   */
  function generateId() {
    return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15)
  }
  
  /**
   * Store data in localStorage
   * @param {string} key - Storage key
   * @param {*} data - Data to store
   */
  function storeData(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify(data))
    } catch (error) {
      console.error("Error storing data:", error)
    }
  }
  
  /**
   * Retrieve data from localStorage
   * @param {string} key - Storage key
   * @returns {*} - Retrieved data
   */
  function retrieveData(key) {
    try {
      const data = localStorage.getItem(key)
      return data ? JSON.parse(data) : null
    } catch (error) {
      console.error("Error retrieving data:", error)
      return null
    }
  }
  
  export { getUrlParams, formatDate, truncateText, debounce, generateId, storeData, retrieveData }
  