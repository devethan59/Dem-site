import { playUiSound } from './audio.js';

export function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const engineBtn = document.getElementById('engineBtn');
  const engineIcon = document.getElementById('engineIcon');
  const dropdown = document.getElementById('engineDropdown');
  const options = document.querySelectorAll('.engine-option');

  const searchOverlay = document.getElementById('searchOverlay');
  const closeOverlayBtn = document.getElementById('closeSearchOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const frameBody = document.querySelector('.search-frame-body');

  const ENGINES = {
    duckduckgo: { name: 'DuckDuckGo', url: 'https://html.duckduckgo.com/html/?q=', icon: 'fa-solid fa-duck' },
    wikipedia: { name: 'Wikipedia', url: 'https://fr.wikipedia.org/w/index.php?search=', icon: 'fa-brands fa-wikipedia-w' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'fa-brands fa-microsoft' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'fa-brands fa-google' }
  };

  let currentEngineKey = 'duckduckgo';

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

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playUiSound(900, 0.08);

    const engine = ENGINES[currentEngineKey] || ENGINES.duckduckgo;
    if (overlayTitle) overlayTitle.textContent = `Résultats // ${query}`;

    if (frameBody) {
      // Style du conteneur de résultats
      frameBody.style.background = 'var(--bg-dark, #05070f)';
      frameBody.style.display = 'flex';
      frameBody.style.flexDirection = 'column';
      frameBody.style.padding = '20px';
      frameBody.style.overflowY = 'auto';

      // Loader Cyberpunk
      frameBody.innerHTML = `
        <div style="text-align: center; padding: 40px; color: var(--primary);">
          <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
          <p style="font-family: var(--font-title); font-size: 0.9rem;">Interrogation du réseau...</p>
        </div>
      `;

      searchOverlay?.classList.add('active');

      // Récupération dynamique des données
      await renderSearchResults(query, engine, frameBody);
    }
  });

  closeOverlayBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    searchOverlay.classList.remove('active');
  });
}

async function renderSearchResults(query, engine, container) {
  let htmlResults = '';

  try {
    // 1. Interrogation de Wikipedia (API instantanée)
    const wikiRes = await fetch(`https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*`);
    const wikiData = await wikiRes.json();
    
    if (wikiData.query && wikiData.query.search.length > 0) {
      htmlResults += `<h3 style="color: var(--primary); font-size: 0.9rem; text-transform: uppercase; margin-bottom: 12px; letter-spacing: 1px;">Savoir & Encyclopédie</h3>`;
      
      wikiData.query.search.slice(0, 3).forEach(item => {
        const title = item.title;
        const snippet = item.snippet.replace(/(<([^>]+)>)/gi, "");
        const link = `https://fr.wikipedia.org/wiki/${encodeURIComponent(title)}`;

        htmlResults += `
          <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0, 240, 255, 0.2); border-radius: 8px; padding: 12px; margin-bottom: 10px;">
            <a href="${link}" target="_blank" style="color: #fff; font-weight: bold; text-decoration: none; font-size: 1rem; display: flex; align-items: center; justify-content: space-between;">
              <span>${title}</span>
              <i class="fa-solid fa-arrow-up-right-from-square" style="font-size: 0.8rem; color: var(--primary);"></i>
            </a>
            <p style="color: #a0a5b5; font-size: 0.85rem; margin-top: 5px; line-height: 1.4;">${snippet}...</p>
          </div>
        `;
      });
    }
  } catch (e) {
    console.warn("Erreur API Wikipédia", e);
  }

  // 2. Bouton d'accès direct au moteur web complet
  const fullSearchUrl = `${engine.url}${encodeURIComponent(query)}`;
  
  htmlResults += `
    <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid rgba(255,255,255,0.1); text-align: center;">
      <p style="color: #777; font-size: 0.8rem; margin-bottom: 10px;">Voir la recherche complète sur le web :</p>
      <a href="${fullSearchUrl}" target="_blank" style="
        background: transparent; 
        border: 1px solid var(--primary); 
        color: var(--primary); 
        padding: 10px 20px; 
        border-radius: 8px; 
        font-family: var(--font-title); 
        font-size: 0.85rem;
        text-decoration: none; 
        display: inline-flex;
        align-items: center;
        gap: 8px;
        transition: all 0.2s ease;
      ">
        <i class="${engine.icon}"></i>
        <span>Ouvrir dans ${engine.name}</span>
      </a>
    </div>
  `;

  container.innerHTML = htmlResults;
}
