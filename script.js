/* ==========================================================================
   NEXUS CORE SYSTEM ULTIME - JS ENGINE (SOL 1 INTEGRATED)
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClockAndTimer();
  initQuotes();
  initSearchEngine();
  initFavorites();
  initSidebarAndTodos();
  initModals();
  initSettings();
  initParticles();
  initAudioGenerator();
  initKeyboardShortcuts();
});

/* ==========================================================================
   1. HORLOGE, POMODORO TIMER ET MÉTÉO
   ========================================================================== */
function initClockAndTimer() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerTime = document.getElementById('timerTime');
  const startTimer = document.getElementById('startTimer');
  const resetTimer = document.getElementById('resetTimer');
  const closeTimer = document.getElementById('closeTimer');

  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long' };

  function updateClock() {
    const now = new Date();
    clockEl.textContent = now.toLocaleTimeString('fr-FR');
    let strDate = now.toLocaleDateString('fr-FR', optionsDate);
    dateEl.textContent = strDate.charAt(0).toUpperCase() + strDate.slice(1);
  }

  updateClock();
  setInterval(updateClock, 1000);

  clockEl.addEventListener('click', () => {
    playUiSound(600, 0.05);
    clockEl.style.display = 'none';
    timerDisplay.style.display = 'flex';
  });

  closeTimer.addEventListener('click', () => {
    playUiSound(400, 0.05);
    timerDisplay.style.display = 'none';
    clockEl.style.display = 'block';
  });

  let timerInterval = null;
  let timeLeft = 25 * 60;

  function updateTimerText() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    timerTime.textContent = `${m}:${s}`;
  }

  startTimer.addEventListener('click', () => {
    playUiSound(800, 0.05);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      startTimer.className = 'fa-solid fa-play';
    } else {
      startTimer.className = 'fa-solid fa-pause';
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerText();
        } else {
          clearInterval(timerInterval);
          playUiSound(1000, 0.3);
          alert('Session Pomodoro Noétique terminée !');
        }
      }, 1000);
    }
  });

  resetTimer.addEventListener('click', () => {
    playUiSound(300, 0.05);
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    startTimer.className = 'fa-solid fa-play';
    updateTimerText();
  });
}

/* ==========================================================================
   2. CITATIONS DYNAMIQUES
   ========================================================================== */
const quotesList = [
  '"L\'esprit est le réseau ultime."',
  '"Au-delà du silicium, la conscience émerge."',
  '"Les données sont les empreintes de la pensée."',
  '"Ne cherche pas dans la matrice ce qui réside en toi."',
  '"Dans l\'obscurité binaire, la pensée est lumière."'
];

function initQuotes() {
  const quoteEl = document.getElementById('quote');
  quoteEl.addEventListener('click', () => {
    playUiSound(700, 0.03);
    const randomQuote = quotesList[Math.floor(Math.random() * quotesList.length)];
    quoteEl.textContent = randomQuote;
  });
}

/* ==========================================================================
   3. RECHERCHE HYBRIDE & OVERLAY HUB (SOLUTION 1)
   ========================================================================== */
function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const engineBtn = document.getElementById('engineBtn');
  const engineIcon = document.getElementById('engineIcon');
  const dropdown = document.getElementById('engineDropdown');
  const options = document.querySelectorAll('.engine-option');

  // Elements Overlay
  const searchOverlay = document.getElementById('searchOverlay');
  const searchIframe = document.getElementById('searchIframe');
  const closeOverlayBtn = document.getElementById('closeSearchOverlay');
  const expandFrameBtn = document.getElementById('expandFrameBtn');
  const openExternalBtn = document.getElementById('openExternalBtn');
  const searchFrameContainer = document.getElementById('searchFrameContainer');
  const overlayTitle = document.getElementById('overlayTitle');

  let currentUrlTemplate = 'https://html.duckduckgo.com/html/?q=';
  let currentEngineKey = 'duckduckgo';
  let lastFullUrl = '';

  engineBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    playUiSound(500, 0.04);
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => dropdown.classList.remove('show'));

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      playUiSound(650, 0.04);
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentUrlTemplate = opt.dataset.url;
      currentEngineKey = opt.dataset.engine;
      
      engineIcon.className = opt.dataset.icon;
      dropdown.classList.remove('show');
      input.focus();
    });
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playUiSound(900, 0.08);

    if (currentEngineKey === 'google') {
      // Si Google externe est choisi, ouverture d'un onglet direct
      window.open(`https://www.google.com/search?q=${encodeURIComponent(query)}`, '_blank');
      return;
    }

    // Sinon ouverture dans l'overlay Solution 1 !
    lastFullUrl = `${currentUrlTemplate}${encodeURIComponent(query)}`;
    overlayTitle.textContent = `Recherche: ${query}`;
    searchIframe.src = lastFullUrl;
    searchOverlay.classList.add('active');
  });

  closeOverlayBtn.addEventListener('click', () => {
    playUiSound(400, 0.05);
    searchOverlay.classList.remove('active');
    searchIframe.src = 'about:blank';
  });

  expandFrameBtn.addEventListener('click', () => {
    playUiSound(600, 0.05);
    searchFrameContainer.classList.toggle('expanded');
  });

  openExternalBtn.addEventListener('click', () => {
    playUiSound(700, 0.05);
    if (lastFullUrl) {
      window.open(lastFullUrl, '_blank');
    }
  });
}

