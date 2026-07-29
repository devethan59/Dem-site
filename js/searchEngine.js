import { playUiSound } from './audio.js';

export function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const searchOverlay = document.getElementById('searchOverlay');
  const closeOverlayBtn = document.getElementById('closeSearchOverlay');
  const overlayTitle = document.getElementById('overlayTitle');
  const frameBody = document.querySelector('.search-frame-body');

  let currentQuery = '';
  let activeTab = 'web';

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playUiSound(900, 0.08);
    currentQuery = query;

    if (overlayTitle) overlayTitle.textContent = `Nexus Search // "${query}"`;

    if (frameBody) {
      searchOverlay?.classList.add('active');
      renderLayout(frameBody, query);
      await fetchAndDisplayResults(query, activeTab);
    }
  });

  closeOverlayBtn?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    searchOverlay.classList.remove('active');
  });
}

// 1. Structure Générale (Onglets & Conteneur)
function renderLayout(container, query) {
  container.style.background = 'var(--bg-dark, #05070f)';
  container.style.display = 'flex';
  container.style.flexDirection = 'column';
  container.style.padding = '0';
  container.style.height = '100%';

  container.innerHTML = `
    <!-- Barre d'onglets Cyberpunk -->
    <div style="
      display: flex; 
      border-bottom: 1px solid rgba(0, 240, 255, 0.2); 
      background: rgba(0,0,0,0.3);
      padding: 0 15px;
      gap: 10px;
    ">
      <button class="search-tab active" data-tab="web" style="
        background: none; border: none; color: #fff; padding: 12px 16px; 
        font-family: var(--font-title); font-size: 0.85rem; cursor: pointer;
        border-bottom: 2px solid var(--primary); display: flex; align-items: center; gap: 8px;
      ">
        <i class="fa-solid fa-globe"></i> Web & Tech
      </button>
      <button class="search-tab" data-tab="wiki" style="
        background: none; border: none; color: var(--text-muted, #888); padding: 12px 16px; 
        font-family: var(--font-title); font-size: 0.85rem; cursor: pointer;
        border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px;
      ">
        <i class="fa-brands fa-wikipedia-w"></i> Encyclopédie
      </button>
      <button class="search-tab" data-tab="images" style="
        background: none; border: none; color: var(--text-muted, #888); padding: 12px 16px; 
        font-family: var(--font-title); font-size: 0.85rem; cursor: pointer;
        border-bottom: 2px solid transparent; display: flex; align-items: center; gap: 8px;
      ">
        <i class="fa-solid fa-image"></i> Images
      </button>
    </div>

    <!-- Zone de Résultats avec Scrollbar -->
    <div id="searchResultsBody" style="
      flex: 1; 
      overflow-y: auto; 
      padding: 20px; 
      display: flex; 
      flex-direction: column; 
      gap: 15px;
    ">
      <div style="text-align: center; padding: 40px; color: var(--primary);">
        <i class="fa-solid fa-microchip fa-spin" style="font-size: 2rem; margin-bottom: 10px;"></i>
        <p style="font-family: var(--font-title); font-size: 0.85rem;">Analyse des requêtes réseau en cours...</p>
      </div>
    </div>
  `;

  // Gestion du clic sur les onglets
  const tabs = container.querySelectorAll('.search-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      playUiSound(600, 0.04);
      tabs.forEach(t => {
        t.style.color = 'var(--text-muted, #888)';
        t.style.borderBottomColor = 'transparent';
        t.classList.remove('active');
      });
      tab.style.color = '#fff';
      tab.style.borderBottomColor = 'var(--primary)';
      tab.classList.add('active');

      const selectedTab = tab.dataset.tab;
      fetchAndDisplayResults(query, selectedTab);
    });
  });
}

