// ========== GLOBAL VARIABLES ========== //
const apiURL = 'https://jsonplaceholder.typicode.com/posts';
let listings = [];
let currentPage = 1;
const itemsPerPage = 6;

const customTitles = [
  "MacBook Pro for Sale", "Used iPhone 12", "Gaming Chair with LED",
  "Complete Textbook Bundle", "Mountain Bike 21-Speed", "Wooden Study Desk",
  "Bluetooth Headphones", "Leather Backpack", "Cooking Set - Brand New",
  "Fitness Tracker Watch", "Camera Canon EOS", "Office Chair Ergonomic",
  "4K Monitor Samsung", "Wireless Mouse Logitech", "University Hoodie",
  "Samsung Galaxy Tablet", "External Hard Drive 2TB",
  "Stainless Water Bottle Set", "Smart Lamp with Bluetooth Speaker", "RGB Gaming Keyboard"
];

const customDescriptions = [
  "Excellent condition MacBook Pro, ideal for students and professionals.",
  "Gently used iPhone 12, 128GB, unlocked, with original accessories.",
  "Comfortable gaming chair with RGB LED lights, adjustable height.",
  "Bundle of college textbooks for business, finance, and marketing majors.",
  "Durable mountain bike, 21-speed gear system, suitable for all terrains.",
  "Spacious wooden study desk with storage drawers, perfect for dorm rooms.",
  "High-quality wireless Bluetooth headphones with noise cancellation.",
  "Stylish leather backpack, fits laptops up to 15 inches, multiple pockets.",
  "Complete 10-piece cooking set, brand new, stainless steel material.",
  "Fitness tracker with heart rate monitor, step counter, and sleep tracking.",
  "Canon EOS camera, great for photography students, includes 18-55mm lens.",
  "Ergonomic office chair with lumbar support and adjustable armrests.",
  "Ultra HD 4K Samsung monitor, 27-inch display, ideal for design students.",
  "Wireless Logitech mouse with smooth tracking and long battery life.",
  "Official university hoodie, available in multiple sizes, great quality.",
  "Samsung Galaxy tablet, 10-inch screen, Wi-Fi + LTE version.",
  "Seagate 2TB external hard drive, USB 3.0, compatible with Windows/Mac.",
  "Double-wall insulated stainless steel water bottle set (2 pieces).",
  "Smart bedside lamp with Bluetooth speaker and adjustable brightness.",
  "Mechanical gaming keyboard with customizable RGB backlighting."
];

// ========== FETCH DATA ========== //
async function fetchListings() {
  showLoading();
  try {
    const response = await fetch(apiURL);
    await new Promise(resolve => setTimeout(resolve, 100));

    if (!response.ok) throw new Error('Failed to fetch listings.');

    const data = await response.json();
    listings = data.slice(0, 20);

    const savedProducts = JSON.parse(localStorage.getItem('savedProducts')) || [];
    savedProducts.forEach((product, index) => {
      listings.unshift({
        id: `saved-${index}`,
        title: product.title,
        body: product.description,
        isSaved: true
      });
    });

    renderListings();
  } catch (error) {
    console.error('Error fetching listings:', error);
    showError('Failed to load listings. Please try again later.');
  }
}

// ========== RENDER LISTINGS ========== //
function renderListings() {
  const container = document.querySelector('.row.g-3');
  if (!container) return;

  container.innerHTML = '';

  const start = (currentPage - 1) * itemsPerPage;
  const end = start + itemsPerPage;
  const paginatedListings = listings.slice(start, end);

  paginatedListings.forEach(item => {
    const card = document.createElement('article');
    card.className = 'col-md-4';
    card.innerHTML = `
      <div class="card h-100">
        <div class="card-body">
          <h2 class="h5 card-title">${customTitles[item.id - 1] || item.title.substring(0, 20)}</h2>
          <p class="card-text">${customDescriptions[item.id - 1] || item.body.substring(0, 50)}...</p>
          <a href="detail.html?id=${item.id}" class="btn btn-primary mb-2">View Details</a>
        </div>
      </div>
    `;
    container.appendChild(card);
  });

  renderPagination();
}

