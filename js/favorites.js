// =========================================================================
// 1. ÉTAT & DONNÉES PAR DÉFAUT
// =========================================================================

const DEFAULT_FAVORITES = [
  { id: 1, title: 'GitHub', url: 'https://github.com', category: 'dev' },
  { id: 2, title: 'YouTube', url: 'https://youtube.com', category: 'media' },
  { id: 3, title: 'MDN Web', url: 'https://developer.mozilla.org', category: 'dev' }
];

let favorites = JSON.parse(localStorage.getItem('nexus_favs')) || DEFAULT_FAVORITES;
let currentCategory = 'all';
let isEditMode = false;

// =========================================================================
// 2. INITIALISATION & RENDU
// =========================================================================

export function initFavorites() {
  renderFavorites();
  bindEvents();
}

export function renderFavorites() {
  const container = document.getElementById('favoritesGrid');
  if (!container) return;

  const filtered = currentCategory === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.category === currentCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted, #888); text-align: center; grid-column: 1/-1; padding: 20px;">
        Aucun favori dans cette catégorie.
      </p>`;
    return;
  }

  container.innerHTML = filtered.map(fav => {
    // Normalisation du lien de favicon
    const domain = getDomainFromUrl(fav.url);
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;

    return `
      <div class="fav-card ${isEditMode ? 'edit-mode' : ''}" style="position: relative;">
        ${isEditMode ? `
          <button class="delete-fav-btn" data-id="${fav.id}" aria-label="Supprimer ${fav.title}" style="position: absolute; top: -6px; right: -6px; background: var(--secondary, #ff0055); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center;">
            <i class="fa-solid fa-xmark"></i>
          </button>
        ` : ''}
        <a href="${fav.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; gap: 8px;">
          <div class="fav-icon-wrapper" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
            <img src="${faviconUrl}" alt="${fav.title}" onerror="this.onerror=null; this.src='https://favicone.com/${domain}?size=64';" style="width: 24px; height: 24px; border-radius: 4px; object-fit: contain;">
          </div>
          <span class="fav-title" style="font-size: 0.85rem; text-align: center; font-weight: 500;">${fav.title}</span>
        </a>
      </div>
    `;
  }).join('');
}

// Extraire proprement le domaine d'une URL pour l'icône
function getDomainFromUrl(url) {
  try {
    const parsed = new URL(url);
    return parsed.hostname;
  } catch {
    return url;
  }
}

// =========================================================================
// 3. ÉCOUTEURS D'ÉVÉNEMENTS
// =========================================================================

function bindEvents() {
  const container = document.getElementById('favoritesGrid');
  
  // Supprimer un favori (Délégation d'événements unique et fluide)
  if (container) {
    container.addEventListener('click', (e) => {
      const deleteBtn = e.target.closest('.delete-fav-btn');
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(deleteBtn.dataset.id, 10);
        favorites = favorites.filter(fav => fav.id !== id);
        localStorage.setItem('nexus_favs', JSON.stringify(favorites));
        renderFavorites();
      }
    });
  }

  // Filtrage par catégorie
  document.querySelectorAll('#categoryFilters .cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#categoryFilters .cat-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.cat;
      renderFavorites();
    });
  });

  // Activer/Désactiver le mode édition
  const editBtn = document.getElementById('toggleEditFavs');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      editBtn.classList.toggle('active', isEditMode);
      renderFavorites();
    });
  }

  // Modale d'ajout
  const addBtn = document.getElementById('addFavBtn');
  const closeBtn = document.getElementById('closeAddFavBtn');
  const modal = document.getElementById('addFavModal');
  const form = document.getElementById('favForm');

  if (addBtn && modal) addBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const title = document.getElementById('favNameInput')?.value.trim();
      let url = document.getElementById('favUrlInput')?.value.trim();
      const category = document.getElementById('favCategoryInput')?.value || 'dev';

      if (!title || !url) return;

      // S'assurer que le protocole HTTP/HTTPS est présent
      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      favorites.push({ id: Date.now(), title, url, category });
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));

      form.reset();
      if (modal) modal.classList.remove('active');
      renderFavorites();
    });
  }
}
