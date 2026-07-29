import { initClockAndTimer } from './clockTimer.js';
import { initSearchEngine } from './searchEngine.js';
import { initFavorites } from './favorites.js';
import { initSidebarAndTodos } from './todos.js';
import { initSettings, initParticles } from './theme.js';
import { initAudioGenerator, playUiSound } from './audio.js';
import { initWeather } from './weather.js';

document.addEventListener('DOMContentLoaded', () => {
  initClockAndTimer();
  initWeather();
  initSearchEngine();
  initFavorites();
  initSidebarAndTodos();
  initSettings();
  initParticles();
  initAudioGenerator();

  document.addEventListener('keydown', (e) => {
    if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
      e.preventDefault();
      document.getElementById('searchInput')?.focus();
      playUiSound(850, 0.05);
    }
  });
});
