document.addEventListener("DOMContentLoaded", () => {
  const pubContainer = document.getElementById("publications-list");
  const searchInput = document.getElementById("pub-search");
  const categoryFilter = document.getElementById("pub-filter-category");
  const yearFilter = document.getElementById("pub-filter-year");

  // Only run this script if we are on the publications page
  if (!pubContainer) return; 

  let publicationsData = [];

  // Fetch the publication data from the JSON file
  fetch("data/publications.json")
    .then(response => {
      if (!response.ok) {
        throw new Error("Could not load JSON file.");
      }
      return response.json();
    })
    .then(data => {
      publicationsData = data.publications;
      populateYearFilter(publicationsData);
      displayPublications(publicationsData);
    })
    .catch(error => {
      console.error("Error loading publications:", error);
      pubContainer.innerHTML = "<p style='padding: 20px; color: red;'>Error loading publications. Please check your JSON formatting.</p>";
    });

  // Function to build and display the HTML for each publication
  function displayPublications(pubs) {
    pubContainer.innerHTML = ""; // Clear current list

    if (pubs.length === 0) {
      pubContainer.innerHTML = "<p style='padding: 20px;'>No publications found matching your criteria.</p>";
      return;
    }

    pubs.forEach(pub => {
      // Automatically bold and underline your name
      const formattedAuthors = pub.authors.map(author =>
        author.includes("Islam, K. R.") ? `<strong><u>${author}</u></strong>` : author
      ).join(", ");

      // Create the layout for each paper
      const pubHTML = `
        <div class="publication-item" style="padding: 20px; border-bottom: 1px solid #ddd; margin-bottom: 10px;">
          <h3 style="margin: 0 0 10px 0; font-size: 1.2rem;">
            <a href="${pub.url}" target="_blank" style="color: #0056b3; text-decoration: none;">${pub.title}</a>
          </h3>
          <p style="margin: 0 0 5px 0; color: #333;">${formattedAuthors}</p>
          <p style="margin: 0 0 5px 0; font-style: italic; color: #555;">
            ${pub.journal} (${pub.year}) - <strong>${pub.metrics || pub.status || ""}</strong>
          </p>
        </div>
      `;
      pubContainer.innerHTML += pubHTML;
    });
  }

  // Automatically find all years in your JSON and add them to the dropdown
  function populateYearFilter(pubs) {
    if (!yearFilter) return;
    const years = [...new Set(pubs.map(pub => pub.year))].sort((a, b) => b - a);
    years.forEach(year => {
      const option = document.createElement("option");
      option.value = year;
      option.textContent = year;
      yearFilter.appendChild(option);
    });
  }

  // Make the search bar and dropdown filters work
  function filterPublications() {
    const searchTerm = searchInput ? searchInput.value.toLowerCase() : "";
    const category = categoryFilter ? categoryFilter.value : "all";
    const year = yearFilter ? yearFilter.value : "all";

    const filtered = publicationsData.filter(pub => {
      const matchesSearch = pub.title.toLowerCase().includes(searchTerm) ||
                            pub.authors.some(a => a.toLowerCase().includes(searchTerm)) ||
                            (pub.keywords && pub.keywords.some(k => k.toLowerCase().includes(searchTerm)));
      
      const matchesCategory = category === "all" || pub.type === category;
      const matchesYear = year === "all" || pub.year.toString() === year;

      return matchesSearch && matchesCategory && matchesYear;
    });

    displayPublications(filtered);
  }

  // Listen for typing in the search bar or changing dropdowns
  if (searchInput) searchInput.addEventListener("input", filterPublications);
  if (categoryFilter) categoryFilter.addEventListener("change", filterPublications);
  if (yearFilter) yearFilter.addEventListener("change", filterPublications);
});
