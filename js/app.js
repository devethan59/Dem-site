import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  // Fonction utilitaire d'exécution sécurisée
  const runModule = (name, fn) => {
    try {
      if (typeof fn === 'function') {
        fn();
      }
    } catch (err) {
      console.error(`[App] Erreur lors du chargement de ${name}:`, err);
    }
  };

  // 1. Initialisation des paramètres visuels et audio
  runModule('Settings', initSettings);
  runModule('Particles', initParticles);
  runModule('Audio', initAudioGenerator);

  // 2. Initialisation des modules applicatifs principaux
  runModule('Clock & Timer', initClockAndTimer);
  runModule('Weather', initWeather);
  runModule('Search Engine', initSearchEngine);
  runModule('Favorites', initFavorites);
  runModule('Sidebar & Todos', initSidebarAndTodos);

  // 3. Effets sonores globaux sur l'interface (survol & clic)
  document.querySelectorAll('.cyber-btn, .color-dot, .radius-btn, .fav-card').forEach(element => {
    element.addEventListener('click', () => {
      if (typeof playUiSound === 'function') {
        playUiSound(600, 0.04);
      }
    });
  });

  // 4. Raccourcis clavier globaux
  document.addEventListener('keydown', (e) => {
    // Ctrl + K ou Cmd + K : Focus sur le champ de recherche
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      const searchInput = document.getElementById('searchInput');
      if (searchInput) {
        searchInput.focus();
        if (typeof playUiSound === 'function') playUiSound(850, 0.05);
      }
    }

    // Échap : Ferme toutes les fenêtres modales ouvertes
    if (e.key === 'Escape') {
      const activeModals = document.querySelectorAll('.modal-overlay.active');
      if (activeModals.length > 0) {
        activeModals.forEach(modal => modal.classList.remove('active'));
        if (typeof playUiSound === 'function') playUiSound(300, 0.05);
      }
    }
  });
});
