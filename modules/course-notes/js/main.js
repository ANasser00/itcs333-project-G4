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
  const paginationContainer = document.querySelector("#pagination-container") || document.querySelector(".flex.justify-center.mt-12")
  
  console.log("Pagination container found:", paginationContainer !== null)

  // Define notes per page constant
  const NOTES_PER_PAGE = 6;
  
  // Store all notes for client-side pagination
  let allNotes = [];
  
  // Initial load of all notes
  await loadAllNotes();
  
  // Then display the first page
  displayNotesForCurrentPage();

  // Load all notes once
  async function loadAllNotes() {
    try {
      document.dispatchEvent(new CustomEvent("loading:start"));
      
      // Fetch all notes at once (no pagination in API call)
      const result = await getNotes(
        {},   // no filters
        1,    // page 1
        100   // large limit to get all notes
      );

      if (result.error) {
        throw new Error(result.error);
      }

      // Store all notes
      allNotes = result.notes || [];
      
      // Calculate total pages
      const totalPages = Math.ceil(allNotes.length / NOTES_PER_PAGE);
      
      // Update pagination state
      state.pagination = {
        currentPage: 1,
        totalPages: Math.max(totalPages, 1), // At least 1 page
        totalItems: allNotes.length
      };
      
      console.log(`Loaded ${allNotes.length} total notes, calculated ${state.pagination.totalPages} pages`);
      
      document.dispatchEvent(new CustomEvent("loading:end"));
    } catch (error) {
      console.error("Error loading notes:", error);
      document.dispatchEvent(new CustomEvent("loading:end"));
      
      if (notesContainer) {
        notesContainer.innerHTML = `
          <div class="text-center py-8 col-span-3">
            <p class="text-red-500">Error loading notes. Please try again later.</p>
          </div>
        `;
      }
    }
  }

  // Display notes for the current page
  function displayNotesForCurrentPage() {
    // Calculate start and end indices for current page
    const startIndex = (state.pagination.currentPage - 1) * NOTES_PER_PAGE;
    const endIndex = startIndex + NOTES_PER_PAGE;
    
    // Get notes for current page
    state.notes = allNotes.slice(startIndex, endIndex);
    
    console.log(`Displaying page ${state.pagination.currentPage}: notes ${startIndex+1} to ${Math.min(endIndex, allNotes.length)} of ${allNotes.length}`);

    // Update UI
    if (notesContainer) {
      // Check if there are notes to display for this page
      if (state.notes && state.notes.length > 0) {
        renderNotesList(state.notes, notesContainer);
      } else {
        // Display "No more notes" message when page has no notes
        notesContainer.innerHTML = `
          <div class="col-span-3 text-center py-12">
            <svg xmlns="http://www.w3.org/2000/svg" class="h-16 w-16 text-gray-300 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
            <h3 class="text-xl font-medium text-gray-500">No more notes</h3>
            <p class="text-gray-400 mt-2">There are no notes available on this page.</p>
            <button onclick="window.location.href='index.html'" class="mt-4 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors">
              Back to first page
            </button>
          </div>
        `;
      }
    }

    if (paginationContainer) {
      renderPagination(state.pagination, handlePageChange, paginationContainer);
    }

    // Update stats
    updateStats();
  }

  // Handle pagination
  function handlePageChange(page) {
    console.log("Page changed to:", page);
    state.pagination.currentPage = page;
    displayNotesForCurrentPage();
    document.getElementById("notes").scrollIntoView({ behavior: "smooth" });
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

  if (totalNotesElement) {
    totalNotesElement.textContent = state.pagination.totalItems || '0'
  }
  
  if (totalCoursesElement) {
    // Get unique course codes from all notes
    const uniqueCourses = new Set()
    
    // Use the notes we have in the current state
    if (state.notes && state.notes.length > 0) {
      state.notes.forEach(note => {
        if (note.course) {
          uniqueCourses.add(note.course)
        }
      })
    }
    
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
