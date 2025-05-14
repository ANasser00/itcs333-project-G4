// Replit URL
const REPLIT_URL = 'https://ba1b6159-e612-478e-8f9f-b6d68eb234b8-00-19q8fejejobbo.spock.replit.dev';

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('Create page loaded');
  
  // Try multiple form selectors to find the form
  const form = document.getElementById('create-form') || 
               document.querySelector('form') ||
               document.querySelector('.bg-white form');
               
  if (form) {
    console.log('Found create form:', form);
    form.addEventListener('submit', handleCreateSubmit);
  } else {
    console.error('Create form not found');
    showError('Create form not found on page - Make sure your HTML contains a form element');
    
    // Log all forms on the page for debugging
    const allForms = document.querySelectorAll('form');
    console.log('All forms on page:', allForms);
  }
  
  // Check for notifications from redirects
  const notification = sessionStorage.getItem('notification');
  if (notification) {
    showNotification(notification);
    sessionStorage.removeItem('notification');
  }
});

// Handle form submission
async function handleCreateSubmit(e) {
  e.preventDefault();
  console.log('Form submitted');
  
  // Show loading indicator
  showLoading();
  
  try {
    // Get form elements (with fallbacks in case IDs are different)
    const titleInput = document.getElementById('title') || document.querySelector('input[name="title"]');
    const courseInput = document.getElementById('course') || document.querySelector('input[name="course"]') || document.querySelector('input[name="course_code"]');
    const yearInput = document.getElementById('year') || document.querySelector('input[name="year"]') || document.querySelector('input[name="academic_year"]');
    const descriptionInput = document.getElementById('description') || document.querySelector('textarea[name="description"]');
    const locationInput = document.getElementById('location') || document.querySelector('input[name="location"]') || document.querySelector('input[name="meeting_location"]');
    const contactInput = document.getElementById('contact') || document.querySelector('input[name="contact"]') || document.querySelector('input[name="contact_email"]');
    
    // Log what we found
    console.log('Form elements found:', {
      title: !!titleInput,
      course: !!courseInput,
      year: !!yearInput,
      description: !!descriptionInput,
      location: !!locationInput,
      contact: !!contactInput
    });
    
    // Get form data
    const formData = {
      title: titleInput ? titleInput.value.trim() : '',
      course_code: courseInput ? courseInput.value.trim() : '',
      academic_year: yearInput ? yearInput.value.trim() : '',
      description: descriptionInput ? descriptionInput.value.trim() : '',
      meeting_location: locationInput ? locationInput.value.trim() : '',
      contact_email: contactInput ? contactInput.value.trim() : ''
    };
    
    console.log('Form data:', formData);
    
    // Basic validation
    if (!formData.title || !formData.course_code || !formData.academic_year) {
      hideLoading();
      showError('Title, Course, and Year are required fields');
      return;
    }
    
    console.log('Submitting to API:', `${REPLIT_URL}/api/groups/create.php`);
    
    // Send data to API
    const response = await fetch(`${REPLIT_URL}/api/groups/create.php`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(formData)
    });
    
    // Check response
    if (!response.ok) {
      throw new Error(`Server responded with status: ${response.status}`);
    }
    
    const result = await response.json();
    console.log('API response:', result);
    
    if (result.success) {
      // Redirect back to listing with success message
      sessionStorage.setItem('notification', 'Study group created successfully!');
      window.location.href = `${REPLIT_URL}/frontend/index.html`;
    } else {
      throw new Error(result.message || 'Failed to create study group');
    }
  } catch (error) {
    console.error('Error creating study group:', error);
    showError(`Failed to create study group: ${error.message}`);
  } finally {
    hideLoading();
  }
}

// Helper function to create and show error message
function createErrorElement() {
  // Check if error element already exists
  let errorElement = document.getElementById('error-message');
  
  // Create new error element if it doesn't exist
  if (!errorElement) {
    errorElement = document.createElement('div');
    errorElement.id = 'error-message';
    errorElement.className = 'fixed top-0 left-0 w-full bg-red-600 text-white text-center p-2 z-50';
    errorElement.style.display = 'none';
    document.body.prepend(errorElement);
  }
  
  return errorElement;
}

// Helper function to show error message
function showError(message) {
  console.error('Error:', message);
  const errorElement = createErrorElement();
  errorElement.textContent = message;
  errorElement.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    errorElement.style.display = 'none';
  }, 5000);
}

// Helper function to show loading indicator
function showLoading() {
  let loadingElement = document.getElementById('loading-indicator');
  
  if (!loadingElement) {
    loadingElement = document.createElement('div');
    loadingElement.id = 'loading-indicator';
    loadingElement.className = 'fixed top-0 left-0 w-full bg-primary-600 text-white text-center p-2 z-50';
    loadingElement.textContent = 'Processing...';
    document.body.prepend(loadingElement);
  }
  
  loadingElement.style.display = 'block';
  
  // Disable form (find it again in case the reference has changed)
  const form = document.getElementById('create-form') || document.querySelector('form');
  if (form) {
    const inputs = form.querySelectorAll('input, textarea, button');
    inputs.forEach(input => input.disabled = true);
  }
}

// Helper function to hide loading indicator
function hideLoading() {
  const loadingElement = document.getElementById('loading-indicator');
  if (loadingElement) {
    loadingElement.style.display = 'none';
  }
  
  // Re-enable form (find it again in case the reference has changed)
  const form = document.getElementById('create-form') || document.querySelector('form');
  if (form) {
    const inputs = form.querySelectorAll('input, textarea, button');
    inputs.forEach(input => input.disabled = false);
  }
}

// Helper function to show notification
function showNotification(message) {
  let notificationElement = document.getElementById('notification');
  
  if (!notificationElement) {
    notificationElement = document.createElement('div');
    notificationElement.id = 'notification';
    notificationElement.className = 'fixed top-0 left-0 w-full bg-green-600 text-white text-center p-2 z-50';
    document.body.prepend(notificationElement);
  }
  
  notificationElement.textContent = message;
  notificationElement.style.display = 'block';
  
  // Auto-hide after 5 seconds
  setTimeout(() => {
    notificationElement.style.display = 'none';
  }, 5000);
}