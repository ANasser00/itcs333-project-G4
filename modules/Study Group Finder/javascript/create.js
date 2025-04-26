document.addEventListener('DOMContentLoaded', () => { 
  const form = document.querySelector('form');
  const API_GROUPS = 'https://680b64d7d5075a76d98af17b.mockapi.io/groups';
  const API_DETAIL = 'https://680b64d7d5075a76d98af17b.mockapi.io/detail';

  // Form elements
  const groupName = document.getElementById('groupName');
  const courseCode = document.getElementById('courseCode');
  const year = document.getElementById('year');
  const location = document.getElementById('location');
  const description = document.getElementById('description');
  const contact = document.getElementById('contact');
  const submitBtn = document.querySelector('button[type="submit"]');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    // Show loading state
    submitBtn.disabled = true;
    submitBtn.textContent = 'Creating...';

    try {
      // Validate required fields
      if (!groupName.value.trim() || !courseCode.value.trim() || !description.value.trim()) {
        throw new Error('Please fill in all required fields');
      }

      // Construct new group object
      const newGroup = {
        title: groupName.value.trim(),
        course: courseCode.value.trim().toUpperCase(),
        year: year.value,
        location: location.value.trim(),
        description: description.value.trim(),
        contact: contact.value.trim(),
        comments: [] // Initialize comments
      };

      // First: create in /groups
      const groupRes = await fetch(API_GROUPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newGroup)
      });

      if (!groupRes.ok) {
        const errorData = await groupRes.json();
        throw new Error(errorData.message || 'Failed to create group');
      }

      const groupData = await groupRes.json();

      // Second: create in /detail with the same ID
      const detailRes = await fetch(`${API_DETAIL}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...groupData,
          comments: [] // Ensure comments array exists
        })
      });

      if (!detailRes.ok) {
        const errorData = await detailRes.json();
        throw new Error(errorData.message || 'Failed to sync group details');
      }

      // Redirect to main page on success
      window.location.href = 'index.html';

    } catch (error) {
      alert(`Error: ${error.message}`);
      console.error('Creation error:', error);
    } finally {
      // Reset button state
      submitBtn.disabled = false;
      submitBtn.textContent = 'Create Group';
    }
  });
});
