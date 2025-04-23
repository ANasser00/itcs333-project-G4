/**
 * Main application logic for Course Notes
 * Initializes and connects all components
 */

import { getNotes, getNoteById } from "./api.js"
import {
  initLoadingIndicator,
  renderNotesList,
  renderPagination,
  renderNoteDetail,
  initFormValidation,
  initSearch,
  initFilters,
  initSort,
  updateStats,
} from "./ui.js"
import { getUrlParams } from "./utils.js"

// Application state
const state = {
  notes: [],
  pagination: {
    currentPage: 1,
    totalPages: 0,
    totalItems: 0,
  },
  fetchAll: false,
  filters: {
    query: "",
    course: null,
  },
  sort: "newest",
  stats: {
    totalNotes: 0,
    totalCourses: 6,
    totalShared: 0,
  },
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
  const searchForm = document.querySelector("#search-form")
  const filterButtons = document.querySelectorAll(".flex.flex-wrap.gap-2.mb-8 button")
  const sortButton = document.querySelector(".sort-button")

  // Initialize interactive features
  if (searchForm) {
    initSearch(searchForm, handleSearch)
  }

  if (filterButtons && filterButtons.length) {
    initFilters(filterButtons, handleFilter)
  }

  if (sortButton) {
    initSort(sortButton, handleSort)
  }

  // Load notes
  await loadNotes()

  // Handle pagination
  function handlePageChange(page) {
    state.pagination.currentPage = page
    loadNotes()

    // Scroll to top of notes section
    document.getElementById("notes").scrollIntoView({ behavior: "smooth" })
  }

  // Handle search
  function handleSearch(searchParams) {
    state.filters.query = searchParams.query || ""
    state.pagination.currentPage = 1
    loadNotes()
  }

  // Handle filter
  function handleFilter(filterParams) {
    state.filters.course = filterParams.course;
    state.pagination.currentPage = 1;
    state.fetchAll = !!filterParams.course;
    loadNotes();
  }

  // Handle sort
  function handleSort(sortParams) {
    state.sort = sortParams.sort || "newest"
    loadNotes()
  }

  // Load notes with current state
  async function loadNotes() {
    try {
      // Convert state to API parameters
      const params = {
        q: state.filters.query,
        // _page: state.pagination.currentPage,
        // _limit: 10,
      }

      if (state.fetchAll) {
        params._limit = 500
      } else {
        params._page = state.pagination.currentPage
        params._limit = 10
        state.fetchAll = false
      }
      

      // Add sort parameter
      switch (state.sort) {
        case "oldest":
          params._sort = "id"
          params._order = "asc"
          break
        case "title_asc":
          params._sort = "title"
          params._order = "asc"
          break
        case "title_desc":
          params._sort = "title"
          params._order = "desc"
          break
        case "newest":
        default:
          params._sort = "id"
          params._order = "desc"
          break
      }

      // Fetch notes with filters
      const result = await getNotes(
        { ...params, course: state.filters.course }, // filters
        state.pagination.currentPage,                // page
        9,                                           // limit
        state.fetchAll                               // fetchAll flag
      )
      if (result.error) {
        throw new Error(result.error)
      }

      // Update state
      state.notes = result.notes
      state.pagination = result.pagination
      state.stats.totalNotes = result.pagination.totalItems // This should now correctly show the total count
      state.stats.totalShared = Math.floor(result.pagination.totalItems / 3) // Adjust the calculation for shared notes

      // Update UI
      if (notesContainer) {
        renderNotesList(state.notes, notesContainer)
      }

      if (paginationContainer) {
        renderPagination(state.pagination, handlePageChange, paginationContainer)
      }

      // Update stats
      updateStats(state.stats)
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

/**
 * Initialize the create note page
 */
function initCreateNotePage() {
  console.log("Initializing create note page")

  // Initialize UI components
  initLoadingIndicator()

  // Get DOM elements
  const createNoteForm = document.querySelector("#create-note-form")

  // Initialize form validation
  initFormValidation(createNoteForm)
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
    initCreateNotePage()
  }
}

// Initialize the application when DOM is loaded
document.addEventListener("DOMContentLoaded", initApp)
