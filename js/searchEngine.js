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
    duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', icon: 'fa-solid fa-duck' },
    wikipedia: { name: 'Wikipedia', url: 'https://fr.wikipedia.org/w/index.php?search=', icon: 'fa-brands fa-wikipedia-w' },
    bing: { name: 'Bing', url: 'https://www.bing.com/search?q=', icon: 'fa-brands fa-microsoft' },
    google: { name: 'Google', url: 'https://www.google.com/search?q=', icon: 'fa-brands fa-google' }
  };

  let currentEngineKey = 'duckduckgo';

  // Toggle Dropdown Moteurs
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

  // Soumission de la recherche
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playUiSound(900, 0.08);

    const engine = ENGINES[currentEngineKey] || ENGINES.duckduckgo;
    const fullSearchUrl = `${engine.url}${encodeURIComponent(query)}`;

    if (overlayTitle) overlayTitle.textContent = `Matrice // ${engine.name} : "${query}"`;

    // Injecter un design Cyberpunk au lieu d'une iframe blanche bloquée
    if (frameBody) {
      frameBody.style.background = 'rgba(5, 7, 15, 0.95)';
      frameBody.style.display = 'flex';
      frameBody.style.flexDirection = 'column';
      frameBody.style.alignItems = 'center';
      frameBody.style.justifyContent = 'center';
      frameBody.style.padding = '30px';
      frameBody.style.textAlign = 'center';

      frameBody.innerHTML = `
        <div style="max-width: 500px; display: flex; flex-direction: column; align-items: center; gap: 20px;">
          <div style="font-size: 3rem; color: var(--primary); text-shadow: 0 0 15px var(--primary-glow);">
            <i class="${engine.icon}"></i>
          </div>
          <h2 style="font-family: var(--font-title); font-size: 1.4rem; color: #fff;">Lancement de la recherche</h2>
          <p style="color: var(--text-muted); font-size: 0.9rem;">
            Requête : <strong style="color: var(--primary);">${query}</strong> via <span style="text-transform: capitalize;">${engine.name}</span>.
          </p>
          
          <div id="wikiPreview" style="background: rgba(255,255,255,0.03); border: 1px solid var(--card-border); padding: 15px; border-radius: 12px; font-size: 0.85rem; color: #ccc; text-align: left; width: 100%; display: none;">
            <!-- Aperçu rapide injecté via API -->
          </div>

          <a href="${fullSearchUrl}" target="_blank" id="launchSearchBtn" style="
            background: var(--primary); 
            color: #000; 
            padding: 12px 28px; 
            border-radius: 10px; 
            font-family: var(--font-title); 
            font-weight: bold; 
            text-decoration: none; 
            box-shadow: 0 0 20px var(--primary-glow);
            transition: all 0.3s ease;
            display: inline-flex;
            align-items: center;
            gap: 10px;
          ">
            <span>Ouvrir les résultats</span>
            <i class="fa-solid fa-arrow-up-right-from-square"></i>
          </a>
        </div>
      `;

      // Optionnel : Récupération d'un extrait Wikipedia instantané dans le modal
      fetchWikipediaPreview(query);
    }

    searchOverlay?.classList.add('active');
  });

  closeOverlayBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    searchOverlay.classList.remove('active');
  });
}

// Fonction bonus pour afficher un aperçu immédiat directement dans le hub
async function fetchWikipediaPreview(query) {
  try {
    const res = await fetch(`https://fr.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query)}`);
    if (res.ok) {
      const data = await res.json();
      const wikiBox = document.getElementById('wikiPreview');
      if (wikiBox && data.extract) {
        wikiBox.style.display = 'block';
        wikiBox.innerHTML = `
          <strong style="color: var(--primary); display: block; margin-bottom: 5px;">Aperçu Wikipédia :</strong>
          <p>${data.extract.slice(0, 220)}...</p>
        `;
      }
    }
  } catch (e) {
    // Silencieux si pas de résultat Wikipédia
  }
}
