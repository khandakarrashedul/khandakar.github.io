/**
 * Academic Portfolio Client Scripts - Khandakar Rashedul Islam
 */

document.addEventListener('DOMContentLoaded', () => {
  initMobileNav();
  highlightActiveNavLink();
  initPublicationsPage();
});

/* Mobile Navigation Drawer Toggle */
function initMobileNav() {
  const hamburger = document.querySelector('.hamburger');
  const navMenu = document.querySelector('.nav-menu');

  if (hamburger && navMenu) {
    hamburger.addEventListener('click', () => {
      const isExpanded = hamburger.getAttribute('aria-expanded') === 'true';
      hamburger.setAttribute('aria-expanded', !isExpanded);
      navMenu.classList.toggle('is-active');
    });

    document.addEventListener('click', (e) => {
      if (!hamburger.contains(e.target) && !navMenu.contains(e.target)) {
        navMenu.classList.remove('is-active');
        hamburger.setAttribute('aria-expanded', 'false');
      }
    });
  }
}

/* Auto Highlight Current Page Navigation Link */
function highlightActiveNavLink() {
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  const navLinks = document.querySelectorAll('.nav-link');

  navLinks.forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
      link.setAttribute('aria-current', 'page');
    } else {
      link.classList.remove('active');
      link.removeAttribute('aria-current');
    }
  });
}

/* Dynamic Publication Fetch, Search & Filter */
async function initPublicationsPage() {
  const pubListContainer = document.getElementById('publications-list');
  const searchInput = document.getElementById('pub-search');
  const categoryFilter = document.getElementById('pub-filter-category');
  const yearFilter = document.getElementById('pub-filter-year');

  if (!pubListContainer) return;

  try {
    const response = await fetch('data/publications.json');
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    let publications = data.publications || [];

    // Populate Year Dropdown dynamically
    if (yearFilter) {
      const years = [...new Set(publications.map(p => p.year))].sort((a, b) => b - a);
      years.forEach(year => {
        const option = document.createElement('option');
        option.value = year;
        option.textContent = year;
        yearFilter.appendChild(option);
      });
    }

    const render = () => {
      const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
      const selectedCategory = categoryFilter ? categoryFilter.value : 'all';
      const selectedYear = yearFilter ? yearFilter.value : 'all';

      const filtered = publications.filter(pub => {
        const matchesQuery = 
          pub.title.toLowerCase().includes(query) ||
          pub.authors.some(a => a.toLowerCase().includes(query)) ||
          pub.journal.toLowerCase().includes(query) ||
          (pub.keywords && pub.keywords.some(k => k.toLowerCase().includes(query)));

        const matchesCategory = selectedCategory === 'all' || pub.type === selectedCategory;
        const matchesYear = selectedYear === 'all' || pub.year.toString() === selectedYear;

        return matchesQuery && matchesCategory && matchesYear;
      });

      renderPublicationList(filtered, pubListContainer);
    };

    if (searchInput) searchInput.addEventListener('input', render);
    if (categoryFilter) categoryFilter.addEventListener('change', render);
    if (yearFilter) yearFilter.addEventListener('change', render);

    render(); // Initial Render
  } catch (error) {
    console.error('Error loading publication dataset:', error);
    pubListContainer.innerHTML = `
      <p class="error-msg">Unable to load publications dynamically. Please check back shortly or access Google Scholar.</p>
    `;
  }
}

function renderPublicationList(pubs, container) {
  if (pubs.length === 0) {
    container.innerHTML = '<p style="padding:2rem; text-align:center; color:var(--text-muted);">No matching publications found.</p>';
    return;
  }

  container.innerHTML = pubs.map((pub, idx) => {
    const authorString = pub.authors.map(author => {
      if (author.includes('Islam, K. R.') || author.includes('Islam, Khandakar Rashedul')) {
        return `<span class="pub-author-me">${author}</span>`;
      }
      return author;
    }).join(', ');

    return `
      <article class="pub-card" id="pub-${pub.id || idx}">
        <a href="${pub.url || '#'}" target="_blank" rel="noopener" class="pub-title">${pub.title}</a>
        <p class="pub-authors">${authorString} (${pub.year})</p>
        <p class="pub-journal">
          <em>${pub.journal}</em> 
          ${pub.metrics ? `| <span class="badge badge-accent">${pub.metrics}</span>` : ''}
          ${pub.status ? `| <strong>Status: ${pub.status}</strong>` : ''}
        </p>
        <div style="margin-top: 0.5rem; display: flex; gap: 0.5rem; flex-wrap: wrap;">
          ${pub.doi ? `<a href="https://doi.org/${pub.doi}" target="_blank" rel="noopener" class="badge">DOI: ${pub.doi}</a>` : ''}
          <button class="badge" style="cursor:pointer;" onclick="copyBibtex('${encodeURIComponent(pub.bibtex || '')}')">Copy Citation</button>
        </div>
      </article>
    `;
  }).join('');
}

function copyBibtex(encodedBibtex) {
  const bibtex = decodeURIComponent(encodedBibtex);
  if (!bibtex) {
    alert('Citation data not available for this entry.');
    return;
  }
  navigator.clipboard.writeText(bibtex).then(() => {
    alert('BibTeX Citation copied to clipboard!');
  }).catch(err => {
    console.error('Copy failed', err);
  });
}
