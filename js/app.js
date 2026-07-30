/* ==========================================================================
   APP.JS - MAIN ENTRY POINT
   ========================================================================== */

import { initClock } from './clockTimer.js';
import { initWeather } from './weather.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initTheme } from './theme.js';

document.addEventListener('DOMContentLoaded', () => {
  // Initialisation de chaque module
  initClock();
  initWeather();
  initSearchEngine();
  initFavorites();
  initSidebarAndTodos();
  initTheme();
});
