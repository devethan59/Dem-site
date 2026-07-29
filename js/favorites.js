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
  const toggleEditBtn = document.getElementById('toggleEditFavs') || document.querySelector('.fa-pen-to-square')?.parentElement;
  const addFavBtn = document.getElementById('addFavBtn') || document.querySelector('.fa-plus')?.parentElement;
  const addModal = document.getElementById('addFavModal');
  const closeModalBtn = addModal?.querySelector('.fa-xmark')?.parentElement || addModal?.querySelector('.close-modal');
  
  // Bouton de validation dans la modal
  const saveFavBtn = document.getElementById('saveFavBtn') || addModal?.querySelector('button[type="submit"]') || addModal?.querySelector('button:not(.close-modal)');
  const favForm = addModal?.querySelector('form');

  const catBtns = document.querySelectorAll('.cat-btn') || document.querySelectorAll('[data-cat]');

  renderFavorites();

  // Mode Édition
  toggleEditBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    playUiSound(400, 0.05);
    isEditing = !isEditing;
    toggleEditBtn.classList.toggle('active', isEditing);
    document.getElementById('favoritesGrid')?.classList.toggle('editing', isEditing);
  });

  // Ouvrir Modal d'ajout (+ nouveau favori)
  addFavBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    playUiSound(500, 0.05);
    if (addModal) {
      addModal.classList.add('active');
      addModal.style.display = 'flex'; // Sécurité d'affichage
    }
  });

  // Fermer Modal
  const closeModal = () => {
    playUiSound(400, 0.05);
    if (addModal) {
      addModal.classList.remove('active');
      addModal.style.display = 'none';
    }
  };

  closeModalBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    closeModal();
  });

  addModal?.addEventListener('click', (e) => {
    if (e.target === addModal) closeModal();
  });

  // Filtrage par catégories (Tous, Dev, Médias, Loisirs)
  catBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      playUiSound(550, 0.03);
      
      catBtns.forEach(b => {
        b.classList.remove('active');
        b.style.opacity = '0.6';
        b.style.borderColor = 'transparent';
      });

      btn.classList.add('active');
      btn.style.opacity = '1';
      btn.style.borderColor = 'var(--primary)';

      // Mapping normalisé des filtres
      const rawCat = (btn.dataset.cat || btn.textContent.trim()).toLowerCase();
      if (rawCat.includes('tous') || rawCat === 'all') currentCategory = 'all';
      else if (rawCat.includes('dev')) currentCategory = 'dev';
      else if (rawCat.includes('médias') || rawCat.includes('media')) currentCategory = 'media';
      else if (rawCat.includes('loisirs')) currentCategory = 'loisirs';
      else currentCategory = rawCat;

      renderFavorites();
    });
  });

  // Fonction de création du favori
  const handleSave = (e) => {
    if (e) e.preventDefault(); // Empêche le rechargement de la page

    const nameInput = document.getElementById('favNameInput') || addModal?.querySelector('input[type="text"]');
    const urlInput = document.getElementById('favUrlInput') || addModal?.querySelector('input[type="url"]') || addModal?.querySelectorAll('input')[1];
    const catSelect = document.getElementById('favCategoryInput') || addModal?.querySelector('select');

    const name = nameInput?.value.trim();
    let url = urlInput?.value.trim();
    let category = catSelect?.value || 'dev';

    if (!name || !url) {
      alert('Veuillez remplir le nom et l\'URL.');
      return;
    }

    playUiSound(800, 0.05);

    // Ajout automatique du HTTPS si manquant
    if (!url.startsWith('http://') && !url.startsWith('https://')) {
      url = 'https://' + url;
    }

    // Normalisation de la catégorie
    category = category.toLowerCase();
    if (category.includes('média')) category = 'media';
    if (category.includes('loisir')) category = 'loisirs';

    favorites.push({ name, url, category });
    localStorage.setItem('nexus_favs', JSON.stringify(favorites));

    if (nameInput) nameInput.value = '';
    if (urlInput) urlInput.value = '';

    closeModal();
    renderFavorites();
  };

  // Écoute sur le bouton ET le submit du formulaire
  saveFavBtn?.addEventListener('click', handleSave);
  favForm?.addEventListener('submit', handleSave);
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid') || document.querySelector('.favorites-grid');
  if (!grid) return;

  grid.innerHTML = '';

  const filteredFavs = currentCategory === 'all' 
    ? favorites 
    : favorites.filter(f => {
        const c = f.category.toLowerCase();
        if (currentCategory === 'media') return c === 'media' || c === 'médias';
        if (currentCategory === 'loisirs') return c === 'loisirs' || c === 'social';
        return c === currentCategory;
      });

  if (filteredFavs.length === 0) {
    grid.innerHTML = `<div style="grid-column: 1/-1; text-align: center; color: #666; font-size: 0.85rem; padding: 20px;">Aucun favori dans cette catégorie.</div>`;
    return;
  }

  filteredFavs.forEach((fav) => {
    const card = document.createElement('a');
    card.href = fav.url;
    card.target = '_blank';
    card.className = 'fav-card';
    
    let domain = 'google.com';
    try {
      domain = new URL(fav.url).hostname;
    } catch (e) {}

    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const firstLetter = fav.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <button class="delete-fav-btn" title="Supprimer"><i class="fa-solid fa-xmark"></i></button>
      <div class="fav-icon-wrapper">
        <img src="${faviconUrl}" alt="${fav.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
        <span class="fav-icon-fallback" style="display:none;">${firstLetter}</span>
      </div>
      <span class="fav-title">${fav.name}</span>
    `;

    // Suppression du favori
    card.querySelector('.delete-fav-btn')?.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playUiSound(250, 0.08);
      favorites = favorites.filter(f => f !== fav);
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));
      renderFavorites();
    });

    card.addEventListener('click', (e) => {
      if (isEditing) {
        e.preventDefault();
      } else {
        playUiSound(750, 0.04);
      }
    });

    grid.appendChild(card);
  });
}