// ========== RENDER PAGINATION ========== //
function renderPagination() {
  const totalPages = Math.ceil(listings.length / itemsPerPage);
  const pagination = document.querySelector('.pagination');
  if (!pagination) return;

  pagination.innerHTML = `
    <li class="page-item ${currentPage === 1 ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage - 1})">Previous</a>
    </li>
  `;

  for (let i = 1; i <= totalPages; i++) {
    pagination.innerHTML += `
      <li class="page-item ${i === currentPage ? 'active' : ''}">
        <a class="page-link" href="#" onclick="changePage(${i})">${i}</a>
      </li>
    `;
  }

  pagination.innerHTML += `
    <li class="page-item ${currentPage === totalPages ? 'disabled' : ''}">
      <a class="page-link" href="#" onclick="changePage(${currentPage + 1})">Next</a>
    </li>
  `;
}

function changePage(page) {
  currentPage = page;
  renderListings();
}

// ========== SHOW LOADING / ERROR ========== //
function showLoading() {
  const container = document.querySelector('.row.g-3');
  if (container) {
    container.innerHTML = `
      <div class="d-flex justify-content-center align-items-center" style="min-height: 200px;">
        <div class="spinner-border text-primary" role="status" style="width: 4rem; height: 4rem;">
          <span class="visually-hidden">Loading...</span>
        </div>
      </div>
    `;
  }
}

function hideLoading() {}
function showError(message) {
  const container = document.querySelector('.row.g-3');
  if (container) {
    container.innerHTML = `<div class="alert alert-danger w-100 text-center">${message}</div>`;
  }
}

// ========== FORM VALIDATION ========== //
function validateForm() {
  const form = document.querySelector('form');
  if (!form) return;

  form.addEventListener('submit', function (e) {
    e.preventDefault();

    if (!form.checkValidity()) {
      e.stopPropagation();
    } else {
      const titleInput = document.getElementById('listingTitle');
      const descriptionInput = document.getElementById('listingDescription');

      if (titleInput && descriptionInput) {
        const newProduct = {
          title: titleInput.value,
          description: descriptionInput.value
        };

        let savedProducts = JSON.parse(localStorage.getItem('savedProducts')) || [];
        savedProducts.push(newProduct);
        localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
      }

      window.location.href = 'index.html';
    }

    form.classList.add('was-validated');
  });
}

// ========== DETAIL VIEW WITH DELETE BUTTON ========== //
function loadDetailView() {
  const params = new URLSearchParams(window.location.search);
  const itemId = params.get('id');
  if (!itemId) return;

  const deleteButton = document.getElementById('deleteBtn');

  if (itemId.startsWith('saved-')) {
    const savedProducts = JSON.parse(localStorage.getItem('savedProducts')) || [];
    const index = parseInt(itemId.split('-')[1]);
    const product = savedProducts[index];

    if (product) {
      document.querySelector('h1.h1').textContent = product.title;
      document.querySelector('main .h2:nth-of-type(1) + p').textContent = product.description;
      document.querySelector('main .h2:nth-of-type(2) + p').textContent = 'Saved Item';

      if (deleteButton) {
        deleteButton.textContent = 'Delete Listing';
        deleteButton.onclick = function () {
          if (confirm('Are you sure you want to delete this listing?')) {
            savedProducts.splice(index, 1);
            localStorage.setItem('savedProducts', JSON.stringify(savedProducts));
            alert('Listing deleted successfully!');
            window.location.href = 'index.html';
          }
        };
      }
    } else {
      showError('Product not found.');
    }
  } else {
    fetch(`${apiURL}/${itemId}`)
      .then(response => response.json())
      .then(item => {
        document.querySelector('h1.h1').textContent = customTitles[item.id - 1] || item.title.substring(0, 20);
        document.querySelector('main .h2:nth-of-type(1) + p').textContent = customDescriptions[item.id - 1] || item.body;
        document.querySelector('main .h2:nth-of-type(2) + p').textContent = 'Electronics';

        if (deleteButton) {
          deleteButton.textContent = 'Delete Listing';
          deleteButton.onclick = function () {
            alert('Cannot delete default listings.');
          };
        }
      })
      .catch(error => {
        console.error('Error loading detail:', error);
        showError('Could not load item details.');
      });
  }
  
}

// ========== INITIALIZATION ========== //
document.addEventListener('DOMContentLoaded', () => {
  if (window.location.pathname.includes('index.html')) {
    fetchListings();
  }
  if (window.location.pathname.includes('create.html')) {
    validateForm();
  }
  if (window.location.pathname.includes('detail.html')) {
    loadDetailView();
  }
});
