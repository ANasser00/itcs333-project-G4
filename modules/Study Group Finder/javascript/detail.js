// Study Group Details Module
class StudyGroupDetails {
  constructor() {
    this.id = this.getGroupId();
    this.apiUrl = `https://680b64d7d5075a76d98af17b.mockapi.io/detail/${this.id}`;
    this.init();
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
      this.redirectToListing('Missing group ID parameter');
      return;
    }
    return id;
  }

  async fetchGroupData() {
    try {
      const response = await fetch(this.apiUrl);
      if (!response.ok) throw new Error('Failed to fetch group details');
      return await response.json();
    } catch (error) {
      throw new Error(`Network error: ${error.message}`);
    }
  }

  renderGroupDetails(data) {
    document.querySelector('h2').textContent = data.title;
    document.querySelector('.text-secondary-700.mb-4').textContent = data.description;

    const infoSpans = document.querySelectorAll('.flex.space-x-3 > span');
    infoSpans[0].innerHTML = `Course: <strong>${data.course}</strong>`;
    infoSpans[2].textContent = data.year;

    const detailsDiv = document.querySelector('.bg-gray-100');
    detailsDiv.children[0].innerHTML = `<strong>Meeting Location:</strong> ${data.location}`;
    detailsDiv.children[1].innerHTML = `<strong>Contact:</strong> ${data.contact}`;

    this.renderComments(data.comments || []);
  }

  renderComments(comments) {
    const container = document.getElementById('comments-list') || this.createCommentsContainer();
    container.innerHTML = '';

    if (comments.length === 0) {
      container.innerHTML = '<p class="text-secondary-500">No comments yet. Be the first to comment!</p>';
      return;
    }

    comments.forEach((comment, index) => {
      const commentEl = document.createElement('article');
      commentEl.className = 'bg-white border border-gray-200 rounded-lg p-4 mb-4 shadow-soft';
      commentEl.innerHTML = `
        <div class="flex items-center justify-between mb-2">
          <div class="flex items-center space-x-3">
            <div class="h-8 w-8 rounded-full bg-gray-300 flex items-center justify-center text-gray-700 font-semibold">
              ${comment.author?.initials || 'AN'}
            </div>
            <div>
              <h4 class="font-medium text-secondary-800">${comment.author?.name || 'Anonymous'}</h4>
              <p class="text-sm text-secondary-500">${new Date(comment.date).toLocaleDateString()}</p>
            </div>
          </div>
          <button class="text-secondary-400 hover:text-secondary-600 comment-delete" data-index="${index}">
            <svg class="h-5 w-5" fill="currentColor" viewBox="0 0 20 20">
              <path fill-rule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clip-rule="evenodd"/>
            </svg>
          </button>
        </div>
        <p class="text-secondary-700">${comment.content}</p>
      `;
      container.appendChild(commentEl);
    });

    this.addCommentDeleteListeners();
  }

  addCommentDeleteListeners() {
    document.querySelectorAll('.comment-delete').forEach(button => {
      button.addEventListener('click', (e) => {
        const index = e.currentTarget.dataset.index;
        this.handleCommentDelete(index);
      });
    });
  }

  async handleCommentDelete(index) {
    if (!confirm('Are you sure you want to delete this comment?')) return;

    try {
      this.showLoading();
      const currentData = await this.fetchGroupData();
      currentData.comments.splice(index, 1);

      await fetch(this.apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });

      this.renderComments(currentData.comments);
    } catch (error) {
      this.showError('Failed to delete comment. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async handleCommentSubmit(e) {
    e.preventDefault();
    const textarea = document.getElementById('comment');
    const content = textarea.value.trim();

    if (!this.validateComment(content)) return;

    try {
      this.showLoading();
      const newComment = {
        author: { name: "Sara Mohammad", initials: "SM" },
        date: new Date().toISOString(),
        content
      };

      const currentData = await this.fetchGroupData();
      currentData.comments = [...(currentData.comments || []), newComment];

      await fetch(this.apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(currentData)
      });

      this.renderComments(currentData.comments);
      textarea.value = '';
    } catch (error) {
      this.showError('Failed to post comment. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  async handleEdit() {
    try {
      const currentData = await this.fetchGroupData();
      this.showEditForm(currentData);
    } catch (error) {
      this.showError('Failed to load data for editing');
    }
  }

  showEditForm(data) {
    const editForm = document.createElement('div');
    editForm.className = 'fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4';
    editForm.innerHTML = `
      <div class="bg-white rounded-xl shadow-soft p-6 w-full max-w-lg">
        <h3 class="text-2xl font-bold mb-4">Edit Study Group</h3>
        <form id="edit-form" class="space-y-4">
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Title</label>
            <input type="text" name="title" value="${data.title}" class="w-full px-3 py-2 border rounded-lg" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Course</label>
            <input type="text" name="course" value="${data.course}" class="w-full px-3 py-2 border rounded-lg" required>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Year</label>
            <select name="year" class="w-full px-3 py-2 border rounded-lg">
              <option ${data.year === '1st Year' ? 'selected' : ''}>1st Year</option>
              <option ${data.year === '2nd Year' ? 'selected' : ''}>2nd Year</option>
              <option ${data.year === '3rd Year' ? 'selected' : ''}>3rd Year</option>
              <option ${data.year === '4th Year' ? 'selected' : ''}>4th Year</option>
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-secondary-700 mb-1">Description</label>
            <textarea name="description" rows="3" class="w-full px-3 py-2 border rounded-lg">${data.description}</textarea>
          </div>
          <div class="flex justify-end space-x-3">
            <button type="button" class="edit-cancel px-4 py-2 border rounded-lg hover:bg-gray-100">Cancel</button>
            <button type="submit" class="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700">Save Changes</button>
          </div>
        </form>
      </div>
    `;

    const form = editForm.querySelector('#edit-form');
    form.addEventListener('submit', (e) => this.handleEditSubmit(e, data));
    editForm.querySelector('.edit-cancel').addEventListener('click', () => editForm.remove());

    document.body.appendChild(editForm);
  }

  async handleEditSubmit(e, originalData) {
    e.preventDefault();
    const formData = new FormData(e.target);

    const updatedData = {
      ...originalData,
      title: formData.get('title'),
      course: formData.get('course'),
      year: formData.get('year'),
      description: formData.get('description')
    };

    try {
      this.showLoading();
      const response = await fetch(this.apiUrl, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatedData)
      });

      if (!response.ok) throw new Error('Update failed');

      this.renderGroupDetails(updatedData);
      e.target.closest('div').remove();
    } catch (error) {
      this.showError('Failed to update group. Please try again.');
    } finally {
      this.hideLoading();
    }
  }

  setupEventListeners() {
    const form = document.querySelector('form');
    if (form) {
      form.addEventListener('submit', (e) => this.handleCommentSubmit(e));
    }

    const deleteBtn = document.querySelector('.text-red-700');
    if (deleteBtn) {
      deleteBtn.addEventListener('click', () => this.handleDelete());
    }

    const editBtn = document.querySelector('.text-secondary-700');
    if (editBtn) {
      editBtn.addEventListener('click', () => this.handleEdit());
    }
  }

  async handleDelete() {
    if (!confirm('Are you sure you want to delete this group?')) return;

    try {
      await fetch(this.apiUrl, { method: 'DELETE' });
      this.redirectToListing('Group deleted successfully');
    } catch (error) {
      this.showError('Failed to delete group. Please try again.');
    }
  }

  validateComment(content) {
    const errorDiv = document.getElementById('comment-error') || this.createErrorElement();
    errorDiv.textContent = '';

    if (!content) {
      errorDiv.textContent = 'Please write a comment before submitting.';
      return false;
    }
    return true;
  }

  showLoading() {
    document.body.classList.add('loading');
  }

  hideLoading() {
    document.body.classList.remove('loading');
  }

  showError(message) {
    const errorDiv = document.createElement('div');
    errorDiv.className = 'bg-red-100 border border-red-400 text-red-700 p-3 mb-4 rounded-lg';
    errorDiv.textContent = message;
    document.querySelector('main').prepend(errorDiv);
    setTimeout(() => errorDiv.remove(), 5000);
  }

  redirectToListing(message) {
    if (message) alert(message);
    window.location.href = 'index.html';
  }

  createCommentsContainer() {
    const container = document.createElement('div');
    container.id = 'comments-list';
    document.querySelector('section').appendChild(container);
    return container;
  }

  createErrorElement() {
    const errorDiv = document.createElement('div');
    errorDiv.id = 'comment-error';
    errorDiv.className = 'text-red-500 text-sm mt-1';
    document.querySelector('form')?.appendChild(errorDiv);
    return errorDiv;
  }
}

// Initialize the module
document.addEventListener('DOMContentLoaded', () => {
  new StudyGroupDetails();
});