// 2. Routeur de Récupération des Données
async function fetchAndDisplayResults(query, tab) {
  const resultsContainer = document.getElementById('searchResultsBody');
  if (!resultsContainer) return;

  resultsContainer.innerHTML = `
    <div style="text-align: center; padding: 30px; color: var(--primary);">
      <i class="fa-solid fa-circle-notch fa-spin" style="font-size: 1.8rem; margin-bottom: 10px;"></i>
      <p style="font-family: var(--font-title); font-size: 0.85rem;">Synchronications des données [${tab.toUpperCase()}]...</p>
    </div>
  `;

  if (tab === 'web') {
    await renderWebTab(query, resultsContainer);
  } else if (tab === 'wiki') {
    await renderWikiTab(query, resultsContainer);
  } else if (tab === 'images') {
    await renderImagesTab(query, resultsContainer);
  }
}

// 3. ONGLET WEB (DuckDuckGo IA + Proxy HTML)
async function renderWebTab(query, container) {
  let html = '';

  try {
    // A. Interrogation de DuckDuckGo Instant Answer API
    const ddgRes = await fetch(`https://api.duckduckgo.com/?q=${encodeURIComponent(query)}&format=json&no_html=1&skip_disambig=1`);
    const ddgData = await ddgRes.json();

    // Carte Réponse Instantanée (si disponible)
    if (ddgData.Abstract) {
      html += `
        <div style="
          background: rgba(0, 240, 255, 0.05); 
          border: 1px solid var(--primary); 
          border-radius: 10px; 
          padding: 15px; 
          margin-bottom: 10px;
          box-shadow: 0 0 15px rgba(0, 240, 255, 0.1);
        ">
          <div style="display: flex; align-items: center; gap: 8px; color: var(--primary); font-size: 0.8rem; font-family: var(--font-title); margin-bottom: 8px;">
            <i class="fa-solid fa-bolt"></i> RÉPONSE RAPIDE (${ddgData.AbstractSource || 'DDG'})
          </div>
          <p style="color: #e0e0e0; font-size: 0.9rem; line-height: 1.5;">${ddgData.AbstractText}</p>
          ${ddgData.AbstractURL ? `
            <a href="${ddgData.AbstractURL}" target="_blank" style="color: var(--primary); font-size: 0.8rem; text-decoration: none; display: inline-block; margin-top: 8px;">
              En savoir plus <i class="fa-solid fa-arrow-right"></i>
            </a>
          ` : ''}
        </div>
      `;
    }

    // Sujets liés (Related Topics)
    if (ddgData.RelatedTopics && ddgData.RelatedTopics.length > 0) {
      html += `<h4 style="color: var(--primary); font-size: 0.8rem; text-transform: uppercase; letter-spacing: 1px; margin: 10px 0 5px 0;">Résultats Web Associés</h4>`;
      
      let count = 0;
      ddgData.RelatedTopics.forEach(topic => {
        if (topic.Text && topic.FirstURL && count < 6) {
          count++;
          html += createResultCard(topic.Text, topic.FirstURL, 'Résultat Web');
        }
      });
    }

  } catch (e) {
    console.warn("Erreur DDG API:", e);
  }

  // B. Fallback DuckDuckGo Lite & Multi-Moteurs
  html += `
    <div style="margin-top: 20px; padding: 15px; background: rgba(255,255,255,0.02); border-radius: 10px; border: 1px solid rgba(255,255,255,0.05); text-align: center;">
      <p style="color: #aaa; font-size: 0.85rem; margin-bottom: 12px;">Accès direct aux moteurs de recherche externes :</p>
      <div style="display: flex; gap: 10px; justify-content: center; flex-wrap: wrap;">
        <a href="https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}" target="_blank" class="cyber-btn-sm">
          <i class="fa-solid fa-duck"></i> DuckDuckGo Lite
        </a>
        <a href="https://www.google.com/search?q=${encodeURIComponent(query)}" target="_blank" class="cyber-btn-sm">
          <i class="fa-brands fa-google"></i> Google
        </a>
        <a href="https://www.bing.com/search?q=${encodeURIComponent(query)}" target="_blank" class="cyber-btn-sm">
          <i class="fa-brands fa-microsoft"></i> Bing
        </a>
      </div>
    </div>
  `;

  container.innerHTML = html || `<p style="color: #888; text-align: center;">Aucun résultat direct trouvé.</p>`;
}

