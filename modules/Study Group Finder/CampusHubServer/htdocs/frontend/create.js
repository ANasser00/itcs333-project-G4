document.addEventListener('DOMContentLoaded', () => { 
  const form = document.querySelector('form');
  const API_GROUPS = `/api/groups/create.php`;
  
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

      // Create properly formatted request body
      const requestBody = {
        title: groupName.value.trim(),
        course_code: courseCode.value.trim().toUpperCase(),
        academic_year: year.value,
        meeting_location: location.value.trim(),
        description: description.value.trim(),
        contact_email: contact.value.trim()
      };

      // Single API call to create group
      const response = await fetch(API_GROUPS, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      const result = await response.json();
      console.log('Create API Response:', result);
      
      if (!result.success) {
        throw new Error(result.message || 'Failed to create group');
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