/* ==========================================================================
   4. FAVORIS & CATÉGORIES
   ========================================================================== */
let defaultFavs = [
  { name: 'Google', url: 'https://google.com', category: 'dev' },
  { name: 'YouTube', url: 'https://youtube.com', category: 'media' },
  { name: 'GitHub', url: 'https://github.com', category: 'dev' },
  { name: 'Wikipedia', url: 'https://wikipedia.org', category: 'social' }
];

let favorites = JSON.parse(localStorage.getItem('nexus_favs')) || defaultFavs;
let isEditing = false;
let currentCategory = 'all';

function initFavorites() {
  const grid = document.getElementById('favoritesGrid');
  const toggleEditBtn = document.getElementById('toggleEditFavs');
  const catBtns = document.querySelectorAll('.cat-btn');

  renderFavorites();

  toggleEditBtn.addEventListener('click', () => {
    playUiSound(400, 0.05);
    isEditing = !isEditing;
    toggleEditBtn.classList.toggle('active', isEditing);
    grid.classList.toggle('editing', isEditing);
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
}

function renderFavorites() {
  const grid = document.getElementById('favoritesGrid');
  grid.innerHTML = '';

  const filteredFavs = currentCategory === 'all' 
    ? favorites 
    : favorites.filter(f => f.category === currentCategory);

  filteredFavs.forEach((fav, index) => {
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

    const delBtn = card.querySelector('.delete-fav-btn');
    delBtn.addEventListener('click', (e) => {
      e.preventDefault();
      e.stopPropagation();
      playUiSound(250, 0.08);
      deleteFavorite(fav);
    });

    card.addEventListener('click', (e) => {
      if (isEditing) e.preventDefault();
      else playUiSound(750, 0.04);
    });

    grid.appendChild(card);
  });
}

function deleteFavorite(favToDelete) {
  favorites = favorites.filter(f => f !== favToDelete);
  localStorage.setItem('nexus_favs', JSON.stringify(favorites));
  renderFavorites();
}

/* ==========================================================================
   5. PANNEAU LATÉRAL & TO-DO LIST
   ========================================================================== */
let todos = JSON.parse(localStorage.getItem('nexus_todos')) || [];

function initSidebarAndTodos() {
  const sidebar = document.getElementById('sidebar');
  const trigger = document.getElementById('toggleSidebarBtn');
  const todoInput = document.getElementById('todoInput');
  const addTodoBtn = document.getElementById('addTodoBtn');

  trigger.addEventListener('click', () => {
    playUiSound(500, 0.05);
    sidebar.classList.toggle('active');
  });

  addTodoBtn.addEventListener('click', addTodo);
  todoInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') addTodo();
  });

  renderTodos();
}

function addTodo() {
  const input = document.getElementById('todoInput');
  const text = input.value.trim();
  if (text) {
    playUiSound(700, 0.04);
    todos.push({ text, completed: false });
    localStorage.setItem('nexus_todos', JSON.stringify(todos));
    input.value = '';
    renderTodos();
  }
}

function renderTodos() {
  const list = document.getElementById('todoList');
  list.innerHTML = '';

  todos.forEach((todo, idx) => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
    li.innerHTML = `
      <span>${todo.text}</span>
      <i class="fa-solid fa-trash"></i>
    `;

    li.querySelector('span').addEventListener('click', () => {
      playUiSound(600, 0.03);
      todos[idx].completed = !todos[idx].completed;
      localStorage.setItem('nexus_todos', JSON.stringify(todos));
      renderTodos();
    });

    li.querySelector('i').addEventListener('click', () => {
      playUiSound(300, 0.05);
      todos.splice(idx, 1);
      localStorage.setItem('nexus_todos', JSON.stringify(todos));
      renderTodos();
    });

    list.appendChild(li);
  });
}

