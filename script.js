/* ==========================================================================
   NEXUS CORE SYSTEM - JS ENGINE
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initSearchEngine();
  initFavorites();
  initModals();
  initSettings();
  initParticles();
});

/* ==========================================================================
   1. HORLOGE ET DATES
   ========================================================================== */
function initClock() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');

  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long' };

  function update() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('fr-FR');
    
    let strDate = now.toLocaleDateString('fr-FR', optionsDate);
    dateEl.textContent = strDate.charAt(0).toUpperCase() + strDate.slice(1);
  }

  update();
  setInterval(update, 1000);
}

/* ==========================================================================
   2. RECHERCHE HYBRIDE & MOTEURS
   ========================================================================== */
function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const engineBtn = document.getElementById('engineBtn');
  const engineIcon = document.getElementById('engineIcon');
  const dropdown = document.getElementById('engineDropdown');
  const options = document.querySelectorAll('.engine-option');

  let currentAction = 'https://www.google.com/search';
  let currentParam = 'q';

  // Toggle Dropdown
  engineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => dropdown.classList.remove('show'));

  // Sélection du moteur
  options.forEach(opt => {
    opt.addEventListener('click', () => {
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentAction = opt.dataset.action;
      currentParam = opt.dataset.param || 'q';
      
      // Mise à jour de l'icône du bouton
      engineIcon.className = opt.dataset.icon;
      dropdown.classList.remove('show');
      input.focus();
    });
  });

  // Soumission
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    const searchUrl = `${currentAction}?${currentParam}=${encodeURIComponent(query)}`;
    window.location.href = searchUrl;
  });
}

/* ==========================================================================
   3. GESTION DES FAVORIS ET FAVICONS
   ========================================================================== */
let defaultFavs = [
  { name: 'Google', url: 'https://google.com' },
  { name: 'YouTube', url: 'https://youtube.com' },
  { name: 'GitHub', url: 'https://github.com' },
  { name: 'Wikipedia', url: 'https://wikipedia.org' }
];

let favorites = JSON.parse(localStorage.getItem('nexus_favs')) || defaultFavs;
let isEditing = false;

function initFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const toggleEditBtn = document.getElementById('toggleEditFavs');

  renderFavorites();

  toggleEditBtn.addEventListener('click', () => {
    isEditing = !isEditing;
    toggleEditBtn.classList.toggle('active', isEditing);
    grid.classList.toggle('editing', isEditing);
  });
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  grid.innerHTML = '';

  favorites.forEach((fav, index) => {
    const card = document.createElement('a');
    card.href = fav.url;
    card.className = 'fav-card';
    
    // Récupération automatique de la Favicon Google API
    const domain = new URL(fav.url).hostname;
    const faviconUrl = `https://www.google.com/s2/favicons?domain=${domain}&sz=64`;
    const firstLetter = fav.name.charAt(0).toUpperCase();

    card.innerHTML = `
      <button class="delete-fav-btn" data-index="${index}"><i class="fa-solid fa-xmark"></i></button>
      <div class="fav-icon-wrapper">
        <img src="${faviconUrl}" alt="${fav.name}" onerror="this.style.display='none'; this.nextElementSibling.style.display='block';">
        <span class="fav-icon-fallback" style="display:none;">${firstLetter}</span>
      </div>
      <span class="fav-title">${fav.name}</span>
    `;

    // Clic suppression
    const delBtn = card.querySelector('.delete-fav-btn');
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      deleteFavorite(index);
    });

    // Éviter l'ouverture si on est en mode édition
    card.addEventListener('click', (e) => {
      if (isEditing) e.preventDefault();
    });

    grid.appendChild(card);
  });
}

function deleteFavorite(index) {
  favorites.splice(index, 1);
  localStorage.setItem('nexus_favs', JSON.stringify(favorites));
  renderFavorites();
}

/* ==========================================================================
   4. MODALES ET INTERACTION
   ========================================================================== */