// 4. ONGLET WIKIPEDIA DÉTAILLÉ
async function renderWikiTab(query, container) {
  try {
    const wikiRes = await fetch(`https://fr.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=8`);
    const wikiData = await wikiRes.json();

    if (!wikiData.query || wikiData.query.search.length === 0) {
      container.innerHTML = `<p style="color: #888; text-align: center;">Aucun article encyclopédique trouvé.</p>`;
      return;
    }

    let html = '';
    wikiData.query.search.forEach(item => {
      const cleanSnippet = item.snippet.replace(/(<([^>]+)>)/gi, "");
      const link = `https://fr.wikipedia.org/wiki/${encodeURIComponent(item.title)}`;
      
      html += `
        <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(0, 240, 255, 0.15); border-radius: 8px; padding: 14px; transition: all 0.2s ease;">
          <a href="${link}" target="_blank" style="color: #fff; font-weight: bold; text-decoration: none; font-size: 1rem; display: flex; justify-content: space-between; align-items: center;">
            <span>${item.title}</span>
            <i class="fa-solid fa-arrow-up-right-from-square" style="color: var(--primary); font-size: 0.8rem;"></i>
          </a>
          <p style="color: #a0a5b5; font-size: 0.85rem; margin-top: 6px; line-height: 1.4;">${cleanSnippet}...</p>
        </div>
      `;
    });

    container.innerHTML = html;
  } catch (e) {
    container.innerHTML = `<p style="color: #f55; text-align: center;">Erreur lors du chargement de Wikipédia.</p>`;
  }
}

// 5. ONGLET IMAGES (Wikimedia Commons API)
async function renderImagesTab(query, container) {
  try {
    const imgRes = await fetch(`https://commons.wikimedia.org/w/api.php?action=query&generator=search&gpssearch=${encodeURIComponent(query)}&gpsnamespace=6&postprocessor=optimized&prop=pageimages&piprop=thumbnail&pithumbsize=400&format=json&origin=*`);
    const imgData = await imgRes.json();

    if (!imgData.query || !imgData.query.pages) {
      container.innerHTML = `<p style="color: #888; text-align: center;">Aucune image disponible pour cette recherche.</p>`;
      return;
    }

    const pages = Object.values(imgData.query.pages);
    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(130px, 1fr)); gap: 10px;">`;

    pages.forEach(page => {
      if (page.thumbnail && page.thumbnail.source) {
        html += `
          <a href="${page.thumbnail.source}" target="_blank" style="
            display: block; 
            height: 110px; 
            border-radius: 8px; 
            overflow: hidden; 
            border: 1px solid rgba(0,240,255,0.2);
            background: #000;
          ">
            <img src="${page.thumbnail.source}" style="width: 100%; height: 100%; object-fit: cover; transition: transform 0.3s ease;" onmouseover="this.style.transform='scale(1.1)'" onmouseout="this.style.transform='scale(1)'">
          </a>
        `;
      }
    });

    html += `</div>`;
    container.innerHTML = html;

  } catch (e) {
    container.innerHTML = `<p style="color: #f55; text-align: center;">Erreur de chargement des images.</p>`;
  }
}

// Composant Carte
function createResultCard(text, url, tag) {
  return `
    <div style="background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); border-radius: 8px; padding: 12px;">
      <a href="${url}" target="_blank" style="color: #fff; font-weight: 500; text-decoration: none; font-size: 0.9rem; display: flex; justify-content: space-between; align-items: center;">
        <span>${text.slice(0, 90)}...</span>
        <i class="fa-solid fa-external-link" style="color: var(--primary); font-size: 0.75rem;"></i>
      </a>
      <span style="display: inline-block; font-size: 0.7rem; color: var(--primary); margin-top: 6px; background: rgba(0,240,255,0.1); padding: 2px 6px; border-radius: 4px;">${tag}</span>
    </div>
  `;
}
