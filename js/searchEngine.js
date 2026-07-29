import { playUiSound } from './audio.js';

export function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const engineBtn = document.getElementById('engineBtn');
  const engineIcon = document.getElementById('engineIcon');
  const dropdown = document.getElementById('engineDropdown');
  const options = document.querySelectorAll('.engine-option');

  const searchOverlay = document.getElementById('searchOverlay');
  const searchIframe = document.getElementById('searchIframe');
  const closeOverlayBtn = document.getElementById('closeSearchOverlay');
  const expandFrameBtn = document.getElementById('expandFrameBtn');
  const openExternalBtn = document.getElementById('openExternalBtn');
  const searchFrameContainer = document.getElementById('searchFrameContainer');
  const overlayTitle = document.getElementById('overlayTitle');

  // Moteurs d'intégration optimisés (sans blocage X-Frame)
  const ENGINE_URLS = {
    duckduckgo: 'https://start.duckduckgo.com/?q=',
    wikipedia: 'https://fr.m.wikipedia.org/w/index.php?search=',
    bing: 'https://www.bing.com/search?q=',
    google: 'https://www.google.com/search?q='
  };

  let currentEngineKey = 'duckduckgo';
  let lastQuery = '';

  engineBtn?.addEventListener('click', (e) => {
    e.stopPropagation();
    playUiSound(500, 0.04);
    dropdown.classList.toggle('show');
  });

  document.addEventListener('click', () => dropdown?.classList.remove('show'));

  options.forEach(opt => {
    opt.addEventListener('click', () => {
      playUiSound(650, 0.04);
      options.forEach(o => o.classList.remove('active'));
      opt.classList.add('active');

      currentEngineKey = opt.dataset.engine;
      if (engineIcon) engineIcon.className = opt.dataset.icon;
      dropdown.classList.remove('show');
      input.focus();
    });
  });

  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playUiSound(900, 0.08);
    lastQuery = query;

    // Google interdit totalement les iframes : redirection directe si sélectionné
    if (currentEngineKey === 'google') {
      window.open(`${ENGINE_URLS.google}${encodeURIComponent(query)}`, '_blank');
      return;
    }

    const searchUrl = `${ENGINE_URLS[currentEngineKey] || ENGINE_URLS.duckduckgo}${encodeURIComponent(query)}`;
    
    if (overlayTitle) overlayTitle.textContent = `Recherche: ${query}`;
    
    // Tentative d'affichage dans l'iframe
    if (searchIframe) {
      searchIframe.src = searchUrl;
    }

    searchOverlay?.classList.add('active');
  });

  closeOverlayBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    searchOverlay.classList.remove('active');
    if (searchIframe) searchIframe.src = 'about:blank';
  });

  expandFrameBtn?.addEventListener('click', () => {
    playUiSound(600, 0.05);
    searchFrameContainer.classList.toggle('expanded');
  });

  openExternalBtn?.addEventListener('click', () => {
    playUiSound(700, 0.05);
    if (lastQuery) {
      const fallbackUrl = `${ENGINE_URLS[currentEngineKey] || ENGINE_URLS.duckduckgo}${encodeURIComponent(lastQuery)}`;
      window.open(fallbackUrl, '_blank');
    }
  });
}
