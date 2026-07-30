/* ==========================================================================
   NEXUS DASHBOARD - COMPLETE SCRIPT
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWeather();
  initSearchEngine();
  initFavorites();
  initTodos();
  initTheme();
});

/* --- AUDIO ENGINE --- */
let audioCtx = null;
function playSound(type = 'click') {
  try {
    if (!audioCtx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (AudioContextClass) audioCtx = new AudioContextClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume().catch(() => {});
    if (!audioCtx) return;

    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);
    const now = audioCtx.currentTime;

    if (type === 'click') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(400, now + 0.05);
      gain.gain.setValueAtTime(0.1, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
    } else if (type === 'hover') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(1200, now);
      gain.gain.setValueAtTime(0.02, now);
      gain.gain.linearRampToValueAtTime(0.001, now + 0.03);
      osc.start(now);
      osc.stop(now + 0.03);
    }
  } catch (err) {}
}

/* --- CLOCK --- */
function initClock() {
  const clockDisplay = document.getElementById('clockDisplay');
  const dateDisplay = document.getElementById('dateDisplay');
  if (!clockDisplay || !dateDisplay) return;

  function update() {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('fr-FR', options);
  }
  update();
  setInterval(update, 1000);
}

/* --- WEATHER WITH CITY EDIT --- */
let currentCity = localStorage.getItem('nexus_city') || 'Elne';

function initWeather() {
  const citySpan = document.getElementById('weatherCityName');
  const editBtn = document.getElementById('editCityBtn');

  if (citySpan) citySpan.textContent = currentCity;

  if (editBtn) {
    editBtn.addEventListener('click', () => {
      playSound('click');
      const newCity = prompt('Entrez votre ville :', currentCity);
      if (newCity && newCity.trim() !== '') {
        currentCity = newCity.trim();
        localStorage.setItem('nexus_city', currentCity);
        if (citySpan) citySpan.textContent = currentCity;
        loadCityWeather(currentCity);
      }
    });
  }

  loadCityWeather(currentCity);
}

async function loadCityWeather(city) {
  const info = document.getElementById('weatherInfo');
  if (!info) return;

  try {
    // 1. Geocoding
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1&language=fr&format=json`);
    const geoData = await geoRes.json();

    if (!geoData.results || geoData.results.length === 0) {
      info.textContent = 'Ville introuvable';
      return;
    }

    const { latitude, longitude, name } = geoData.results[0];
    const citySpan = document.getElementById('weatherCityName');
    if (citySpan) citySpan.textContent = name;

    // 2. Weather
    const wRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current_weather=true`);
    const wData = await wRes.json();

    if (!wData.current_weather) throw new Error();

    const temp = Math.round(wData.current_weather.temperature);
    const code = wData.current_weather.weathercode;
    const icon = getWeatherIcon(code);

    info.innerHTML = `<i class="${icon}" style="color: var(--primary);"></i> <span>${temp}°C</span>`;
  } catch (e) {
    info.textContent = '--°C';
  }
}

function getWeatherIcon(code) {
  if (code === 0) return 'fa-solid fa-sun';
  if (code >= 1 && code <= 3) return 'fa-solid fa-cloud-sun';
  if (code >= 45 && code <= 48) return 'fa-solid fa-smog';
  if (code >= 51 && code <= 67) return 'fa-solid fa-cloud-rain';
  if (code >= 71 && code <= 77) return 'fa-solid fa-snowflake';
  if (code >= 80 && code <= 82) return 'fa-solid fa-cloud-showers-heavy';
  if (code >= 95) return 'fa-solid fa-bolt';
  return 'fa-solid fa-cloud';
}

/* --- SEARCH ENGINE & AUTOCOMPLETE --- */
function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const selector = document.getElementById('engineSelector');
  const suggestions = document.getElementById('searchSuggestions');

  if (!form || !input || !selector) return;

  const ENGINES = {
    google: 'https://www.google.com/search?q=',
    duckduckgo: 'https://duckduckgo.com/?q=',
    youtube: 'https://www.youtube.com/results?search_query=',
    github: 'https://github.com/search?q=',
    wikipedia: 'https://fr.wikipedia.org/wiki/Special:Search?search=',
    chatgpt: 'https://chatgpt.com/?q='
  };

  // Autocomplete simple
  input.addEventListener('input', () => {
    const val = input.value.trim();
    if (val.length < 2 || !suggestions) {
      suggestions?.classList.add('hidden');
      return;
    }

    // Suggestions mock / préfixes
    const sample = [`${val} github`, `${val} tutorial`, `${val} documentation`].filter(Boolean);
    suggestions.innerHTML = sample.map(s => `<li><i class="fa-solid fa-magnifying-glass"></i> ${s}</li>`).join('');
    suggestions.classList.remove('hidden');

    suggestions.querySelectorAll('li').forEach(li => {
      li.addEventListener('click', () => {
        input.value = li.textContent.trim();
        suggestions.classList.add('hidden');
        form.dispatchEvent(new Event('submit'));
      });
    });
  });

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target)) suggestions?.classList.add('hidden');
  });

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playSound('click');
    let engineUrl = ENGINES[selector.value] || ENGINES.google;
    let cleanQuery = query;

    const prefixMatch = query.match(/^([a-z]+)\/\s*(.*)/i);
    if (prefixMatch) {
      const p = prefixMatch[1].toLowerCase();
      const rest = prefixMatch[2];
      if (p === 'g') engineUrl = ENGINES.google;
      else if (p === 'yt') engineUrl = ENGINES.youtube;
      else if (p === 'gh') engineUrl = ENGINES.github;
      else if (p === 'ddg') engineUrl = ENGINES.duckduckgo;
      else if (p === 'wiki') engineUrl = ENGINES.wikipedia;
      else if (p === 'ai') engineUrl = ENGINES.chatgpt;
      if (rest) cleanQuery = rest;
    }

    window.location.href = engineUrl + encodeURIComponent(cleanQuery);
  });
}

