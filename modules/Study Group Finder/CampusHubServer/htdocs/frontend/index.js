// API URL - make it work in both environments
const API_URL = location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
  ? '../api/groups/read.php'  // VS Code / Local environment
  : '/api/groups/read.php';   // Replit environment

console.log('Using API URL:', API_URL);

// State variables
let allGroups = [];
let isSortedDescending = true;

// Wait for DOM to be fully loaded
document.addEventListener('DOMContentLoaded', () => {
  console.log('DOM loaded, initializing index');
  
  // DOM Elements - make selectors more specific and add fallbacks
  // Try multiple selector strategies for each element
  const searchInput = document.querySelector('input[type="search"]') || 
                      document.querySelector('input[placeholder*="Search"]');
  
  // For course filter, try both position-based and more specific selectors
  const courseFilter = document.querySelector('#course-filter') || 
                       document.querySelector('select:first-of-type') || 
                       document.querySelector('select option[value*="Course"]').parentNode;
  
  // For year filter, try both position-based and more specific selectors
  const yearFilter = document.querySelector('#year-filter') || 
                     document.querySelector('select:last-of-type') || 
                     document.querySelector('select option[value*="Year"]').parentNode;
  
  // For sort button, try multiple strategies
  const sortBtn = document.querySelector('button.bg-primary-600') || 
                  document.querySelector('button:not([type])') ||
                  document.querySelector('button[class*="primary"]');
  
  // For the grid, try multiple strategies
  const groupsGrid = document.querySelector('#groups-container') || 
                     document.querySelector('.grid.gap-6') || 
                     document.querySelector('.grid');
                     
  // Log what we found                   
  console.log('Found elements:', {
    searchInput: !!searchInput,
    courseFilter: !!courseFilter,
    yearFilter: !!yearFilter,
    sortBtn: !!sortBtn,
    groupsGrid: !!groupsGrid
  });
  
  console.log('Sort button found:', sortBtn ? 'Yes' : 'No');
  
  // Initialize
  initApp();
  
  // Main initialization
  async function initApp() {
    try {
      // Fetch data first
      await fetchGroups();
      
      // Add event listeners after we have data
      if (searchInput) {
        console.log('Adding search input listener');
        searchInput.addEventListener('input', handleFilterChange);
      }
      
      if (courseFilter) {
        console.log('Adding course filter listener');
        courseFilter.addEventListener('change', handleFilterChange);
      }
      
      if (yearFilter) {
        console.log('Adding year filter listener');
        yearFilter.addEventListener('change', handleFilterChange);
      }
      
      if (sortBtn) {
        console.log('Adding sort button listener');
        sortBtn.addEventListener('click', () => {
          console.log('Sort button clicked');
          toggleSort();
        });
      }
    } catch (error) {
      console.error('Failed to initialize app:', error);
    }
  }

  // Fetch groups from API
  async function fetchGroups() {
    try {
      // Show loading state if grid exists
      if (groupsGrid) {
        groupsGrid.innerHTML = '<p class="text-center text-gray-500 py-8">Loading groups...</p>';
      }
      
      console.log('Fetching groups from:', API_URL);
      
      // Try the fetch with error handling for different potential issues
      let response;
      try {
        response = await fetch(API_URL);
        
        if (!response.ok) {
          // If on local environment, try an alternative path
          if ((location.hostname === 'localhost' || location.hostname === '127.0.0.1') && response.status === 404) {
            console.warn('API not found at primary path, trying alternative path...');
            const alternativePath = 'api/groups/read.php';
            console.log('Trying alternative path:', alternativePath);
            response = await fetch(alternativePath);
            
            if (!response.ok) {
              throw new Error(`HTTP error! status: ${response.status}`);
            }
          } else {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
        }
      } catch (fetchError) {
        console.error('Fetch error:', fetchError);
        // If we're in local/VS Code environment, try to create some mock data for testing
        if (location.hostname === 'localhost' || location.hostname === '127.0.0.1') {
          console.warn('Failed to fetch from API in local environment, check network paths');
        }
        throw fetchError;
      }
      
      // Parse the JSON response
      const result = await response.json();
      console.log('API Response:', result);
      
      // Process the response data
      if (result.success) {
        // Store groups and update UI
        allGroups = result.data.groups;
        console.log('Retrieved groups:', allGroups.length);
        
        // Ensure the groups array exists
        if (!Array.isArray(allGroups)) {
          console.error('Expected array of groups, got:', typeof allGroups);
          throw new Error('Invalid data structure received from API');
        }
        
        // Update UI with the data
        populateFilters(allGroups);
        renderGroups(allGroups);
      } else {
        throw new Error(result.message || 'Failed to fetch study groups');
      }
    } catch (error) {
      console.error('Error fetching study groups:', error);
      if (groupsGrid) {
        groupsGrid.innerHTML = `
          <p class="text-center text-red-500 py-8">
            Failed to load groups. Please try again later.<br>
            <small>${error.message}</small>
          </p>`;
      }
    }
  }
  
  // Populate filter options dynamically
  function populateFilters(groups) {
    console.log('Populating filters with', groups.length, 'groups');
    
    // Exit early if filters aren't found
    if (!courseFilter) {
      console.warn('Course filter element not found');
      return;
    }
    
    if (!yearFilter) {
      console.warn('Year filter element not found');
      return;
    }
    
    try {
      // Extract unique course and year values
      const courses = [...new Set(groups.map(group => group.course))];
      const years = [...new Set(groups.map(group => group.year))];
      
      console.log('Found unique courses:', courses);
      console.log('Found unique years:', years);
      
      // Clear and repopulate course filter
      courseFilter.innerHTML = '<option>Filter by Course</option>';
      courses.forEach(course => {
        if (course) { // Only add if course is not null or undefined
          const option = document.createElement('option');
          option.value = course;
          option.textContent = course;
          courseFilter.appendChild(option);
        }
      });
      
      // Clear and repopulate year filter
      yearFilter.innerHTML = '<option>Filter by Year</option>';
      years.forEach(year => {
        if (year) { // Only add if year is not null or undefined
          const option = document.createElement('option');
          option.value = year;
          option.textContent = year;
          yearFilter.appendChild(option);
        }
      });
      
      console.log('Filters populated successfully');
    } catch (error) {
      console.error('Error populating filters:', error);
    }
  }
  
  // Render groups to the DOM
  function renderGroups(groupsArray) {
    console.log('Rendering groups to DOM:', groupsArray.length);
    
    if (!groupsGrid) {
      console.error('Groups grid element not found');
      return;
    }
    
    try {
      if (groupsArray.length === 0) {
        groupsGrid.innerHTML = '<p class="text-center text-gray-500 py-8">No study groups found matching your criteria.</p>';
        return;
      }
      
      // Use a local path variable that works in both environments
      const detailPath = location.hostname === 'localhost' || location.hostname === '127.0.0.1' 
        ? 'detail.html'  // VS Code / Local environment (relative path)
        : './detail.html';  // Replit environment
      
      const groupsHtml = groupsArray.map(group => {
        // Safely access properties with fallbacks for any missing data
        const id = group.id || '';
        const title = group.title || 'Untitled Group';
        const course = group.course || 'Unknown Course';
        const description = group.description || 'No description available.';
        const year = group.year || 'Year not specified';
        
        return `
          <div class="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
            <h3 class="text-xl font-semibold text-secondary-800 mb-1">${title}</h3>
            <span class="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">${course}</span>
            <p class="text-secondary-600 mt-2 line-clamp-3">${description}</p>
            <div class="mt-4 text-sm text-secondary-500 flex justify-between">
              <span>${year}</span>
              <a href="${detailPath}?id=${id}" class="text-primary-600 hover:text-primary-700">View Details</a>
            </div>
          </div>
        `;
      }).join('');
      
      groupsGrid.innerHTML = groupsHtml;
      console.log('Groups rendered successfully');
    } catch (error) {
      console.error('Error rendering groups:', error);
      groupsGrid.innerHTML = '<p class="text-center text-red-500 py-8">An error occurred while displaying groups.</p>';
    }
  }
  
  // Filter groups function
  function handleFilterChange() {
    if (!searchInput || !courseFilter || !yearFilter || !groupsGrid) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    const courseValue = courseFilter.value;
    const courseFilter1 = courseValue === 'Filter by Course' ? '' : courseValue.toLowerCase();
    const yearValue = yearFilter.value;
    const yearFilter1 = yearValue === 'Filter by Year' ? '' : yearValue.toLowerCase();
    
    const filtered = allGroups.filter(group => {
      const matchesSearch = group.title.toLowerCase().includes(searchTerm) || 
                          group.description.toLowerCase().includes(searchTerm);
      const matchesCourse = !courseFilter1 || group.course.toLowerCase().includes(courseFilter1);
      const matchesYear = !yearFilter1 || group.year.toLowerCase().includes(yearFilter1);
      
      return matchesSearch && matchesCourse && matchesYear;
    });
    
    renderGroups(filtered);
  }
  
  // Toggle sort order
  function toggleSort() {
    console.log('Toggling sort order, was:', isSortedDescending);
    isSortedDescending = !isSortedDescending;
    console.log('Sort order now:', isSortedDescending ? 'Newest first' : 'Oldest first');
    
    // Update sort button text (just keep it as "Sort by Date" without arrows)
    if (sortBtn) {
      sortBtn.textContent = 'Sort by Date';
    }
    
    // Log created_at values for debugging
    console.log('Before sorting, first few dates:', allGroups.slice(0, 3).map(g => g.created_at));
    
    // Make a copy of the array before sorting
    const sortedGroups = [...allGroups];
    
    // Sort by date
    sortedGroups.sort((a, b) => {
      // Handle missing dates
      const dateA = a.created_at ? new Date(a.created_at) : new Date(0);
      const dateB = b.created_at ? new Date(b.created_at) : new Date(0);
      
      // Compare dates based on sort direction
      if (isSortedDescending) {
        return dateB - dateA; // Newest first
      } else {
        return dateA - dateB; // Oldest first
      }
    });
    
    // Log results
    console.log('After sorting, first few dates:', sortedGroups.slice(0, 3).map(g => g.created_at));
    
    // Render the sorted groups
    renderGroups(sortedGroups);
  }
});