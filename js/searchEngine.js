/* ==========================================================================
   SEARCH ENGINE & SHORTCUTS
   ========================================================================== */

import { playSound } from './audio.js';

const ENGINES = {
  google: 'https://www.google.com/search?q=',
  duckduckgo: 'https://duckduckgo.com/?q=',
  youtube: 'https://www.youtube.com/results?search_query=',
  github: 'https://github.com/search?q=',
  wikipedia: 'https://fr.wikipedia.org/wiki/Special:Search?search=',
  chatgpt: 'https://chatgpt.com/?q='
};

export function initSearchEngine() {
  const form = document.getElementById('searchForm');
  const input = document.getElementById('searchInput');
  const selector = document.getElementById('engineSelector');

  if (!form || !input || !selector) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const query = input.value.trim();
    if (!query) return;

    playSound('click');

    let engineUrl = ENGINES[selector.value] || ENGINES.google;
    let cleanQuery = query;

    // Détection des préfixes (g/, yt/, gh/, etc.)
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