/* ==========================================================================
   6. MODALES ET RACCOURCIS CLAVIER
   ========================================================================== */
function initModals() {
  const settingsModal = document.getElementById('settingsModal');
  const addFavModal = document.getElementById('addFavModal');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const openAddFavModal = document.getElementById('openAddFavModal');
  const closeBtns = document.querySelectorAll('.close-modal');

  openSettingsBtn.addEventListener('click', () => {
    playUiSound(500, 0.05);
    settingsModal.classList.add('active');
  });

  openAddFavModal.addEventListener('click', () => {
    playUiSound(500, 0.05);
    addFavModal.classList.add('active');
  });

  closeBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      playUiSound(350, 0.05);
      settingsModal.classList.remove('active');
      addFavModal.classList.remove('active');
    });
  });

  document.getElementById('saveFavBtn').addEventListener('click', () => {
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
      addFavModal.classList.remove('active');
    }
  });
}

function initKeyboardShortcuts() {
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput').focus();
      playUiSound(850, 0.05);
    }
  });
}

/* ==========================================================================
   7. PARAMÈTRES ET SFX
   ========================================================================== */
function playUiSound(freq, duration) {
  const enabled = document.getElementById('soundFxToggle')?.checked;
  if (!enabled) return;

  try {
    const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
    gain.gain.setValueAtTime(0.05, audioCtx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, audioCtx.currentTime + duration);

    osc.connect(gain);
    gain.connect(audioCtx.destination);

    osc.start();
    osc.stop(audioCtx.currentTime + duration);
  } catch (e) {}
}

function initSettings() {
  const bgTypeSelect = document.getElementById('bgTypeSelect');
  const bgValueGroup = document.getElementById('bgValueGroup');
  const bgValueInput = document.getElementById('bgValueInput');
  const neonColorSelect = document.getElementById('neonColorSelect');
  const saveBtn = document.getElementById('saveSettingsBtn');

  bgTypeSelect.addEventListener('change', () => {
    const val = bgTypeSelect.value;
    if (val === 'particles') {
      bgValueGroup.style.display = 'none';
    } else {
      bgValueGroup.style.display = 'flex';
      bgValueInput.placeholder = val === 'image' ? 'URL de l\'image...' : 'Code Couleur (#000000)...';
    }
  });

  const savedBgType = localStorage.getItem('nexus_bg_type') || 'particles';
  const savedBgVal = localStorage.getItem('nexus_bg_val') || '';
  const savedNeon = localStorage.getItem('nexus_neon') || 'cyan';

  bgTypeSelect.value = savedBgType;
  bgValueInput.value = savedBgVal;
  neonColorSelect.value = savedNeon;
  
  applyTheme(savedBgType, savedBgVal, savedNeon);

  saveBtn.addEventListener('click', () => {
    playUiSound(900, 0.06);
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
   8. GÉNÉRATEUR AUDIO D'AMBIANCE (WEB AUDIO API)
   ========================================================================== */
let audioCtx = null;
let noiseNode = null;
let isAudioPlaying = false;

function initAudioGenerator() {
  const btn = document.getElementById('audioToggleBtn');
  const label = document.getElementById('audioLabel');

  btn.addEventListener('click', () => {
    if (!isAudioPlaying) {
      startAmbientAudio();
      btn.classList.add('active');
      label.textContent = 'On';
      isAudioPlaying = true;
    } else {
      stopAmbientAudio();
      btn.classList.remove('active');
      label.textContent = 'Off';
      isAudioPlaying = false;
    }
  });
}

function startAmbientAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  const filter = audioCtx.createBiquadFilter();
  const type = document.getElementById('audioTypeSelect')?.value || 'rain';

  if (type === 'rain') {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(800, audioCtx.currentTime);
  } else if (type === 'white') {
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(1200, audioCtx.currentTime);
  } else {
    filter.type = 'lowpass';
    filter.frequency.setValueAtTime(200, audioCtx.currentTime);
  }

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.08, audioCtx.currentTime);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noiseNode.start();
}

function stopAmbientAudio() {
  if (noiseNode) {
    noiseNode.stop();
    noiseNode.disconnect();
  }
  if (audioCtx) {
    audioCtx.close();
  }
}

/* ==========================================================================
   9. PARTICULES CANVAS NOÉTIQUES
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
  const count = 55;

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
   