// DOM Elements
const searchInput = document.querySelector('input[type="search"]');
const courseFilter = document.querySelector('select:first-of-type');
const yearFilter = document.querySelector('select:last-of-type');
const sortBtn = document.querySelector('button.bg-primary-600');
const groupsGrid = document.querySelector('.grid.gap-6');

// State variables
let allGroups = [];
let isSortedDescending = true;
const API_URL = 'https://680b64d7d5075a76d98af17b.mockapi.io/detail'; // 🔄 updated from /groups to /detail

// Fetch groups from API
async function fetchGroups() {
  try {
    groupsGrid.innerHTML = '<p class="text-center text-gray-500 py-8">Loading groups...</p>';
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error('Failed to fetch groups');
    allGroups = await response.json();
    populateFilters(allGroups);
    renderGroups(allGroups);
  } catch (error) {
    console.error('Error fetching groups:', error);
    groupsGrid.innerHTML = '<p class="text-center text-red-500 py-8">Failed to load groups. Please try again later.</p>';
  }
}

// Populate filter options dynamically
function populateFilters(groups) {
  const courses = [...new Set(groups.map(group => group.course))];
  const years = [...new Set(groups.map(group => group.year))];

  courseFilter.innerHTML = '<option>Filter by Course</option>';
  courses.forEach(course => {
    const option = document.createElement('option');
    option.value = course;
    option.textContent = course;
    courseFilter.appendChild(option);
  });

  yearFilter.innerHTML = '<option>Filter by Year</option>';
  years.forEach(year => {
    const option = document.createElement('option');
    option.value = year;
    option.textContent = year;
    yearFilter.appendChild(option);
  });
}

// Render groups function
function renderGroups(groupsArray) {
  if (groupsArray.length === 0) {
    groupsGrid.innerHTML = '<p class="text-center text-gray-500 py-8">No study groups found matching your criteria.</p>';
    return;
  }

  groupsGrid.innerHTML = groupsArray.map(group => `
    <div class="bg-white rounded-xl shadow-soft p-5 border border-gray-100">
      <h3 class="text-xl font-semibold text-secondary-800 mb-1">${group.title}</h3>
      <span class="bg-primary-100 text-primary-700 px-2 py-1 rounded text-xs">${group.course}</span>
      <p class="text-secondary-600 mt-2 line-clamp-3">${group.description}</p>
      <div class="mt-4 text-sm text-secondary-500 flex justify-between">
        <span>${group.year}</span>
        <a href="detail.html?id=${group.id}" class="text-primary-600 hover:text-primary-700">View Details</a>
      </div>
    </div>
  `).join('');
}

// Filter groups function
function filterGroups() {
  const searchTerm = searchInput.value.toLowerCase();
  const selectedCourse = courseFilter.value;
  const selectedYear = yearFilter.value;

  return allGroups.filter(group => {
    const matchesSearch = group.title.toLowerCase().includes(searchTerm) || 
                         group.description.toLowerCase().includes(searchTerm);
    const matchesCourse = selectedCourse === 'Filter by Course' || 
                         group.course.toLowerCase() === selectedCourse.toLowerCase();
    const matchesYear = selectedYear === 'Filter by Year' || 
                       group.year === selectedYear;

    return matchesSearch && matchesCourse && matchesYear;
  });
}

// Event listeners
searchInput.addEventListener('input', handleFilterChange);
courseFilter.addEventListener('change', handleFilterChange);
yearFilter.addEventListener('change', handleFilterChange);

sortBtn.addEventListener('click', () => {
  const filteredGroups = filterGroups();
  const sortedGroups = [...filteredGroups].sort((a, b) => {
    return isSortedDescending ? b.id - a.id : a.id - b.id;
  });
  
  isSortedDescending = !isSortedDescending;
  renderGroups(sortedGroups);
});

function handleFilterChange() {
  const filteredGroups = filterGroups();
  renderGroups(filteredGroups);
}

// Initial load
document.addEventListener('DOMContentLoaded', fetchGroups);
