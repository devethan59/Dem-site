import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  // Exécution sécurisée pour parer à toute erreur
  const safeInit = (name, fn) => {
    try {
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.warn(`[Module ${name}] non initialisé :`, err);
    }
  };

  safeInit('Settings', initSettings);
  safeInit('Particles', initParticles);
  safeInit('Audio', initAudioGenerator);
  safeInit('Clock & Timer', initClockAndTimer);
  safeInit('Weather', initWeather);
  safeInit('Search Engine', initSearchEngine);
  safeInit('Favorites', initFavorites);
  safeInit('Todos & Sidebar', initSidebarAndTodos);

  // Sons UI sur clics
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cyber-btn, .fav-card, .color-dot, .radius-btn')) {
      if (typeof playUiSound === 'function') playUiSound(600, 0.03);
    }
  });

  // Raccourcis Clavier Globaux
  document.addEventListener('keydown', (e) => {
    // Ctrl + K / Cmd + K : Focus Barre de Recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const input = document.getElementById('searchInput');
      if (input) {
        input.focus();
        if (typeof playUiSound === 'function') playUiSound(800, 0.04);
      }
    }

    // Touche Échap : Fermeture de toutes les modales
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        activeModals.forEach(m => m.classList.remove('active'));
        if (typeof playUiSound === 'function') playUiSound(300, 0.04);
      }
    }
  });
});