/* --- FAVORITES --- */
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
  return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#039;');
}

function initFavorites() {
  try {
    const stored = localStorage.getItem('nexus_favorites');
    favorites = stored ? JSON.parse(stored) : DEFAULT_FAVORITES;
  } catch (e) { favorites = DEFAULT_FAVORITES; }

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
      if (!/^https?:\/\//i.test(url)) url = 'https://' + url;

      let icon = '';
      try {
        const parsed = new URL(url);
        icon = `${parsed.origin}/favicon.ico`;
      } catch (err) {}

      favorites.push({ id: Date.now().toString(), name, url, category, icon });
      try { localStorage.setItem('nexus_favorites', JSON.stringify(favorites)); } catch (e) {}

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
      delBtn.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        playSound('click');
        favorites = favorites.filter(f => f.id !== fav.id);
        try { localStorage.setItem('nexus_favorites', JSON.stringify(favorites)); } catch (e) {}
        renderFavorites();
      });
      card.appendChild(delBtn);
    }

    grid.appendChild(card);
  });
}

/* --- TODO LIST --- */
let todos = [];

function initTodos() {
  const form = document.getElementById('todoForm');
  const input = document.getElementById('todoInput');

  try {
    const stored = localStorage.getItem('nexus_todos');
    todos = stored ? JSON.parse(stored) : [];
  } catch (e) { todos = []; }

  renderTodos();

  if (form && input) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();
      const text = input.value.trim();
      if (!text) return;

      playSound('click');
      todos.push({ id: Date.now().toString(), text, completed: false });
      saveTodos();
      renderTodos();
      input.value = '';
    });
  }
}

function saveTodos() {
  try { localStorage.setItem('nexus_todos', JSON.stringify(todos)); } catch (e) {}
}

function renderTodos() {
  const list = document.getElementById('todoList');
  if (!list) return;

  list.innerHTML = '';

  todos.forEach(todo => {
    const li = document.createElement('li');
    li.className = `todo-item ${todo.completed ? 'completed' : ''}`;

    const textSpan = document.createElement('span');
    textSpan.textContent = todo.text;
    textSpan.style.cursor = 'pointer';
    textSpan.addEventListener('click', () => {
      playSound('click');
      todo.completed = !todo.completed;
      saveTodos();
      renderTodos();
    });

    const actions = document.createElement('div');
    actions.className = 'todo-actions';

    const delBtn = document.createElement('button');
    delBtn.className = 'icon-btn-inline';
    delBtn.innerHTML = '<i class="fa-solid fa-trash" style="color: var(--secondary);"></i>';
    delBtn.addEventListener('click', () => {
      playSound('click');
      todos = todos.filter(t => t.id !== todo.id);
      saveTodos();
      renderTodos();
    });

    actions.appendChild(delBtn);
    li.appendChild(textSpan);
    li.appendChild(actions);
    list.appendChild(li);
  });
}

/* --- THEME --- */
function initTheme() {
  const settingsBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const modal = document.getElementById('settingsModal');
  const resetBtn = document.getElementById('resetSettingsBtn');

  if (settingsBtn && modal) {
    settingsBtn.addEventListener('click', () => {
      playSound('click');
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      playSound('click');
      modal.classList.remove('active');
    });
  }

  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      playSound('click');
      const hue = dot.dataset.hue || '185';
      document.documentElement.style.setProperty('--primary', `hsl(${hue}, 100%, 50%)`);
      document.documentElement.style.setProperty('--primary-glow', `hsla(${hue}, 100%, 50%, 0.4)`);
      try { localStorage.setItem('nexus_hue', hue); } catch (e) {}
    });
  });

  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const radius = btn.dataset.radius || '8px';
      document.documentElement.style.setProperty('--card-radius', radius);
      try { localStorage.setItem('nexus_radius', radius); } catch (e) {}
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playSound('click');
      try {
        localStorage.removeItem('nexus_hue');
        localStorage.removeItem('nexus_radius');
      } catch (e) {}
      document.documentElement.style.setProperty('--primary', '#00f0ff');
      document.documentElement.style.setProperty('--primary-glow', 'rgba(0, 240, 255, 0.4)');
      document.documentElement.style.setProperty('--card-radius', '8px');
    });
  }

  try {
    const hue = localStorage.getItem('nexus_hue');
    if (hue) {
      document.documentElement.style.setProperty('--primary', `hsl(${hue}, 100%, 50%)`);
      document.documentElement.style.setProperty('--primary-glow', `hsla(${hue}, 100%, 50%, 0.4)`);
    }
    const radius = localStorage.getItem('nexus_radius');
    if (radius) document.documentElement.style.setProperty('--card-radius', radius);
  } catch (e) {}
}
