/* ==========================================================================
   FAVORITES MANAGEMENT (Sécurisé XSS)
   ========================================================================== */

import { playSound } from './audio.js';

const DEFAULT_FAVORITES = [
  { id: '1', name: 'Google', url: 'https://google.com', category: 'dev', icon: 'https://www.google.com/favicon.ico' },
  { id: '2', name: 'YouTube', url: 'https://youtube.com', category: 'media', icon: 'https://www.youtube.com/favicon.ico' },
  { id: '3', name: 'GitHub', url: 'https://github.com', category: 'dev', icon: 'https://github.githubassets.com/favicons/favicon.png' },
  { id: '4', name: 'WordReference', url: 'https://wordreference.com', category: 'loisirs', icon: 'https://www.wordreference.com/favicon.ico' }
];

let favorites = [];
let currentCategory = 'all';
let editMode = false;

function escapeHTML(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function loadFavorites() {
  try {
    const stored = localStorage.getItem('nexus_favorites');
    favorites = stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
  } catch (e) {
    favorites = DEFAULT_FAVORITES;
  }
}

function saveFavorites() {
  try {
    localStorage.setItem('nexus_favorites', JSON.stringify(favorites));
  } catch (e) {
    console.warn('Impossible de sauvegarder les favoris:', e);
  }
}

export function initFavorites() {
  loadFavorites();
  renderFavorites();

  const categoryContainer = document.getElementById('categoryFilters');
  if (categoryContainer) {
    categoryContainer.addEventListener('click', (e) => {
      const btn = e.target.closest('.cat-btn');
      if (!btn) return;

      playSound('click');
      categoryContainer.querySelectorAll('.cat-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');

      currentCategory = btn.dataset.cat || 'all';
      renderFavorites();
    });
  }

  const toggleEditBtn = document.getElementById('toggleEditFavs');
  if (toggleEditBtn) {
    toggleEditBtn.addEventListener('click', () => {
      playSound('click');
      editMode = !editMode;
      toggleEditBtn.classList.toggle('active', editMode);
      renderFavorites();
    });
  }

  const addFavBtn = document.getElementById('addFavBtn');
  const addModal = document.getElementById('addFavModal');
  const closeAddBtn = document.getElementById('closeAddFavBtn');
  const favForm = document.getElementById('favForm');

  if (addFavBtn && addModal) {
    addFavBtn.addEventListener('click', () => {
      playSound('click');
      addModal.classList.add('active');
    });
  }

  if (closeAddBtn && addModal) {
    closeAddBtn.addEventListener('click', () => {
      playSound('click');
      addModal.classList.remove('active');
    });
  }

  if (favForm) {
    favForm.addEventListener('submit', (e) => {
      e.preventDefault();
      playSound('click');

      const name = document.getElementById('favNameInput')?.value.trim();
      let url = document.getElementById('favUrlInput')?.value.trim();
      const category = document.getElementById('favCategoryInput')?.value || 'dev';

      if (!name || !url) return;

      if (!/^https?:\/\//i.test(url)) {
        url = 'https://' + url;
      }

      let icon = '';
      try {
        const parsed = new URL(url);
        icon = `${parsed.origin}/favicon.ico`;
      } catch (err) {
        icon = '';
      }

      favorites.push({
        id: Date.now().toString(),
        name,
        url,
        category,
        icon
      });

      saveFavorites();
      renderFavorites();

      favForm.reset();
      addModal?.classList.remove('active');
    });
  }
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;

  grid.innerHTML = '';

  const filtered = currentCategory === 'all'
    ? favorites
    : favorites.filter(f => f.category === currentCategory);

  filtered.forEach(fav => {
    const card = document.createElement('a');
    card.className = 'fav-card';
    card.href = fav.url;
    card.target = '_blank';
    card.rel = 'noopener noreferrer';

    card.addEventListener('mouseenter', () => playSound('hover'));

    const safeName = escapeHTML(fav.name);
    const safeIcon = escapeHTML(fav.icon);

    card.innerHTML = `
      <img src="${safeIcon}" alt="" onerror="this.src='data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🌐</text></svg>'">
      <span>${safeName}</span>
    `;

    if (editMode) {
      const delBtn = document.createElement('button');
      delBtn.className = 'fav-delete-btn';
      delBtn.innerHTML = '<i class="fa-solid fa-xmark"></i>';
      delBtn.ariaLabel = `Supprimer ${safeName}`;
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playSound('click');
        favorites = favorites.filter(f => f.id !== fav.id);
        saveFavorites();
        renderFavorites();
      });
      card.appendChild(delBtn);
    }

    grid.appendChild(card);
  });
}
