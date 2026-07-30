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

  if (selector) {
    selector.value = activeEngine;
    selector.addEventListener('change', (e) => {
      activeEngine = e.target.value;
      localStorage.setItem('nexus_engine', activeEngine);
    });
  }

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (query) executeSearch(query);
  });

  input.addEventListener('input', () => {
    const query = input.value.trim();
    selectedSuggestionIndex = -1;

    if (query.length > 1) {
      fetchSuggestions(query);
    } else if (suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });

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

  document.addEventListener('click', (e) => {
    if (!form.contains(e.target) && suggestionsBox) {
      suggestionsBox.style.display = 'none';
    }
  });
}

function executeSearch(query) {
  let targetUrl = '';

  for (const key in ENGINES) {
    const engine = ENGINES[key];
    if (query.startsWith(engine.prefix)) {
      const cleanQuery = query.replace(engine.prefix, '').trim();
      targetUrl = engine.url + encodeURIComponent(cleanQuery);
      window.open(targetUrl, '_blank');
      return;
    }
  }

  const urlPattern = /^(https?:\/\/)?([\w-]+\.)+[\w-]+(\/[\w-.\/?%&=]*)?$/i;
  if (urlPattern.test(query) || query.startsWith('localhost:')) {
    targetUrl = /^https?:\/\//i.test(query) ? query : 'https://' + query;
    window.open(targetUrl, '_blank');
    return;
  }

  const currentEngine = ENGINES[activeEngine] || ENGINES.google;
  targetUrl = currentEngine.url + encodeURIComponent(query);
  window.open(targetUrl, '_blank');
}

function fetchSuggestions(query) {
  const suggestionsBox = document.getElementById('searchSuggestions');
  if (!suggestionsBox) return;

  const script = document.createElement('script');
  window.googleSuggestCallback = (data) => {
    const suggestions = data[1] || [];
    renderSuggestions(suggestions);
    if (script.parentNode) script.parentNode.removeChild(script);
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
    <li data-value="${item}" style="padding: 10px 14px; cursor: pointer; color: #e0e0e0; font-size: 0.88rem; display: flex; align-items: center; gap: 10px; transition: background 0.15s, color 0.15s;" onmouseover="this.style.background='rgba(0, 240, 255, 0.15)'; this.style.color='var(--primary, #00f0ff)';" onmouseout="this.style.background='transparent'; this.style.color='#e0e0e0';">
      <i class="fa-solid fa-magnifying-glass" style="font-size: 0.75rem; color: var(--primary, #00f0ff); opacity: 0.8;"></i>
      <span>${item}</span>
    </li>
  `).join('');

  suggestionsBox.style.display = 'block';

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
      item.style.background = 'rgba(0, 240, 255, 0.25)';
      item.style.color = 'var(--primary, #00f0ff)';
    } else {
      item.style.background = 'transparent';
      item.style.color = '#e0e0e0';
    }
  });
}
