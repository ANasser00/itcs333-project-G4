
document.addEventListener("DOMContentLoaded", () => {
  
    const mockDataUrl = "https://jsonplaceholder.typicode.com/posts"; 
  
    
    const path = window.location.pathname;
  
    
    function showLoading(container) {
      container.innerHTML = "<p>Loading...</p>";
    }
  
    
    function showError(container, message) {
      container.innerHTML = `<p style='color: red;'>${message}</p>`;
    }
  
    
    if (path.includes("listing.html")) {
      const listingGrid = document.querySelector(".listing-grid");
      if (listingGrid) {
        showLoading(listingGrid);
        fetch(mockDataUrl)
          .then((res) => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
          })
          .then((data) => {
          
            const reviews = data.slice(0, 5);
            listingGrid.innerHTML = "";
            reviews.forEach((item) => {
              const card = document.createElement("div");
              card.className = "review-card";
              card.innerHTML = `
                <h3>Course Title ${item.id}</h3>
                <p><strong>Instructor:</strong> Instructor ${item.id}</p>
                <p><strong>Rating:</strong> ★★★★☆</p>
                <a href="detail.html?id=${item.id}">View Details</a>
              `;
              listingGrid.appendChild(card);
            });
          })
          .catch(() => showError(listingGrid, "Failed to load course reviews."));
      }
    }
  
    // CREATE PAGE
    if (path.includes("create.html")) {
      const form = document.querySelector("form");
      if (form) {
        form.addEventListener("submit", (e) => {
          e.preventDefault();
          let isValid = true;
          const course = document.getElementById("course");
          const instructor = document.getElementById("instructor");
          const rating = document.getElementById("rating");
          const review = document.getElementById("review");
  
          [course, instructor, rating, review].forEach((field) => {
            field.style.border = "";
          });
  
          if (!course.value.trim()) {
            course.style.border = "2px solid red";
            isValid = false;
          }
          if (!instructor.value.trim()) {
            instructor.style.border = "2px solid red";
            isValid = false;
          }
          if (!review.value.trim()) {
            review.style.border = "2px solid red";
            isValid = false;
          }
          if (!(rating.value >= 1 && rating.value <= 5)) {
            rating.style.border = "2px solid red";
            isValid = false;
          }
  
          if (isValid) {
            alert("Form is valid! (In real implementation, this would be submitted)");
          }
        });
      }
    }
  
    
    if (path.includes("detail.html")) {
      const urlParams = new URLSearchParams(window.location.search);
      const reviewId = urlParams.get("id");
      const container = document.querySelector(".review-detail");
  
      if (reviewId && container) {
        showLoading(container);
        fetch(`${mockDataUrl}/${reviewId}`)
          .then((res) => {
            if (!res.ok) throw new Error("Network error");
            return res.json();
          })
          .then((data) => {
            container.innerHTML = `
              <h2>Course: Course Title ${data.id}</h2>
              <p><strong>Instructor:</strong> Instructor ${data.id}</p>
              <p><strong>Rating:</strong> ★★★★☆</p>
              <p><strong>Review:</strong> ${data.body}</p>
  
              <div class="review-actions">
                <button class="edit">Edit</button>
                <button class="delete">Delete</button>
                <a href="listing.html" class="back-link">Back to Listing</a>
              </div>
  
              <section class="comments">
                <h3>Comments</h3>
                <div class="comment-box">Comments section (design only)</div>
              </section>
            `;
          })
          .catch(() => showError(container, "Unable to load review details."));
      }
    }
  });
  