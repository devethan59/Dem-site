import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  // Exécution sécurisée de chaque module
  const runModule = (name, fn) => {
    try {
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.error(`Erreur module [${name}]:`, err);
    }
  };

  // Initialisation ordonnée
  runModule('Theme Settings', initSettings);
  runModule('Particles', initParticles);
  runModule('Audio', initAudioGenerator);
  runModule('Clock & Timer', initClockAndTimer);
  runModule('Weather', initWeather);
  runModule('Search Engine', initSearchEngine);
  runModule('Favorites', initFavorites);
  runModule('Sidebar & Todos', initSidebarAndTodos);

  // Effet sonore global au clic
  document.querySelectorAll('.cyber-btn, .fav-card').forEach(el => {
    el.addEventListener('click', () => {
      if (typeof playUiSound === 'function') playUiSound(600, 0.04);
    });
  });

  // Raccourci Ctrl+K / Cmd+K pour la recherche
  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
    }
  });
});
