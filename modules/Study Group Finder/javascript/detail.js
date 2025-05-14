// Replit URL
const REPLIT_URL = 'https://ba1b6159-e612-478e-8f9f-b6d68eb234b8-00-19q8fejejobbo.spock.replit.dev';

// Study Group Details Module
class StudyGroupDetails {
  constructor() {
    this.id = this.getGroupId();
    
    // Set API URLs with Replit base URL if we have a valid ID
    if (this.id) {
      this.apiUrl = `${REPLIT_URL}/api/groups/read.php?id=` + this.id;
      this.updateApiUrl = `${REPLIT_URL}/api/groups/update.php`;
      this.deleteApiUrl = `${REPLIT_URL}/api/groups/delete.php?id=` + this.id;
      // Create a special URL for comment operations
      this.commentApiUrl = `${REPLIT_URL}/api/comments/index.php`;
      console.log('API URL:', this.apiUrl);
      this.init();
    }
  }

  async init() {
    try {
      this.showLoading();
      const groupData = await this.fetchGroupData();
      this.renderGroupDetails(groupData);
      this.setupEventListeners();
    } catch (error) {
      this.showError(`Error loading group: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  getGroupId() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) {
      this.showError('No group ID provided');
      return null;
    }
    return id;
  }

  async fetchGroupData() {
    try {
      console.log('Fetching group data from:', this.apiUrl);
      const response = await fetch(this.apiUrl);
      if (!response.ok) {
        throw new Error(`Server returned ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (!data.success) {
        throw new Error(data.message || 'Failed to load group data');
      }
      console.log('Group data received:', data);
      return data.data;
    } catch (error) {
      console.error('Error fetching group data:', error);
      throw error;
    }
  }

  renderGroupDetails(data) {
    if (!data) {
      this.showError('No group data available');
      return;
    }

    document.title = `${data.title} | Study Group Finder`;
    
    const detailsContainer = document.querySelector('.bg-white.p-6');
    if (!detailsContainer) {
      console.error('Details container not found');
      return;
    }
    
    const headerDiv = document.createElement('div');
    headerDiv.className = 'flex justify-between items-start';
    
    headerDiv.innerHTML = `
      <div>
        <h1 class="text-2xl font-bold text-secondary-800">${data.title}</h1>
        <div class="flex space-x-2 mt-1">
          <span class="bg-primary-100 text-primary-700 px-2 py-1 rounded text-sm">${data.course}</span>
          <span class="bg-secondary-100 text-secondary-700 px-2 py-1 rounded text-sm">${data.year}</span>
        </div>
      </div>
      <div class="space-x-2" id="action-buttons">
        <button class="px-3 py-1 bg-yellow-100 text-yellow-800 rounded hover:bg-yellow-200" id="edit-btn">Edit</button>
        <button class="px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200" id="delete-btn">Delete</button>
      </div>
    `;
    
    const infoDiv = document.createElement('div');
    infoDiv.className = 'mt-6 space-y-4';
    infoDiv.innerHTML = `
      <div>
        <h2 class="text-lg font-semibold text-secondary-800">Description</h2>
        <p class="text-secondary-600 mt-1">${data.description}</p>
      </div>
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <h2 class="text-lg font-semibold text-secondary-800">Location</h2>
          <p class="text-secondary-600 mt-1">${data.location}</p>
        </div>
        <div>
          <h2 class="text-lg font-semibold text-secondary-800">Contact</h2>
          <p class="text-secondary-600 mt-1">
            <a href="mailto:${data.contact}" class="text-primary-600 hover:underline">${data.contact}</a>
          </p>
        </div>
      </div>
    `;
    
    // Create comments section
    const commentsContainer = this.createCommentsContainer();
    
    // Clear and append all sections
    detailsContainer.innerHTML = '';
    detailsContainer.append(headerDiv, infoDiv, commentsContainer);
    
    // Render comments if available
    if (data.comments && Array.isArray(data.comments)) {
      this.renderComments(data.comments);
    }
  }

  renderComments(comments) {
    console.log('Rendering comments:', comments.length);
    const commentsContainer = document.getElementById('comments-list');
    if (!commentsContainer) return;
    
    if (comments.length === 0) {
      commentsContainer.innerHTML = '<p class="text-secondary-500 text-center py-4">No comments yet. Be the first to comment!</p>';
      return;
    }
    
    commentsContainer.innerHTML = comments.map((comment, index) => `
      <div class="p-4 bg-gray-50 rounded-lg">
        <div class="flex items-start">
          <div class="w-8 h-8 rounded-full bg-primary-100 flex items-center justify-center text-primary-700 font-medium mr-3">
            ${comment.author.initials}
          </div>
          <div class="flex-1">
            <div class="flex justify-between items-center mb-1">
              <span class="font-medium text-secondary-800">${comment.author.name}</span>
              <div>
                <span class="text-secondary-500 text-sm">${new Date(comment.date).toLocaleDateString()}</span>
                <button class="ml-2 text-red-500 hover:text-red-700 text-sm delete-comment" data-index="${index}">
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="w-4 h-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                </button>
              </div>
            </div>
            <p class="text-secondary-600">${comment.content}</p>
          </div>
        </div>
      </div>
    `).join('');
    
    this.addCommentDeleteListeners();
  }

  addCommentDeleteListeners() {
    document.querySelectorAll('.delete-comment').forEach(btn => {
      btn.addEventListener('click', () => {
        const index = parseInt(btn.dataset.index);
        this.handleCommentDelete(index);
      });
    });
  }

  async handleCommentDelete(index) {
    if (!confirm('Are you sure you want to delete this comment?')) return;
    
    try {
      this.showLoading();
      
      // First, fetch the current group data to get all comments
      const currentData = await this.fetchGroupData();
      const comments = currentData.comments || [];
      
      // Make sure the index is valid
      if (index < 0 || index >= comments.length) {
        this.showError('Invalid comment index');
        this.hideLoading();
        return;
      }
      
      // Use direct API to delete comment
      const response = await fetch(`${this.commentApiUrl}?action=delete&group_id=${this.id}&index=${index}`, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh to get updated comments
        location.reload();
      } else {
        this.showError(result.message || 'Failed to delete comment');
      }
    } catch (error) {
      this.showError(`Error deleting comment: ${error.message}`);
      this.hideLoading();
    }
  }

  async handleCommentSubmit(e) {
    e.preventDefault();
    
    const form = e.target;
    const nameInput = form.querySelector('input[name="author"]');
    const contentInput = form.querySelector('textarea[name="content"]');
    
    if (!nameInput || !contentInput) {
      this.showError('Comment form elements not found');
      return;
    }
    
    const name = nameInput.value.trim();
    const content = contentInput.value.trim();
    
    if (!this.validateComment(name, content)) return;
    
    try {
      this.showLoading();
      
      // Use direct API to add comment
      const response = await fetch(`${this.commentApiUrl}?action=add`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          group_id: this.id,
          author_name: name,
          content: content
        })
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Simply reload the page to show the new comment
        location.reload();
      } else {
        this.showError(result.message || 'Failed to add comment');
        this.hideLoading();
      }
    } catch (error) {
      this.showError(`Error adding comment: ${error.message}`);
      this.hideLoading();
    }
  }

  async handleEdit() {
    try {
      this.showLoading();
      const groupData = await this.fetchGroupData();
      this.showEditForm(groupData);
    } catch (error) {
      this.showError(`Error preparing edit form: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  showEditForm(data) {
    const detailsContainer = document.querySelector('.bg-white.p-6');
    if (!detailsContainer) return;
    
    const formHTML = `
      <h2 class="text-xl font-bold text-secondary-800 mb-4">Edit Study Group</h2>
      <form id="edit-form" class="space-y-4">
        <div>
          <label class="block text-secondary-700 mb-1">Title</label>
          <input type="text" name="title" value="${data.title}" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-secondary-700 mb-1">Course</label>
            <input type="text" name="course" value="${data.course}" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
          </div>
          <div>
            <label class="block text-secondary-700 mb-1">Year</label>
            <input type="text" name="year" value="${data.year}" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
          </div>
        </div>
        <div>
          <label class="block text-secondary-700 mb-1">Description</label>
          <textarea name="description" rows="4" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">${data.description}</textarea>
        </div>
        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label class="block text-secondary-700 mb-1">Location</label>
            <input type="text" name="location" value="${data.location}" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
          </div>
          <div>
            <label class="block text-secondary-700 mb-1">Contact Email</label>
            <input type="email" name="contact" value="${data.contact}" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
          </div>
        </div>
        <div class="flex justify-end space-x-2">
          <button type="button" id="cancel-edit" class="px-4 py-2 bg-gray-100 text-gray-800 rounded-lg hover:bg-gray-200">Cancel</button>
          <button type="submit" class="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Save Changes</button>
        </div>
      </form>
    `;
    
    detailsContainer.innerHTML = formHTML;
    
    // Add event listeners for form
    document.getElementById('edit-form').addEventListener('submit', (e) => this.handleEditSubmit(e, data));
    document.getElementById('cancel-edit').addEventListener('click', () => {
      this.renderGroupDetails(data);
      this.setupEventListeners();
    });
  }

  async handleEditSubmit(e, originalData) {
    e.preventDefault();
    
    const form = e.target;
    const updatedData = {
      id: this.id,
      title: form.querySelector('input[name="title"]').value.trim(),
      course_code: form.querySelector('input[name="course"]').value.trim(),
      academic_year: form.querySelector('input[name="year"]').value.trim(),
      description: form.querySelector('textarea[name="description"]').value.trim(),
      meeting_location: form.querySelector('input[name="location"]').value.trim(),
      contact_email: form.querySelector('input[name="contact"]').value.trim()
    };
    
    // Basic validation
    if (!updatedData.title || !updatedData.course_code || !updatedData.academic_year) {
      this.showError('Title, Course, and Year are required fields');
      return;
    }
    
    try {
      this.showLoading();
      
      const response = await fetch(this.updateApiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });
      
      const result = await response.json();
      
      if (result.success) {
        // Refresh the page to reflect changes
        location.reload();
      } else {
        this.showError(result.message || 'Failed to update group');
      }
    } catch (error) {
      this.showError(`Error updating group: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  setupEventListeners() {
    const editBtn = document.getElementById('edit-btn');
    const deleteBtn = document.getElementById('delete-btn');
    const commentForm = document.getElementById('comment-form');
    
    if (editBtn) {
      editBtn.addEventListener('click', () => this.handleEdit());
    }
    
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDelete());
    }
    
    if (commentForm) {
      commentForm.addEventListener('submit', (e) => this.handleCommentSubmit(e));
    }
  }

  async handleDelete() {
    if (!confirm('Are you sure you want to delete this study group? This action cannot be undone.')) {
      return;
    }
    
    try {
      this.showLoading();
      
      const response = await fetch(this.deleteApiUrl, {
        method: 'DELETE'
      });
      
      const result = await response.json();
      
      if (result.success) {
        this.redirectToListing('Study group deleted successfully');
      } else {
        this.showError(result.message || 'Failed to delete group');
      }
    } catch (error) {
      this.showError(`Error deleting group: ${error.message}`);
    } finally {
      this.hideLoading();
    }
  }

  validateComment(name, content) {
    if (!name || name.length < 2) {
      this.showError('Please enter a valid name (minimum 2 characters)');
      return false;
    }
    
    if (!content || content.length < 5) {
      this.showError('Please enter a comment (minimum 5 characters)');
      return false;
    }
    
    return true;
  }

  showLoading() {
    let loadingEl = document.getElementById('loading-indicator');
    
    if (!loadingEl) {
      loadingEl = document.createElement('div');
      loadingEl.id = 'loading-indicator';
      loadingEl.className = 'fixed top-0 left-0 w-full bg-primary-600 text-white text-center p-2 z-50';
      loadingEl.textContent = 'Loading...';
      document.body.prepend(loadingEl);
    }
    
    loadingEl.style.display = 'block';
  }

  hideLoading() {
    const loadingEl = document.getElementById('loading-indicator');
    if (loadingEl) {
      loadingEl.style.display = 'none';
    }
  }

  showError(message) {
    const errorEl = this.createErrorElement();
    errorEl.textContent = message;
    document.body.prepend(errorEl);
    
    // Auto-remove after 5 seconds
    setTimeout(() => {
      if (errorEl.parentNode) {
        errorEl.remove();
      }
    }, 5000);
  }

  redirectToListing(message = null) {
    if (message) {
      sessionStorage.setItem('notification', message);
    }
    window.location.href = `${REPLIT_URL}/frontend/index.html`;
  }

  createCommentsContainer() {
    const container = document.createElement('div');
    container.className = 'mt-8';
    container.innerHTML = `
      <h2 class="text-lg font-semibold text-secondary-800 mb-4">Comments</h2>
      <div id="comments-list" class="space-y-4 mb-6">
        <p class="text-secondary-500 text-center py-4">Loading comments...</p>
      </div>
      <form id="comment-form" class="bg-gray-50 p-4 rounded-lg">
        <h3 class="text-md font-semibold text-secondary-800 mb-3">Add a Comment</h3>
        <div class="grid grid-cols-1 gap-4">
          <div>
            <label class="block text-secondary-700 mb-1 text-sm">Your Name</label>
            <input type="text" name="author" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500">
          </div>
          <div>
            <label class="block text-secondary-700 mb-1 text-sm">Comment</label>
            <textarea name="content" rows="3" class="w-full px-4 py-2 rounded-lg border border-gray-300 focus:ring-2 focus:ring-primary-500"></textarea>
          </div>
          <div>
            <button type="submit" class="w-full px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700">Post Comment</button>
          </div>
        </div>
      </form>
    `;
    return container;
  }

  createErrorElement() {
    const errorEl = document.createElement('div');
    errorEl.className = 'fixed top-0 left-0 w-full bg-red-600 text-white text-center p-2 z-50';
    return errorEl;
  }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
  new StudyGroupDetails();
});