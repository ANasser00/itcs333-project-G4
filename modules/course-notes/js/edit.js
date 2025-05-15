/**
 * Edit Note functionality for CourseNotes application
 * Handles loading note data, populating form, and submitting updates
 */
import { getNoteById, getCourses, updateNote } from "./api.js"
import { getUrlParams } from "./utils.js"

// DOM elements
const loadingIndicator = document.getElementById("loading-indicator")
const editFormContainer = document.getElementById("edit-form-container")
const errorContainer = document.getElementById("error-container")
const errorMessage = document.getElementById("error-message")
const editForm = document.getElementById("edit-note-form")
const noteIdInput = document.getElementById("note-id")
const titleInput = document.getElementById("title")
const courseSelect = document.getElementById("course")
const contentTextarea = document.getElementById("content")

/**
 * Initialize the edit page
 */
async function initEditPage() {
  console.log("Initializing edit page")

  // Show loading indicator
  showLoading(true)

  // Get note ID from URL
  const params = getUrlParams()
  const noteId = params.id

  if (!noteId) {
    showError("No note ID provided. Please select a note to edit.")
    return
  }

  // Load courses for dropdown
  await loadCourses()

  // Load note data
  await loadNoteData(noteId)

  // Add form submit handler
  if (editForm) {
    editForm.addEventListener("submit", handleFormSubmit)
  }

  console.log("Edit page initialized")
}

/**
 * Load courses for dropdown
 */
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
      result.data.forEach((course) => {
        const option = document.createElement("option")
        option.value = course.id
        option.textContent = `${course.course_code} - ${course.course_name}`
        courseSelect.appendChild(option)
      })
    }
  } catch (error) {
    console.error("Error loading courses:", error)
    showError("Failed to load courses. Please try again later.")
  }
}

/**
 * Load note data and populate form
 * @param {string|number} noteId - ID of the note to edit
 */
async function loadNoteData(noteId) {
  try {
    const result = await getNoteById(noteId)

    if (result.error) {
      throw new Error(result.error)
    }

    if (!result.note) {
      throw new Error("Note not found")
    }

    console.log("Loaded note data:", result.note)

    // Populate form with note data
    noteIdInput.value = result.note.id
    titleInput.value = result.note.title
    contentTextarea.value = result.note.content

    // Select the correct course
    if (courseSelect) {
      const courseOptions = Array.from(courseSelect.options)
      const courseOption = courseOptions.find((option) => option.value === result.note.course_id)

      if (courseOption) {
        courseOption.selected = true
      }
    }

    // Show form
    showLoading(false)
    editFormContainer.classList.remove("hidden")
  } catch (error) {
    console.error("Error loading note data:", error)
    showError(`Failed to load note data: ${error.message}`)
  }
}

/**
 * Handle form submission
 * @param {Event} event - Form submit event
 */
async function handleFormSubmit(event) {
  event.preventDefault()

  // Show loading indicator
  showLoading(true)

  try {
    // Get form data
    const noteId = noteIdInput.value
    const noteData = {
      title: titleInput.value,
      content: contentTextarea.value,
      course_id: courseSelect.value,
    }

    console.log("Submitting form with data:", noteData)

    // Validate required fields
    if (!noteData.title || !noteData.content || !noteData.course_id) {
      throw new Error("Please fill in all required fields")
    }

    // Update note
    const result = await updateNote(noteId, noteData)

    if (result.error) {
      throw new Error(result.error)
    }

    // Show success message and redirect
    alert("Note updated successfully!")
    window.location.href = `detail.html?id=${noteId}`
  } catch (error) {
    console.error("Error updating note:", error)
    showLoading(false)
    alert(`Error updating note: ${error.message}`)
  }
}

/**
 * Show or hide loading indicator
 * @param {boolean} isLoading - Whether to show loading indicator
 */
function showLoading(isLoading) {
  if (isLoading) {
    loadingIndicator.classList.remove("hidden")
    editFormContainer.classList.add("hidden")
    errorContainer.classList.add("hidden")
  } else {
    loadingIndicator.classList.add("hidden")
  }
}

/**
 * Show error message
 * @param {string} message - Error message to display
 */
function showError(message) {
  loadingIndicator.classList.add("hidden")
  editFormContainer.classList.add("hidden")
  errorContainer.classList.remove("hidden")

  if (errorMessage) {
    errorMessage.textContent = message
  }
}

// Initialize the edit page when DOM is loaded
document.addEventListener("DOMContentLoaded", initEditPage)
