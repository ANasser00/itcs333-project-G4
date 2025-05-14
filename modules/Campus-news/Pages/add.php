<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Add News - Campus Hub</title>
  <link href="https://cdn.jsdelivr.net/npm/tailwindcss@2.2.19/dist/tailwind.min.css" rel="stylesheet">
  <script>
    // Function to get URL parameters
    function getUrlParams() {
      const params = {};
      const queryString = window.location.search.substring(1);
      const pairs = queryString.split('&');

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=');
        params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '');
      }

      return params;
    }

    // Function to display errors or success message
    window.onload = function() {
      const params = getUrlParams();

      // Display success message if present
      if (params.success === '1') {
        const successAlert = document.createElement('div');
        successAlert.className = 'bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4 max-w-xl mx-auto';
        successAlert.setAttribute('role', 'alert');
        successAlert.innerHTML = '<span class="block sm:inline">News added successfully!</span>';

        const main = document.querySelector('main');
        main.insertBefore(successAlert, main.firstChild);
      }

      // Display errors if present
      if (params.errors) {
        try {
          const errors = JSON.parse(params.errors);

          // Display each error next to its field
          for (const [field, message] of Object.entries(errors)) {
            const errorElement = document.querySelector(`#${field}-error`);
            if (errorElement) {
              errorElement.textContent = message;
              errorElement.classList.remove('hidden');

              // Add red border to the input
              const inputElement = document.querySelector(`#${field}`);
              if (inputElement) {
                inputElement.classList.add('border-red-500');
              }
            }
          }

          // Display general error at the top if present
          if (errors.general) {
            const generalError = document.createElement('div');
            generalError.className = 'bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4 max-w-xl mx-auto';
            generalError.setAttribute('role', 'alert');
            generalError.innerHTML = `<span class="block sm:inline">${errors.general}</span>`;

            const main = document.querySelector('main');
            main.insertBefore(generalError, main.firstChild);
          }
        } catch (e) {
          console.error("Error parsing error parameters:", e);
        }
      }
    };
  </script>
</head>
<body class="bg-gray-100">

  <!-- Header -->
  <header class="bg-white shadow">
    <div class="container mx-auto px-4 py-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-gray-800">Add News</h1>
      <a href="MainPage.html" class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
        Back to News
      </a>
    </div>
  </header>

  <!-- Main content -->
  <main class="container mx-auto px-4 py-6">
    <form method="post" action="ITCS333Project/api/news/add.php" id="news-form" class="bg-white p-6 rounded shadow-md space-y-4 max-w-xl mx-auto" enctype="multipart/form-data">

      <!-- Title -->
      <div>
        <label for="title" class="block text-gray-700 font-bold mb-2">Title<span class="text-red-500">*</span></label>
        <input type="text" id="title" name="title" class="border p-2 rounded w-full" required>
        <span id="title-error" class="text-red-500 text-sm hidden"></span>
      </div>

      <!-- Author Name -->
      <div>
        <label for="author" class="block text-gray-700 font-bold mb-2">Author Name<span class="text-red-500">*</span></label>
        <input type="text" id="author" name="author" class="border p-2 rounded w-full" required>
        <span id="author-error" class="text-red-500 text-sm hidden"></span>
      </div>

      <!-- Category -->
      <div>
        <label for="category" class="block text-gray-700 font-bold mb-2">Category</label>
        <select id="category" name="category" class="border p-2 rounded w-full">
          <option value="Events">Events</option>
          <option value="Announcement">Announcement</option>
          <option value="Opportunity">Opportunity</option>
        </select>
      </div>

      <!-- Date -->
      <div>
        <label for="date" class="block text-gray-700 font-bold mb-2">Date</label>
        <input type="date" id="date" name="date" class="border p-2 rounded w-full">
        <script>
          // Set default date to today
          document.getElementById('date').valueAsDate = new Date();
        </script>
      </div>

      <!-- Image Upload -->
      <div>
        <label for="image" class="block text-gray-700 font-bold mb-2">Image (optional)</label>
        <input type="file" id="image" name="image" class="border p-2 rounded w-full">
        <span id="upload-error" class="text-red-500 text-sm hidden"></span>
      </div>

      <!-- Content -->
      <div>
        <label for="content" class="block text-gray-700 font-bold mb-2">Content<span class="text-red-500">*</span></label>
        <textarea id="content" name="content" class="border p-2 rounded w-full" rows="5" required></textarea>
        <span id="content-error" class="text-red-500 text-sm hidden"></span>
      </div>

      <!-- Buttons -->
      <div class="flex justify-between">
        <button type="submit" class="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded">
          Submit
        </button>
        <a href="MainPage.html" class="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded">
          Cancel
        </a>
      </div>

    </form>
  </main>

  <!-- Footer -->
  <footer class="bg-white shadow mt-12">
    <div class="container mx-auto px-4 py-6 text-center text-gray-600">
      &copy; 2025 Campus Hub. All rights reserved.
    </div>
  </footer>

</body>
</html>
