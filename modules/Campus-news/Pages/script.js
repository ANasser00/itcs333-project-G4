// ==================== Fetch and Display News ====================

// Constants
const API_URL = 'https://jsonplaceholder.typicode.com/posts';
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
if (newsContainer || viewNewsContainer) {
    if (newsContainer) newsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news...</p>';
    if (viewNewsContainer) viewNewsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news...</p>';

    fetch(API_URL)
        .then(response => {
            if (!response.ok) {
                throw new Error('Failed to fetch news');
            }
            return response.json();
        })
        .then(data => {
            allNews = data.slice(0, 30).map(item => ({
                ...item,
                author: "John Doe",
                category: ["Events", "Announcement", "Opportunity"][Math.floor(Math.random() * 3)],
                date: new Date(Date.now() - Math.floor(Math.random() * 10000000000)),
                image: "https://via.placeholder.com/600x300"
            }));
            renderNews();
            renderPagination();
        })
        .catch(error => {
            if (newsContainer) newsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
            if (viewNewsContainer) viewNewsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
        });
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
            <p class="text-gray-700 mb-4">${news.body.substring(0, 100)}...</p>
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

if (newsDetailsContainer) {
    newsDetailsContainer.innerHTML = '<p class="text-center text-gray-600">Loading news details...</p>';

    const params = new URLSearchParams(window.location.search);
    const newsId = params.get('id');

    if (newsId) {
        fetch(`${API_URL}/${newsId}`)
            .then(response => response.json())
            .then(news => {
                const fakeAuthor = "John Doe";
                const fakeCategory = ["Events", "Announcement", "Opportunity"][Math.floor(Math.random() * 3)];
                const fakeDate = new Date(Date.now() - Math.floor(Math.random() * 10000000000));
                const fakeImage = "https://via.placeholder.com/600x300";

                newsDetailsContainer.innerHTML = `
                    <h2 class="text-3xl font-bold mb-4">${news.title}</h2>
                    <p class="text-gray-600 mb-2"><strong>Author:</strong> ${fakeAuthor}</p>
                    <p class="text-gray-600 mb-2"><strong>Category:</strong> ${fakeCategory}</p>
                    <p class="text-gray-600 mb-4"><strong>Date:</strong> ${fakeDate.toDateString()}</p>
                    <img src="${fakeImage}" alt="News Image" class="rounded mb-6">
                    <p class="text-gray-700">${news.body}</p>
                `;
            })
            .catch(error => {
                newsDetailsContainer.innerHTML = `<p class="text-red-500">${error.message}</p>`;
            });
    }
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