/* ==========================================================================
   APP ENTRY POINT
   ========================================================================== */

import { initClock } from './clockTimer.js';
import { initWeather } from './weather.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  initClock();
  initWeather();
  initSearchEngine();
  initFavorites();
  initTheme();
});
