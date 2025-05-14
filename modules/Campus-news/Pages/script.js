// ==================== Fetch and Display News ====================

// Constants
const API_URL = 'https://439e029c-2b83-4704-b032-707aef303847-00-2nzhhapl27o7b.pike.replit.dev/';
const newsPerPage = 6;

// Global variables
let allNews = [];
let currentPage = 1;

// Selectors
const newsContainer = document.getElementById('news-container');
const searchInput = document.getElementById('search-input');
const sortSelect = document.getElementById('sort-select');
const paginationContainer = document.getElementById('pagination');
const newsDetailsContainer = document.getElementById('news-details');
const viewNewsContainer = document.getElementById('view-news-container');
const categoryFilter = document.getElementById('category-filter');
const dateSort = document.getElementById('date-sort');

// Show loading indicator before fetching news
function initializeNews() {
    if (newsContainer) newsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news...</p>';
    if (viewNewsContainer) viewNewsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news...</p>';

    // Fetch data from API
    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error(`Failed to fetch news: ${response.status} ${response.statusText}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Fetched data:', data); // Debug output

            if (!data || data.length === 0) {
                throw new Error('No news data received');
            }

            // Process and format the news data
            allNews = data.map(item => ({
                id: item.id,
                title: item.title,
                body: item.content || item.body, // Handle different data structures
                author: item.author || "Unknown",
                category: item.category || "Uncategorized",
                date: new Date(item.publish_date || Date.now()),
                image: item.image_url || "https://via.placeholder.com/600x300"
            }));

            // Render the news
            renderNews();
            renderPagination();
        })
        .catch(error => {
            console.error('Error fetching news:', error);

            // Display error message
            const errorMessage = `
                <div class="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-4">
                    <p>Error loading news: ${error.message}</p>
                    <p class="mt-2">Please check your network connection and API endpoint.</p>
                </div>
            `;

            if (newsContainer) newsContainer.innerHTML = errorMessage;
            if (viewNewsContainer) viewNewsContainer.innerHTML = errorMessage;

            // Load fallback data for development/testing
            loadFallbackData();
        });
}

// Load fallback data if API fetch fails
function loadFallbackData() {
    console.log('Loading fallback data');

    // Fallback news data
    const fallbackData = [
        {"id":"1","title":"Campus Job Fair Announced","author":"Admin","category":"Opportunity","content":"A campus-wide job fair will be held next week featuring top local employers.","image_url":"https://via.placeholder.com/600x300","publish_date":"2025-05-13"},
        {"id":"2","title":"Library Hours Extended During Exams","author":"Library Staff","category":"Announcement","content":"The library will now be open until midnight during the exam period.","image_url":"https://via.placeholder.com/600x300","publish_date":"2025-05-14"},
        {"id":"3","title":"IT Club Workshop on Web Development","author":"IT Club","category":"Events","content":"Join us for a hands-on web development workshop this Thursday.","image_url":"https://via.placeholder.com/600x300","publish_date":"2025-05-10"},
        {"id":"4","title":"Summer Internship Program Open","author":"Career Services","category":"Opportunity","content":"Apply now for summer internships with top Bahraini companies.","image_url":"https://via.placeholder.com/600x300","publish_date":"2025-05-09"},
        {"id":"5","title":"New Cafeteria Menu Released","author":"Cafeteria Team","category":"Announcement","content":"Check out the new healthy and affordable menu starting this week.","image_url":"https://via.placeholder.com/600x300","publish_date":"2025-05-08"}
    ];

    // Process and format the fallback news data
    allNews = fallbackData.map(item => ({
        id: item.id,
        title: item.title,
        body: item.content || item.body,
        author: item.author || "Unknown",
        category: item.category || "Uncategorized",
        date: new Date(item.publish_date || Date.now()),
        image: item.image_url || "https://via.placeholder.com/600x300"
    }));

    // Add notice about using fallback data
    if (newsContainer) {
        const fallbackNotice = document.createElement('div');
        fallbackNotice.className = 'bg-yellow-100 border-l-4 border-yellow-500 text-yellow-700 p-4 mb-4';
        fallbackNotice.innerHTML = `
            <p>⚠️ Using fallback data. Could not connect to API.</p>
            <p class="mt-1">Check the console for more details.</p>
        `;
        newsContainer.prepend(fallbackNotice);
    }

    // Render the news with fallback data
    renderNews();
    renderPagination();
}

// Render news items
function renderNews() {
    if (!newsContainer) return;
    newsContainer.innerHTML = '';

    let filteredNews = filterAndSortNews();

    const start = (currentPage - 1) * newsPerPage;
    const end = start + newsPerPage;
    const newsToShow = filteredNews.slice(start, end);

    if (newsToShow.length === 0) {
        newsContainer.innerHTML = '<p class="text-gray-600">No news found.</p>';
        return;
    }

    newsToShow.forEach(news => {
        const newsCard = document.createElement('div');
        newsCard.className = 'bg-white p-6 rounded shadow-md';

        newsCard.innerHTML = `
            <h2 class="text-xl font-bold mb-2">${news.title}</h2>
            <p class="text-sm text-gray-500 mb-2">${news.category} | ${news.date.toDateString()}</p>
            <p class="text-gray-700 mb-4">${news.body.substring(0, 100)}${news.body.length > 100 ? '...' : ''}</p>
            <a href="read.html?id=${news.id}" class="text-blue-500 hover:underline">Read More</a>
        `;

        newsContainer.appendChild(newsCard);
    });
}

// Render pagination
function renderPagination() {
    if (!paginationContainer) return;
    paginationContainer.innerHTML = '';

    const totalPages = Math.ceil(filterAndSortNews().length / newsPerPage);

    for (let i = 1; i <= totalPages; i++) {
        const btn = document.createElement('button');
        btn.textContent = i;
        btn.className = `px-4 py-2 rounded ${i === currentPage ? 'bg-blue-500 text-white' : 'bg-gray-200'}`;
        btn.addEventListener('click', () => {
            currentPage = i;
            renderNews();
            renderPagination();
        });
        paginationContainer.appendChild(btn);
    }
}

// Filter and sort news
function filterAndSortNews() {
    let filtered = allNews;

    if (searchInput && searchInput.value.trim() !== '') {
        const keyword = searchInput.value.toLowerCase();
        filtered = filtered.filter(news => 
            news.title.toLowerCase().includes(keyword) || 
            news.body.toLowerCase().includes(keyword)
        );
    }

    if (categoryFilter && categoryFilter.value !== 'All') {
        filtered = filtered.filter(news => news.category === categoryFilter.value);
    }

    if (dateSort) {
        if (dateSort.value === 'newest') {
            filtered.sort((a, b) => b.date - a.date);
        } else if (dateSort.value === 'oldest') {
            filtered.sort((a, b) => a.date - b.date);
        }
    }

    if (sortSelect) {
        if (sortSelect.value === 'title-asc') {
            filtered.sort((a, b) => a.title.localeCompare(b.title));
        } else if (sortSelect.value === 'title-desc') {
            filtered.sort((a, b) => b.title.localeCompare(a.title));
        }
    }

    return filtered;
}

// Event listeners
if (searchInput) {
    searchInput.addEventListener('input', () => {
        currentPage = 1;
        renderNews();
        renderPagination();
    });
}

if (sortSelect) {
    sortSelect.addEventListener('change', () => {
        currentPage = 1;
        renderNews();
        renderPagination();
    });
}

if (categoryFilter) {
    categoryFilter.addEventListener('change', () => {
        currentPage = 1;
        renderNews();
        renderPagination();
    });
}

if (dateSort) {
    dateSort.addEventListener('change', () => {
        currentPage = 1;
        renderNews();
        renderPagination();
    });
}

// ==================== Display Single News in read.html ====================

function loadNewsDetails() {
    if (!newsDetailsContainer) return;

    newsDetailsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news details...</p>';

    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('id');

    if (!newsId) {
        newsDetailsContainer.innerHTML = '<p class="text-red-500">No news ID specified</p>';
        return;
    }

    // First try to find the news in the allNews array
    const newsItem = allNews.find(item => item.id === newsId);

    if (newsItem) {
        displayNewsDetails(newsItem);
    } else {
        // If not found in allNews, fetch directly from API
        fetch(`${API_URL}?id=${newsId}`)
            .then(response => {
                if (!response.ok) {
                    throw new Error('Failed to fetch news details');
                }
                return response.json();
            })
            .then(data => {
                if (Array.isArray(data) && data.length > 0) {
                    // Handle case where API returns an array
                    displayNewsDetails(data[0]);
                } else if (data && data.id) {
                    // Handle case where API returns a single object
                    displayNewsDetails(data);
                } else {
                    throw new Error('News not found');
                }
            })
            .catch(error => {
                console.error('Error fetching news details:', error);
                newsDetailsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
            });
    }
}

function displayNewsDetails(newsItem) {
    if (!newsDetailsContainer) return;

    newsDetailsContainer.innerHTML = `
        <h2 class="text-3xl font-bold mb-4">${newsItem.title}</h2>
        <p class="text-gray-600 mb-2"><strong>Author:</strong> ${newsItem.author}</p>
        <p class="text-gray-600 mb-2"><strong>Category:</strong> ${newsItem.category}</p>
        <p class="text-gray-600 mb-4"><strong>Date:</strong> ${new Date(newsItem.date).toDateString()}</p>
        <img src="${newsItem.image}" alt="News Image" class="rounded mb-6">
        <p class="text-gray-700">${newsItem.body || newsItem.content}</p>
    `;
}

// ==================== Form Validation for add.html ====================

const newsForm = document.getElementById('news-form');

if (newsForm) {
    newsForm.addEventListener('submit', function(event) {
        event.preventDefault();

        const title = document.getElementById('title').value.trim();
        const author = document.getElementById('author').value.trim();
        const content = document.getElementById('content').value.trim();
        const formError = document.getElementById('form-error');

        if (title === '' || author === '' || content === '') {
            formError.classList.remove('hidden');
        } else {
            formError.classList.add('hidden');
            alert('News added successfully (simulation).');
            window.location.href = 'MainPage.html';
        }
    });
}

// ==================== Comment Section for read.html ====================

const commentForm = document.getElementById('comment-form');
const commentsList = document.getElementById('comments-list');

if (commentForm) {
    commentForm.addEventListener('submit', function (e) {
        e.preventDefault();

        const name = document.getElementById('comment-name').value.trim();
        const text = document.getElementById('comment-text').value.trim();

        if (name && text) {
            const commentBox = document.createElement('div');
            commentBox.className = 'border p-4 rounded shadow-sm bg-gray-50';

            commentBox.innerHTML = `
                <p class="font-bold text-gray-800">${name}</p>
                <p class="text-gray-700 mt-1">${text}</p>
            `;

            commentsList.prepend(commentBox);
            commentForm.reset();
        }
    });
}

// Initialize the application
if (newsContainer || viewNewsContainer) {
    initializeNews();
}

if (newsDetailsContainer) {
    loadNewsDetails();
}