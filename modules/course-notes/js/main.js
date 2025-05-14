/**
 * Main application logic for Course Notes
 * Initializes and connects all components
 */
import { getNotes, getNoteById, getCourses, createNote } from "./api.js"
import {
  initLoadingIndicator,
  renderNotesList,
  renderPagination,
  renderNoteDetail
} from "./ui.js"
import { getUrlParams } from "./utils.js"

// Application state
const state = {
  notes: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0
  }
}

/**
 * Initialize the notes listing page
 */
async function initNotesListingPage() {
  console.log("Initializing notes listing page")

  // Initialize UI components
  initLoadingIndicator()

  // Get DOM elements
  const notesContainer = document.querySelector(".grid.grid-cols-1.md\\:grid-cols-2.lg\\:grid-cols-3.gap-6")
  const paginationContainer = document.querySelector(".flex.justify-center.mt-12")

  // Load initial notes
  await loadNotes()

  // Handle pagination
  function handlePageChange(page) {
    state.pagination.currentPage = page
    loadNotes()
    document.getElementById("notes").scrollIntoView({ behavior: "smooth" })
  }

  // Load notes
  async function loadNotes() {
    try {
      const result = await getNotes(
        {},                           // no filters
        state.pagination.currentPage, // page
        9                             // limit
      )

      if (result.error) {
        throw new Error(result.error)
      }

      // Update state
      state.notes = result.notes
      state.pagination = result.pagination

      // Update UI
      if (notesContainer) {
        renderNotesList(state.notes, notesContainer)
      }

      if (paginationContainer) {
        renderPagination(state.pagination, handlePageChange, paginationContainer)
      }

      // Update stats
      updateStats()
    } catch (error) {
      console.error("Error loading notes:", error)
      if (notesContainer) {
        notesContainer.innerHTML = `
          <div class="text-center py-8 col-span-3">
            <p class="text-red-500">Error loading notes. Please try again later.</p>
          </div>
        `
      }
    }
  }
}

/**
 * Initialize the note detail page
 */
async function initNoteDetailPage() {
  console.log("Initializing note detail page")

  // Initialize UI components
  initLoadingIndicator()

  // Get note ID from URL
  const params = getUrlParams()
  const noteId = params.id

  if (!noteId) {
    window.location.href = "../index.html"
    return
  }

  // Get DOM elements
  const noteDetailContainer = document.querySelector("section article").parentNode

  // Load note details
  try {
    const result = await getNoteById(noteId)

    if (result.error) {
      throw new Error(result.error)
    }

    // Clear existing content
    noteDetailContainer.innerHTML = ""

    // Render note details
    renderNoteDetail(result.note, noteDetailContainer)
  } catch (error) {
    console.error("Error loading note details:", error)
    noteDetailContainer.innerHTML = `
      <div class="bg-white rounded-xl shadow-soft p-6">
        <div class="text-center py-8">
          <p class="text-red-500">Error loading note details. Please try again later.</p>
          <a href="../index.html" class="inline-block mt-4 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700">
            Back to Notes
          </a>
        </div>
      </div>
    `
  }
}

async function initNoteAddPage() {
  console.log("Initializing note add page")

  // Initialize UI components
  initLoadingIndicator()

  // Get DOM elements
  const courseSelect = document.getElementById("course")
  const createNoteForm = document.getElementById("create-note-form")

  // Load courses and populate dropdown
  await loadCourses()

  // Add form submit handler
  if (createNoteForm) {
    createNoteForm.addEventListener("submit", handleFormSubmit)
  }

  // Load courses and populate dropdown
  async function loadCourses() {
    try {
      const result = await getCourses()

      if (result.error) {
        throw new Error(result.error)
      }

      // Populate course dropdown
      if (courseSelect && result.data) {
        // Clear existing options
        courseSelect.innerHTML = '<option value="">Select a course</option>'

        // Add course options
        result.data.forEach(course => {
          const option = document.createElement("option")
          option.value = course.id
          option.textContent = `${course.course_code} - ${course.course_name}`
          courseSelect.appendChild(option)
        })
      }
    } catch (error) {
      console.error("Error loading courses:", error)
      if (courseSelect) {
        courseSelect.innerHTML = '<option value="">Error loading courses</option>'
      }
    }
  }

  // Handle form submission
  async function handleFormSubmit(event) {
    event.preventDefault()

    // Get form data
    const formData = new FormData(createNoteForm)
    const noteData = {
      title: formData.get("title"),
      content: formData.get("content"),
      course_id: formData.get("course"),
    }

    try {
      // Create note
      const result = await createNote(noteData)

      if (result.error) {
        throw new Error(result.error)
      }

      // Show success message
      alert("Note created successfully!")

      // Redirect to notes listing
      window.location.href = "../index.html"
    } catch (error) {
      console.error("Error creating note:", error)
      alert(`Error creating note: ${error.message}`)
    }
  }
}

/**
 * Update the stats section with total notes and unique courses
 */
function updateStats() {
  const totalNotesElement = document.querySelector('.stats-total-notes')
  const totalCoursesElement = document.querySelector('.stats-total-courses')

  const totalNotes = state.notes.length;
  if (totalNotesElement) {
    totalNotesElement.textContent = totalNotes || '0'
  }
  
  if (totalCoursesElement && state.notes.length > 0) {
    // Get unique course codes
    const uniqueCourses = new Set(state.notes.map(note => note.course || '').filter(Boolean))
    totalCoursesElement.textContent = uniqueCourses.size.toString()
  }
}

/**
 * Initialize the application based on current page
 */
function initApp() {
  // Determine current page
  const currentPath = window.location.pathname

  if (currentPath.includes("index.html") || currentPath.endsWith("/") || currentPath.endsWith("/course-notes/")) {
    initNotesListingPage()
  } else if (currentPath.includes("detail.html")) {
    initNoteDetailPage()
  } else if (currentPath.includes("create.html")) {
    initNoteAddPage()
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)