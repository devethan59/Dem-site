// Dictionnaire des moteurs de recherche et raccourcis
const ENGINES = {
  google: { name: 'Google', url: 'https://www.google.com/search?q=', prefix: 'g/' },
  duckduckgo: { name: 'DuckDuckGo', url: 'https://duckduckgo.com/?q=', prefix: 'ddg/' },
  youtube: { name: 'YouTube', url: 'https://www.youtube.com/results?search_query=', prefix: 'yt/' },
  github: { name: 'GitHub', url: 'https://github.com/search?q=', prefix: 'gh/' },
  wikipedia: { name: 'Wikipedia', url: 'https://fr.wikipedia.org/wiki/Special:Search?search=', prefix: 'wiki/' },
  chatgpt: { name: 'ChatGPT', url: 'https://chatgpt.com/?q=', prefix: 'ai/' }
};

let activeEngine = localStorage.getItem('nexus_engine') || 'google';
let selectedSuggestionIndex = -1;

export function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const selector = document.getElementById('engineSelector');
  const suggestionsBox = document.getElementById('searchSuggestions');

  if (!form || !input) return;

  // Initialisation du sélecteur
  if (selector) {
    selector.value = activeEngine;
    selector.addEventListener('change', (e) => {
      activeEngine = e.target.value;
      localStorage.setItem('nexus_engine', activeEngine);
    });
  }

  // Soumission du formulaire
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) executeSearch(query);
  });

  // Gestion de l'autocomplétion et raccourcis clavier dans l'input
  input.addEventListener('input', () => {
    const query = input.value.trim();
    selectedSuggestionIndex = -1;

    if (query.length > 1) {
      fetchSuggestions(query);
    } else if (suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });

  // Navigation dans les suggestions avec les flèches du clavier
  input.addEventListener('keydown', (e) => {
    if (!suggestionsBox || suggestionsBox.style.display === 'none') return;
    const items = suggestionsBox.querySelectorAll('li');

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
      highlightSuggestion(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
      highlightSuggestion(items);
    } else if (e.key === 'Enter' && selectedSuggestionIndex >= 0) {
      e.preventDefault();
      if (items[selectedSuggestionIndex]) {
        input.value = items[selectedSuggestionIndex].dataset.value;
        suggestionsBox.style.display = 'none';
        executeSearch(input.value);
      }
    }
  });

  // Fermer les suggestions si on clique ailleurs
  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
}

function executeSearch(query) {
  let targetUrl = '';

  // 1. Détection de préfixe (ex: yt/ cyberpunk)
  for (const key in ENGINES) {
    const engine = ENGINES[key];
    if (query.startsWith(engine.prefix)) {
      const cleanQuery = query.replace(engine.prefix, '').trim();
      targetUrl = engine.url + encodeURIComponent(cleanQuery);
      window.open(targetUrl, '_blank');
      return;
    }
  }

  // 2. Détection si la saisie est une URL directe
  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/i;
  if (urlPattern.test(query) || query.startsWith('localhost:')) {
    targetUrl = /^https?:\/\//i.test(query) ? query : 'https://' + query;
    window.open(targetUrl, '_blank');
    return;
  }

  // 3. Recherche classique via le moteur actif
  const currentEngine = ENGINES[activeEngine] || ENGINES.google;
  targetUrl = currentEngine.url + encodeURIComponent(query);
  window.open(targetUrl, '_blank');
}

// Récupération dynamique des suggestions via JSONP Google
function fetchSuggestions(query) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;

  const script = document.createElement('script');
  window.googleSuggestCallback = (data) => {
    const suggestions = data[1] || [];
    renderSuggestions(suggestions);
    document.body.removeChild(script);
  };

  script.src = `https://suggestqueries.google.com/complete/search?client=chrome&q=${encodeURIComponent(query)}&callback=googleSuggestCallback`;
  document.body.appendChild(script);
}

function renderSuggestions(suggestions) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;

  if (suggestions.length === 0) {
    suggestionsBox.style.display = 'none';
    return;
  }

  suggestionsBox.innerHTML = suggestions.slice(0, 6).map((item) => `
    <li data-value="${item}" style="padding: 10px 15px; cursor: pointer; color: #fff; font-size: 0.9rem; border-bottom: 1px solid rgba(255,255,255,0.05); transition: background 0.2s;" onmouseover="this.style.background='rgba(0, 240, 255, 0.2)'" onmouseout="this.style.background='transparent'">
      <i class="fa-solid fa-magnifying-glass" style="font-size: 0.75rem; margin-right: 8px; color: var(--primary, #00f0ff);"></i>${item}
    </li>
  `).join('');

  suggestionsBox.style.display = 'block';

  // Clic sur une suggestion
  suggestionsBox.querySelectorAll('li').forEach(li => {
    li.addEventListener('click', () => {
      const input = document.getElementById('searchInput');
      if (input) input.value = li.dataset.value;
      suggestionsBox.style.display = 'none';
      executeSearch(li.dataset.value);
    });
  });
}

function highlightSuggestion(items) {
  items.forEach((item, idx) => {
    if (idx === selectedSuggestionIndex) {
      item.style.background = 'rgba(0, 240, 255, 0.3)';
      item.style.color = 'var(--primary, #00f0ff)';
    } else {
      item.style.background = 'transparent';
      item.style.color = '#fff';
    }
  });
}
