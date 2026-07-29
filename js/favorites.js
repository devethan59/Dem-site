// =========================================================================
// 1. ÉTAT ET FAVORIS PAR DÉFAUT
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
// 2. EXPORT PRINCIPAL (Appelé par app.js)
// =========================================================================

export function initFavorites() {
  renderFavorites();
  bindEvents();
}

// =========================================================================
// 3. RENDU DES FAVORIS DANS LE DOM
// =========================================================================

export function renderFavorites() {
  const container = document.getElementById('favoritesGrid');
  if (!container) return;

  // Filtrage selon la catégorie sélectionnée
  const filtered = currentCategory === 'all' 
    ? favorites 
    : favorites.filter(fav => fav.category === currentCategory);

  if (filtered.length === 0) {
    container.innerHTML = `
      <p style="color: var(--text-muted); text-align: center; grid-column: 1/-1; padding: 20px;">
        Aucun favori enregistré dans cette catégorie.
      </p>`;
    return;
  }

  // Génération du HTML des cartes
  container.innerHTML = filtered.map(fav => `
    <div class="fav-card ${isEditMode ? 'edit-mode' : ''}" style="position: relative;">
      ${isEditMode ? `
        <button class="delete-fav-btn" data-id="${fav.id}" title="Supprimer" style="position: absolute; top: -6px; right: -6px; background: var(--secondary, #ff0055); color: #fff; border: none; border-radius: 50%; width: 22px; height: 22px; cursor: pointer; z-index: 10; display: flex; align-items: center; justify-content: center; font-size: 12px;">
          <i class="fa-solid fa-xmark"></i>
        </button>
      ` : ''}
      <a href="${fav.url}" target="_blank" rel="noopener noreferrer" style="text-decoration: none; color: inherit; display: flex; flex-direction: column; align-items: center; gap: 8px;">
        <div class="fav-icon-wrapper" style="width: 40px; height: 40px; display: flex; align-items: center; justify-content: center;">
          <img src="https://www.google.com/s2/favicons?domain=${fav.url}&sz=64" alt="${fav.title}" style="width: 24px; height: 24px; border-radius: 4px;">
        </div>
        <span class="fav-title" style="font-size: 0.85rem; text-align: center; font-weight: 500;">${fav.title}</span>
      </a>
    </div>
  `).join('');

  // Gestion des clics de suppression en mode édition
  if (isEditMode) {
    container.querySelectorAll('.delete-fav-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        const id = parseInt(e.currentTarget.dataset.id);
        deleteFavorite(id);
      });
    });
  }
}

function deleteFavorite(id) {
  favorites = favorites.filter(f => f.id !== id);
  localStorage.setItem('nexus_favs', JSON.stringify(favorites));
  renderFavorites();
}

// =========================================================================
// 4. ÉCOUTEURS D'ÉVÉNEMENTS
// =========================================================================

function bindEvents() {
  // Filtres par catégorie
  document.querySelectorAll('#categoryFilters .cat-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      document.querySelectorAll('#categoryFilters .cat-btn').forEach(b => b.classList.remove('active'));
      e.currentTarget.classList.add('active');
      currentCategory = e.currentTarget.dataset.cat;
      renderFavorites();
    });
  });

  // Basculer le mode édition
  const editBtn = document.getElementById('toggleEditFavs');
  if (editBtn) {
    editBtn.addEventListener('click', () => {
      isEditMode = !isEditMode;
      editBtn.classList.toggle('active', isEditMode);
      renderFavorites();
    });
  }

  // Modale d'ajout de favori
  const addBtn = document.getElementById('addFavBtn');
  const closeAddBtn = document.getElementById('closeAddFavBtn');
  const modal = document.getElementById('addFavModal');
  const form = document.getElementById('favForm');

  if (addBtn && modal) addBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeAddBtn && modal) closeAddBtn.addEventListener('click', () => modal.classList.remove('active'));

  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const name = document.getElementById('favNameInput')?.value.trim();
      let url = document.getElementById('favUrlInput')?.value.trim();
      const category = document.getElementById('favCategoryInput')?.value || 'dev';

      if (!name || !url) return;

      // Ajouter https:// si l'utilisateur l'a oublié
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      const newFav = { id: Date.now(), title: name, url, category };
      favorites.push(newFav);
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));

      form.reset();
      if (modal) modal.classList.remove('active');
      renderFavorites();
    });
  }
}
