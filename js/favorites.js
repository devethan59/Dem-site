import { playUiSound } from './audio.js';

let defaultFavs = [
  { name: 'Google', url: 'https://google.com', category: 'dev' },
  { name: 'YouTube', url: 'https://youtube.com', category: 'media' },
  { name: 'GitHub', url: 'https://github.com', category: 'dev' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', category: 'social' }
];

let favorites = JSON.parse(localStorage.getItem('nexus_favs')) || defaultFavs;
let isEditing = false;
let currentCategory = 'all';

export function initFavorites() {
  const toggleEditBtn = document.getElementById('toggleEditFavs');
  const addFavBtn = document.getElementById('addFavBtn');
  const addModal = document.getElementById('addFavModal');
  const closeModalBtn = addModal?.querySelector('.fa-xmark')?.parentElement;
  const saveFavBtn = document.getElementById('saveFavBtn');
  const catBtns = document.querySelectorAll('.cat-btn');

  renderFavorites();

  // Mode Édition
  toggleEditBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    isEditing = !isEditing;
    toggleEditBtn.classList.toggle('active', isEditing);
    document.getElementById('favoritesGrid')?.classList.toggle('editing', isEditing);
  });

  // Ouvrir Modal d'ajout
  addFavBtn?.addEventListener('click', () => {
    playUiSound(500, 0.05);
    addModal?.classList.add('active');
  });

  // Fermer Modal
  closeModalBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    addModal?.classList.remove('active');
  });

  // Filtrage par catégories
  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playUiSound(550, 0.03);
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderFavorites();
    });
  });

  // Sauvegarder un nouveau favori
  saveFavBtn?.addEventListener('click', () => {
    const nameInput = document.getElementById('favNameInput');
    const urlInput = document.getElementById('favUrlInput');
    const catSelect = document.getElementById('favCategoryInput');

    const name = nameInput?.value.trim();
    let url = urlInput?.value.trim();
    const category = catSelect?.value || 'dev';

    if (name && url) {
      playUiSound(800, 0.05);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }

      favorites.push({ name, url, category });
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));

      if (nameInput) nameInput.value = '';
      if (urlInput) urlInput.value = '';

      addModal?.classList.remove('active');
      renderFavorites();
    }
  });
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  if (!grid) return;
  grid.innerHTML = '';

  const filteredFavs = currentCategory === 'all' 
    ? favorites 
    : favorites.filter(f => f.category === currentCategory);

  filteredFavs.forEach((fav) => {
    const card = document.createElement('a');
    card.href = fav.url;
    card.className = 'fav-card';
    
    let domain = 'google.com';
    try {
      domain = new URL(fav.url).hostname;
    } catch (e) {}

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const firstLetter = fav.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <button class="delete-fav-btn"><i class="fa-solid fa-xmark"></i></button>
      <div class="fav-icon-wrapper">
        <img src="${faviconUrl}" alt="${fav.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="fav-icon-fallback" style="display:none;">${firstLetter}</span>
      </div>
      <span class="fav-title">${fav.name}</span>
    `;

    // Suppression
    card.querySelector('.delete-fav-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playUiSound(250, 0.08);
      favorites = favorites.filter(f => f !== fav);
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));
      renderFavorites();
    });

    card.addEventListener('click', (e) => {
      if (isEditing) e.preventDefault();
      else playUiSound(750, 0.04);
    });

    grid.appendChild(card);
  });
}