function initModals() {
  const settingsModal = document.getElementById('settingsModal');
  const addFavModal = document.getElementById('addFavModal');
  
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const openAddFavModal = document.getElementById('openAddFavModal');
  
  const closeBtns = document.querySelectorAll('.close-modal');

  openSettingsBtn.addEventListener('click', () => settingsModal.classList.add('active'));
  openAddFavModal.addEventListener('click', () => addFavModal.classList.add('active'));

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      settingsModal.classList.remove('active');
      addFavModal.classList.remove('active');
    });
  });

  // Ajouter un favori
  const saveFavBtn = document.getElementById('saveFavBtn');
  saveFavBtn.addEventListener('click', () => {
    const name = document.getElementById('favNameInput').value.trim();
    let url = document.getElementById('favUrlInput').value.trim();

    if (name && url) {
      if (!url.startsWith('http://') && !url.startsWith('https://')) {
        url = 'https://' + url;
      }
      favorites.push({ name, url });
      localStorage.setItem('nexus_favs', JSON.stringify(favorites));
      renderFavorites();
      
      document.getElementById('favNameInput').value = '';
      document.getElementById('favUrlInput').value = '';
      addFavModal.classList.remove('active');
    }
  });
}

/* ==========================================================================
   5. PERSONNALISATION DES THÈMES & FONDS
   ========================================================================== */
function initSettings() {
  const bgTypeSelect = document.getElementById('bgTypeSelect');
  const bgValueGroup = document.getElementById('bgValueGroup');
  const bgValueInput = document.getElementById('bgValueInput');
  const neonColorSelect = document.getElementById('neonColorSelect');
  const saveBtn = document.getElementById('saveSettingsBtn');

  // Affichage conditionnel des champs de fond
  bgTypeSelect.addEventListener('change', () => {
    const val = bgTypeSelect.value;
    if (val === 'particles') {
      bgValueGroup.style.display = 'none';
    } else {
      bgValueGroup.style.display = 'flex';
      bgValueInput.placeholder = val === 'image' ? 'URL de l\'image...' : 'Code Couleur (#000000)...';
    }
  });

  // Chargement des paramètres sauvegardés
  const savedBgType = localStorage.getItem('nexus_bg_type') || 'particles';
  const savedBgVal = localStorage.getItem('nexus_bg_val') || '';
  const savedNeon = localStorage.getItem('nexus_neon') || 'cyan';

  bgTypeSelect.value = savedBgType;
  bgValueInput.value = savedBgVal;
  neonColorSelect.value = savedNeon;
  
  applyTheme(savedBgType, savedBgVal, savedNeon);

  saveBtn.addEventListener('click', () => {
    const type = bgTypeSelect.value;
    const val = bgValueInput.value.trim();
    const neon = neonColorSelect.value;

    localStorage.setItem('nexus_bg_type', type);
    localStorage.setItem('nexus_bg_val', val);
    localStorage.setItem('nexus_neon', neon);

    applyTheme(type, val, neon);
    document.getElementById('settingsModal').classList.remove('active');
  });
}

function applyTheme(type, val, neon) {
  const canvas = document.getElementById('bgCanvas');
  
  // Gestion du fond Canvas vs Style
  if (type === 'particles') {
    canvas.style.display = 'block';
    document.body.style.background = 'var(--bg-dark)';
  } else {
    canvas.style.display = 'none';
    if (type === 'gradient') {
      document.body.style.background = 'linear-gradient(135deg, #05070f 0%, #170d2b 50%, #05141f 100%)';
    } else if (type === 'color' && val) {
      document.body.style.background = val;
    } else if (type === 'image' && val) {
      document.body.style.background = `url('${val}') center/cover no-repeat fixed`;
    }
  }

  // Changement des couleurs de néons
  const colors = {
    cyan: { p: '#00f0ff', pg: 'rgba(0,240,255,0.4)' },
    magenta: { p: '#ff0055', pg: 'rgba(255,0,85,0.4)' },
    purple: { p: '#8a2be2', pg: 'rgba(138,43,226,0.4)' },
    green: { p: '#00ff66', pg: 'rgba(0,255,102,0.4)' }
  };

  const choice = colors[neon] || colors.cyan;
  document.documentElement.style.setProperty('--primary', choice.p);
  document.documentElement.style.setProperty('--primary-glow', choice.pg);
}

/* ==========================================================================
   6. ANIMATION CANVAS DE PARTICULES NOÉTIQUES
   ========================================================================== */
function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const count = 60;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    });
  }

  function animate() {
    if (canvas.style.display === 'none') {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f0ff';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';

    for (let i = 0; i < count; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < count; j++) {
        let p2 = particles[j];
        let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
