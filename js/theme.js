/* ==========================================================================
   THEME & SETTINGS MANAGEMENT
   ========================================================================== */

import { playSound } from './audio.js';

export function initTheme() {
  const settingsBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const modal = document.getElementById('settingsModal');
  const resetBtn = document.getElementById('resetSettingsBtn');

  if (settingsBtn && modal) {
    settingsBtn.addEventListener('click', () => {
      playSound('click');
      modal.classList.add('active');
    });
  }

  if (closeBtn && modal) {
    closeBtn.addEventListener('click', () => {
      playSound('click');
      modal.classList.remove('active');
    });
  }

  // Teinte Néon
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', () => {
      playSound('click');
      const hue = dot.dataset.hue || '185';
      document.documentElement.style.setProperty('--primary-hue', hue);
      document.documentElement.style.setProperty('--primary', `hsl(${hue}, 100%, 50%)`);
      document.documentElement.style.setProperty('--primary-glow', `hsla(${hue}, 100%, 50%, 0.4)`);
      saveSetting('nexus_hue', hue);
    });
  });

  // Arrondi
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      playSound('click');
      const radius = btn.dataset.radius || '8px';
      document.documentElement.style.setProperty('--card-radius', radius);
      saveSetting('nexus_radius', radius);
    });
  });

  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      playSound('click');
      try {
        localStorage.removeItem('nexus_hue');
        localStorage.removeItem('nexus_radius');
      } catch (e) {}
      document.documentElement.style.setProperty('--primary', '#00f0ff');
      document.documentElement.style.setProperty('--primary-glow', 'rgba(0, 240, 255, 0.4)');
      document.documentElement.style.setProperty('--card-radius', '8px');
    });
  }

  loadSavedSettings();
}

function saveSetting(key, val) {
  try {
    localStorage.setItem(key, val);
  } catch (e) {}
}

function loadSavedSettings() {
  try {
    const hue = localStorage.getItem('nexus_hue');
    if (hue) {
      document.documentElement.style.setProperty('--primary', `hsl(${hue}, 100%, 50%)`);
      document.documentElement.style.setProperty('--primary-glow', `hsla(${hue}, 100%, 50%, 0.4)`);
    }
    const radius = localStorage.getItem('nexus_radius');
    if (radius) {
      document.documentElement.style.setProperty('--card-radius', radius);
    }
  } catch (e) {}
}
