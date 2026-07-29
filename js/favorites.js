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
  const catBtns = document.querySelectorAll('.cat-btn');

  renderFavorites();

  toggleEditBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    isEditing = !isEditing;
    toggleEditBtn.classList.toggle('active', isEditing);
    document.getElementById('favoritesGrid')?.classList.toggle('editing', isEditing);
  });

  catBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playUiSound(550, 0.03);
      catBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentCategory = btn.dataset.cat;
      renderFavorites();
    });
  });

  document.getElementById('saveFavBtn')?.addEventListener('click', () => {
    const name = document.getElementById('favNameInput').value.trim();
    let url = document.getElementById('favUrlInput').value.trim();
    const category = document.getElementById('favCategoryInput').value;

    if (name && url) {
      playUiSound(800, 0.05);
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      favorites.push({ name, url, category });
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));
      renderFavorites();
      
      document.getElementById('favNameInput').value = '';
      document.getElementById('favUrlInput').value = '';
      document.getElementById('addFavModal')?.classList.remove('active');
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
    
    const domain = new URL(fav.url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const firstLetter = fav.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <button class="delete-fav-btn"><i class="fa-solid fa-xmark"></i></button>
      <div class="fav-icon-wrapper">
        <img src="${faviconUrl}" alt="${fav.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <span class="fav-icon-fallback" style="display:none;">${firstLetter}</span>
      </div>
      <span class="fav-title">${fav.name}</span>
    `;

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
