const DATA_URL = 'activities.json';
const ITEMS_PER_PAGE = 4;
let allActivities = [];
let currentPage = 1;

const grid = document.getElementById('activity-grid');
const searchInput = document.getElementById('search-input');
const pagination = document.getElementById('pagination');
const sortSelect = document.getElementById('sort-select');

function showLoading() {
  if (grid) grid.innerHTML = '<p class="text-gray-600 text-center">Loading activities...</p>';
}

function showError(message) {
  if (grid) grid.innerHTML = `<p class="text-red-600 text-center">${message}</p>`;
}

function fetchActivities() {
  showLoading();
  fetch(DATA_URL)
    .then(res => {
      if (!res.ok) throw new Error('Failed to fetch data.');
      return res.json();
    })
    .then(data => {
      allActivities = data;
      renderActivities();
      renderPagination();
    })
    .catch(() => showError("Could not load activities."));
}

function filterActivities() {
  if (!searchInput) return allActivities;
  const keyword = searchInput.value.toLowerCase();
  return allActivities.filter(a =>
    a.title.toLowerCase().includes(keyword) ||
    a.club.toLowerCase().includes(keyword) ||
    a.description.toLowerCase().includes(keyword)
  );
}

function renderActivities() {
  if (!grid) return;
  grid.innerHTML = '';

  let filtered = filterActivities();

  // Apply sorting
  if (sortSelect) {
    const val = sortSelect.value;
    if (val === 'asc') {
      filtered.sort((a, b) => a.title.localeCompare(b.title));
    } else if (val === 'desc') {
      filtered.sort((a, b) => b.title.localeCompare(a.title));
    }
  }

  const start = (currentPage - 1) * ITEMS_PER_PAGE;
  const end = start + ITEMS_PER_PAGE;
  const currentItems = filtered.slice(start, end);

  if (currentItems.length === 0) {
    grid.innerHTML = '<p class="text-gray-600 text-center">No activities found.</p>';
    return;
  }

  currentItems.forEach(act => {
    const card = document.createElement('a');
    card.href = `club-detail.html?id=${act.id}`;
    card.className = 'bg-white rounded-xl shadow-soft p-5 border border-gray-100 hover:shadow-lg transition-shadow';
    card.innerHTML = `
      <h3 class="text-lg font-semibold text-secondary-800 mb-1">${act.title}</h3>
      <p class="text-sm text-secondary-500 mb-2">${act.date} - ${act.location}</p>
      <p class="text-secondary-600 text-sm line-clamp-3">${act.description}</p>
    `;
    grid.appendChild(card);
  });
}

function renderPagination() {
  if (!pagination) return;
  pagination.innerHTML = '';

  const total = Math.ceil(filterActivities().length / ITEMS_PER_PAGE);
  for (let i = 1; i <= total; i++) {
    const btn = document.createElement('button');
    btn.textContent = i;
    btn.className = `px-3 py-2 border border-gray-300 rounded-md ${
      i === currentPage ? 'bg-primary-600 text-white' : 'text-gray-600 hover:bg-gray-100'
    }`;
    btn.addEventListener('click', () => {
      currentPage = i;
      renderActivities();
      renderPagination();
    });
    pagination.appendChild(btn);
  }
}

if (searchInput) {
  searchInput.addEventListener('input', () => {
    currentPage = 1;
    renderActivities();
    renderPagination();
  });
}

if (sortSelect) {
  sortSelect.addEventListener('change', () => {
    currentPage = 1;
    renderActivities();
    renderPagination();
  });
}

if (grid) fetchActivities();
