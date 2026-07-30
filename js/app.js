import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  // Exécution isolée des modules pour éviter toute interruption d'application
  const launchModule = (name, fn) => {
    try {
      if (typeof fn === 'function') fn();
    } catch (err) {
      console.error(`[Problème Module - ${name}]:`, err);
    }
  };

  // Initialisation par ordre de priorité
  launchModule('Settings', initSettings);
  launchModule('Particles', initParticles);
  launchModule('Audio', initAudioGenerator);
  launchModule('Clock & Timer', initClockAndTimer);
  launchModule('Weather', initWeather);
  launchModule('Search Engine', initSearchEngine);
  launchModule('Favorites', initFavorites);
  launchModule('Todos & Sidebar', initSidebarAndTodos);

  // Sons d'interface interactifs
  document.addEventListener('click', (e) => {
    if (e.target.closest('.cyber-btn, .fav-card, .color-dot, .radius-btn')) {
      if (typeof playUiSound === 'function') playUiSound(600, 0.03);
    }
  });

  // Raccourcis clavier universels
  document.addEventListener('keydown', (e) => {
    // Focus Recherche avec Ctrl+K ou Cmd+K
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
        if (typeof playUiSound === 'function') playUiSound(800, 0.04);
      }
    }

    // Fermeture automatique de toute modale ouverte avec la touche Échap
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        activeModals.forEach(modal => modal.classList.remove('active'));
        if (typeof playUiSound === 'function') playUiSound(300, 0.04);
      }
    }
  });
});
