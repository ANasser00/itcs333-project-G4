import { deleteNote } from "./api.js";

/**
 * UI components and interactions for Course Notes application
 * Handles rendering, UI state, and user interactions
 */

/**
 * Initialize loading indicator
 */
function initLoadingIndicator() {
    // Create loading overlay if it doesn't exist
    if (!document.getElementById("loading-overlay")) {
      const loadingOverlay = document.createElement("div")
      loadingOverlay.id = "loading-overlay"
      loadingOverlay.className = "fixed inset-0 bg-gray-900 bg-opacity-50 flex items-center justify-center z-50 hidden"
      loadingOverlay.innerHTML = `
        <div class="bg-white p-5 rounded-lg shadow-lg flex items-center">
          <svg class="animate-spin h-6 w-6 text-blue-500 mr-3" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
            <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span class="text-gray-700 font-medium">Loading...</span>
        </div>
      `
      document.body.appendChild(loadingOverlay)
    }
  
    // Add event listeners for loading states
    document.addEventListener("loading:start", () => {
      document.getElementById("loading-overlay").classList.remove("hidden")
    })
  
    document.addEventListener("loading:end", () => {
      document.getElementById("loading-overlay").classList.add("hidden")
    })
  }
  
  /**
   * Render note cards in the notes list
   * @param {Array} notes - Array of note objects
   * @param {HTMLElement} container - Container element to render notes in
   */
  function renderNotesList(notes, container) {
    if (!container) return
  
    // Clear container
    container.innerHTML = ""
  
    if (notes.length === 0) {
      container.innerHTML = `
        <div class="text-center py-8 col-span-3">
          <p class="text-secondary-600">No notes found. Try adjusting your filters or create a new note.</p>
        </div>
      `
      return
    }
  
    // Render each note
    notes.forEach((note) => {
      const noteCard = document.createElement("article")
      noteCard.className =
        "bg-white rounded-xl shadow-soft overflow-hidden hover:shadow-lg transition-shadow duration-300 border border-gray-100"
      noteCard.innerHTML = `
        <div class="p-6">
          <div class="flex justify-between items-start mb-3">
            <div>
              <span class="inline-block bg-${note.courseColor}-100 text-${note.courseColor}-800 text-xs font-medium px-2.5 py-0.5 rounded-full mb-2">${note.course}</span>
              <h3 class="text-xl font-semibold text-secondary-800 hover:text-blue-600 transition-colors">
                <a href="pages/detail.html?id=${note.id}">${note.title}</a>
              </h3>
            </div>
            <button class="text-secondary-400 hover:text-secondary-600 transition-colors">
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
              </svg>
            </button>
          </div>
          <p class="text-secondary-600 mb-4 line-clamp-3">${note.content}</p>
        </div>
      `
  
      container.appendChild(noteCard)
    })
  }
  
  /**
   * Render pagination controls
   * @param {Object} pagination - Pagination data
   * @param {Function} onPageChange - Callback for page change
   * @param {HTMLElement} container - Container element for pagination
   */
  function renderPagination(pagination, onPageChange, container) {
    if (!container) return
  
    const { currentPage, totalPages } = pagination
  
    // Clear container
    container.innerHTML = ""
  
    if (totalPages <= 1) {
      return
    }
  
    // Create pagination element
    const paginationNav = document.createElement("nav")
    paginationNav.className = "inline-flex rounded-md shadow-sm -space-x-px"
    paginationNav.setAttribute("aria-label", "Pagination")
  
    // Previous button
    const prevButton = document.createElement("a")
    prevButton.href = "#"
    prevButton.className = `relative inline-flex items-center px-2 py-2 rounded-l-md border ${currentPage === 1 ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`
    prevButton.innerHTML = `
      <span class="sr-only">Previous</span>
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
      </svg>
    `
  
    if (currentPage > 1) {
      prevButton.addEventListener("click", (e) => {
        e.preventDefault()
        onPageChange(currentPage - 1)
      })
    }
  
    paginationNav.appendChild(prevButton)
  
    // Page numbers
    const maxPagesToShow = 5
    let startPage = Math.max(1, currentPage - Math.floor(maxPagesToShow / 2))
    const endPage = Math.min(totalPages, startPage + maxPagesToShow - 1)
  
    if (endPage - startPage + 1 < maxPagesToShow) {
      startPage = Math.max(1, endPage - maxPagesToShow + 1)
    }
  
    // First page if not in range
    if (startPage > 1) {
      const firstPageBtn = document.createElement("a")
      firstPageBtn.href = "#"
      firstPageBtn.className =
        "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      firstPageBtn.textContent = "1"
      firstPageBtn.addEventListener("click", (e) => {
        e.preventDefault()
        onPageChange(1)
      })
      paginationNav.appendChild(firstPageBtn)
  
      if (startPage > 2) {
        const ellipsis = document.createElement("span")
        ellipsis.className =
          "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
        ellipsis.textContent = "..."
        paginationNav.appendChild(ellipsis)
      }
    }
  
    // Page numbers
    for (let i = startPage; i <= endPage; i++) {
      const pageBtn = document.createElement("a")
      pageBtn.href = "#"
      pageBtn.className = `relative inline-flex items-center px-4 py-2 border ${i === currentPage ? "border-blue-500 bg-blue-50 text-blue-600" : "border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"}`
      pageBtn.textContent = i.toString()
  
      if (i !== currentPage) {
        pageBtn.addEventListener("click", (e) => {
          e.preventDefault()
          onPageChange(i)
        })
      }
  
      paginationNav.appendChild(pageBtn)
    }
  
    // Last page if not in range
    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        const ellipsis = document.createElement("span")
        ellipsis.className =
          "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700"
        ellipsis.textContent = "..."
        paginationNav.appendChild(ellipsis)
      }
  
      const lastPageBtn = document.createElement("a")
      lastPageBtn.href = "#"
      lastPageBtn.className =
        "relative inline-flex items-center px-4 py-2 border border-gray-300 bg-white text-sm font-medium text-gray-700 hover:bg-gray-50"
      lastPageBtn.textContent = totalPages.toString()
      lastPageBtn.addEventListener("click", (e) => {
        e.preventDefault()
        onPageChange(totalPages)
      })
      paginationNav.appendChild(lastPageBtn)
    }
  
    // Next button
    const nextButton = document.createElement("a")
    nextButton.href = "#"
    nextButton.className = `relative inline-flex items-center px-2 py-2 rounded-r-md border ${currentPage === totalPages ? "border-gray-300 bg-gray-100 text-gray-400 cursor-not-allowed" : "border-gray-300 bg-white text-gray-500 hover:bg-gray-50"}`
    nextButton.innerHTML = `
      <span class="sr-only">Next</span>
      <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
        <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
      </svg>
    `
  
    if (currentPage < totalPages) {
      nextButton.addEventListener("click", (e) => {
        e.preventDefault()
        onPageChange(currentPage + 1)
      })
    }
  
    paginationNav.appendChild(nextButton)
    container.appendChild(paginationNav)
  }
  
  /**
   * Render note details in the detail view
   * @param {Object} note - Note object
   * @param {HTMLElement} container - Container element for note details
   */
  function renderNoteDetail(note, container) {
    if (!container || !note) return
  
    const createdDate = new Date(note.created_at).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    })
  
    // Set page title
    document.title = `${note.title} - CourseNotes`
  
    // Render note details
    container.innerHTML = `
      <article class="bg-white rounded-xl shadow-soft overflow-hidden">
        <div class="p-6">
          <div class="flex flex-col md:flex-row justify-between items-start md:items-center mb-6">
            <div>
              <div class="flex items-center mb-2">
                <h2 class="text-3xl font-bold text-secondary-800 mr-3">${note.title}</h2>
                <span class="bg-${note.courseColor}-100 text-${note.courseColor}-800 text-xs font-medium px-2.5 py-0.5 rounded-full">${note.course}</span>
              </div>
              <div class="flex items-center text-sm text-secondary-500">
                <span class="mr-4">Created: ${createdDate}</span>
              </div>
            </div>
            <div class="flex space-x-2 mt-4 md:mt-0">
              <button class="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 text-secondary-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
                Save
              </button>
              <a href="#" class="flex items-center px-3 py-1.5 border border-gray-300 rounded-md hover:bg-gray-100 text-secondary-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                </svg>
                Edit
              </a>
              <button id="delete-note" class="flex items-center px-3 py-1.5 border border-red-300 rounded-md hover:bg-red-50 text-red-700 transition-colors">
                <svg xmlns="http://www.w3.org/2000/svg" class="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                </svg>
                Delete
              </button>
            </div>
          </div>
  
          <div class="prose max-w-none">
            ${note.content
              .split("\n")
              .map((paragraph) => `<p class="text-secondary-700 mb-4">${paragraph}</p>`)
              .join("")}
          </div>
              </div>
            </div>
        </div>
      </article>
    `

    document.getElementById("delete-note").addEventListener("click", () => {
      const result = deleteNote(note.id)
      if (result.error) {
        alert(result.error)
      } else {
        alert("Note deleted successfully")
        window.location.href = "../index.html"
      }
    })
  
    // Render comments section
    if (note.comments && note.comments.length > 0) {
      const commentsSection = document.createElement("section")
      commentsSection.className = "mt-8"
      commentsSection.innerHTML = `
        <h3 class="text-xl font-semibold mb-4">Comments (${note.comments.length})</h3>
        
        <div class="bg-white rounded-lg shadow-soft p-6 mb-6">
          <form id="comment-form">
            <label for="comment" class="block text-sm font-medium text-secondary-700 mb-2">Add a comment</label>
            <textarea id="comment" name="comment" rows="3" placeholder="Write your comment here..." 
                class="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 mb-3 transition-colors"></textarea>
            <div class="flex justify-end">
              <button type="submit" class="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors">
                Post Comment
              </button>
            </div>
          </form>
        </div>
  
        <div class="space-y-6">
          ${note.comments
            .map(
              (comment) => `
            <article class="bg-white rounded-lg shadow-soft p-6 hover:translate-x-1 transition-transform">
              <div class="flex justify-between items-start">
                <div class="flex items-center">
                  <div class="h-10 w-10 rounded-full bg-gray-300 flex items-center justify-center text-gray-600 font-semibold mr-4">${comment.initials}</div>
                  <div>
                    <h4 class="font-medium">${comment.name}</h4>
                    <p class="text-sm text-secondary-500">${new Date(comment.date).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })} at ${new Date(comment.date).toLocaleTimeString("en-US", { hour: "numeric", minute: "numeric" })}</p>
                  </div>
                </div>
                <button class="text-secondary-400 hover:text-secondary-600 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M6 10a2 2 0 11-4 0 2 2 0 014 0zM12 10a2 2 0 11-4 0 2 2 0 014 0zM16 12a2 2 0 100-4 2 2 0 000 4z" />
                  </svg>
                </button>
              </div>
              <div class="mt-3">
                <p>${comment.body}</p>
              </div>
            </article>
          `,
            )
            .join("")}
        </div>
      `
  
      container.parentNode.appendChild(commentsSection)
    }
  }
  
  /**
   * Initialize form validation for the create note form
   * @param {HTMLFormElement} form - Form element to validate
   */
  function initFormValidation(form) {
    if (!form) return
  
    const titleInput = form.querySelector("#title")
    const contentInput = form.querySelector("#content")
    const courseSelect = form.querySelector("#course")
    const tagsInput = form.querySelector("#tags")
  
    // Create error message elements
    const createErrorElement = (id) => {
      const errorElement = document.createElement("p")
      errorElement.id = id
      errorElement.className = "text-red-500 text-sm mt-1 hidden"
      return errorElement
    }
  
    // Add error elements after inputs
    const titleError = createErrorElement("title-error")
    titleInput.parentNode.appendChild(titleError)
  
    const contentError = createErrorElement("content-error")
    contentInput.parentNode.appendChild(contentError)
  
    const courseError = createErrorElement("course-error")
    courseSelect.parentNode.appendChild(courseError)
  
    // Validation functions
    const validateTitle = () => {
      if (!titleInput.value.trim()) {
        titleError.textContent = "Title is required"
        titleError.classList.remove("hidden")
        titleInput.classList.add("border-red-300")
        return false
      } else if (titleInput.value.trim().length < 3) {
        titleError.textContent = "Title must be at least 3 characters"
        titleError.classList.remove("hidden")
        titleInput.classList.add("border-red-300")
        return false
      } else {
        titleError.classList.add("hidden")
        titleInput.classList.remove("border-red-300")
        return true
      }
    }
  
    const validateContent = () => {
      if (!contentInput.value.trim()) {
        contentError.textContent = "Content is required"
        contentError.classList.remove("hidden")
        contentInput.classList.add("border-red-300")
        return false
      } else if (contentInput.value.trim().length < 10) {
        contentError.textContent = "Content must be at least 10 characters"
        contentError.classList.remove("hidden")
        contentInput.classList.add("border-red-300")
        return false
      } else {
        contentError.classList.add("hidden")
        contentInput.classList.remove("border-red-300")
        return true
      }
    }
  
    const validateCourse = () => {
      if (!courseSelect.value) {
        courseError.textContent = "Please select a course"
        courseError.classList.remove("hidden")
        courseSelect.classList.add("border-red-300")
        return false
      } else {
        courseError.classList.add("hidden")
        courseSelect.classList.remove("border-red-300")
        return true
      }
    }
  
    // Add event listeners for real-time validation
    titleInput.addEventListener("blur", validateTitle)
    contentInput.addEventListener("blur", validateContent)
    courseSelect.addEventListener("change", validateCourse)
  
    // Form submission
    form.addEventListener("submit", (e) => {
      e.preventDefault()
  
      const isValidTitle = validateTitle()
      const isValidContent = validateContent()
      const isValidCourse = validateCourse()
  
      if (isValidTitle && isValidContent && isValidCourse) {
        // Form is valid, show success message
        const successMessage = document.createElement("div")
        successMessage.className = "bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4"
        successMessage.innerHTML = `
          <strong class="font-bold">Success!</strong>
          <span class="block sm:inline"> Your note has been created.</span>
        `
  
        form.prepend(successMessage)
  
        // Reset form after 2 seconds
        setTimeout(() => {
          form.reset()
          successMessage.remove()
        }, 2000)
      }
    })
  }
  
  /**
   * Initialize search functionality
   * @param {HTMLElement} searchForm - Search form element
   * @param {Function} onSearch - Callback for search
   */
  function initSearch(searchForm, onSearch) {
    if (!searchForm) return
  
    const searchInput = searchForm.querySelector('input[type="search"]')
  
    searchForm.addEventListener("submit", (e) => {
      e.preventDefault()
      onSearch({ query: searchInput.value.trim() })
    })
  
    // Debounce search input
    let debounceTimeout
    searchInput.addEventListener("input", () => {
      clearTimeout(debounceTimeout)
      debounceTimeout = setTimeout(() => {
        onSearch({ query: searchInput.value.trim() })
      }, 500)
    })
  }
  
  /**
   * Initialize filter functionality
   * @param {NodeList} filterButtons - Filter buttons
   * @param {Function} onFilter - Callback for filter
   */
  function initFilters(filterButtons, onFilter) {
    if (!filterButtons || !filterButtons.length) return
  
    filterButtons.forEach((button) => {
      button.addEventListener("click", () => {
        // Remove active class from all buttons
        filterButtons.forEach((btn) => {
          btn.classList.remove("bg-blue-500", "text-white")
          btn.classList.add("bg-white", "text-secondary-700", "hover:bg-gray-100")
        })
  
        // Add active class to clicked button
        button.classList.remove("bg-white", "text-secondary-700", "hover:bg-gray-100")
        button.classList.add("bg-blue-500", "text-white")
  
        // Get filter value
        const filter = button.textContent.trim()
        onFilter({ course: filter === "All" ? null : filter })
      })
    })
  }
  
  /**
   * Initialize sorting functionality
   * @param {HTMLElement} sortButton - Sort button
   * @param {Function} onSort - Callback for sort
   */
  function initSort(sortButton, onSort) {
    if (!sortButton) return
  
    const sortOptions = [
      { value: "newest", label: "Newest First" },
      { value: "oldest", label: "Oldest First" },
      { value: "title_asc", label: "Title (A-Z)" },
      { value: "title_desc", label: "Title (Z-A)" },
    ]
  
    // Create sort dropdown
    const dropdown = document.createElement("div")
    dropdown.className =
      "absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden z-10"
    dropdown.setAttribute("role", "menu")
    dropdown.setAttribute("aria-orientation", "vertical")
    dropdown.setAttribute("aria-labelledby", "sort-menu")
  
    dropdown.innerHTML = `
      <div class="py-1" role="none">
        ${sortOptions
          .map(
            (option) => `
          <button class="sort-option block w-full text-left px-4 py-2 text-sm text-secondary-700 hover:bg-gray-100" role="menuitem" data-value="${option.value}">
            ${option.label}
          </button>
        `,
          )
          .join("")}
      </div>
    `
  
    // Add dropdown to DOM
    sortButton.parentNode.appendChild(dropdown)
  
    // Toggle dropdown
    sortButton.addEventListener("click", () => {
      dropdown.classList.toggle("hidden")
    })
  
    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!sortButton.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add("hidden")
      }
    })
  
    // Handle sort option click
    dropdown.querySelectorAll(".sort-option").forEach((option) => {
      option.addEventListener("click", () => {
        dropdown.classList.add("hidden")
        onSort({ sort: option.dataset.value })
  
        // Update button text
        const sortLabel = sortOptions.find((opt) => opt.value === option.dataset.value).label
        sortButton.querySelector("span").textContent = sortLabel
      })
    })
  }
  
  /**
   * Update stats in the UI
   * @param {Object} stats - Stats data
   */
  function updateStats(stats) {
    const totalNotesElement = document.querySelector(".stats-total-notes")
    if (totalNotesElement) {
      totalNotesElement.textContent = stats.totalNotes || "0"
    }
  
    const totalCoursesElement = document.querySelector(".stats-total-courses")
    if (totalCoursesElement && stats.totalCourses) {
      totalCoursesElement.textContent = stats.totalCourses
    }
  
    const totalSharedElement = document.querySelector(".stats-total-shared")
    if (totalSharedElement) {
      totalSharedElement.textContent = stats.totalShared || "0"
    }
  }
  
  export {
    initLoadingIndicator,
    renderNotesList,
    renderPagination,
    renderNoteDetail,
    initFormValidation,
    initSearch,
    initFilters,
    initSort,
    updateStats,
  }
  