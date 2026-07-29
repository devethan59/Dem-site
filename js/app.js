import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';
import { initRss } from './rss.js';

document.addEventListener('DOMContentLoaded', () => {
  // 1. Initialisation des composants graphiques et système
  initSettings();
  initParticles();
  initAudioGenerator();

  // 2. Initialisation des modules applicatifs
  initClockAndTimer();
  initWeather();
  initSearchEngine();
  initFavorites();
  initSidebarAndTodos();
  initRss();

  // 3. Effets sonores globaux sur l'interface (survol & clic)
  document.querySelectorAll('.cyber-btn, .color-dot, .radius-btn, .fav-card').forEach(element => {
    element.addEventListener('mouseenter', () => {
      playUiSound(400, 0.02); // Bip subtil au survol
    });
    element.addEventListener('click', () => {
      playUiSound(600, 0.04); // Bip de validation au clic
    });
  });

  // 4. Raccourcis clavier globaux
  document.addEventListener('keydown', (e) => {
    // Ctrl + K ou Cmd + K : Focus direct sur la barre de recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
        playUiSound(850, 0.05);
      }
    }

    // Touche Échap : Ferme toutes les modales ouvertes
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        activeModals.forEach(modal => modal.classList.remove('active'));
        playUiSound(300, 0.05);
      }
    }
  });
});
