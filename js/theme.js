// =========================================================================
// 1. DÉCLARATIONS ET PARAMÈTRES
// =========================================================================

const DEFAULT_SETTINGS = {
  hue: "185",
  radius: "4px",
  scanlines: true,
  sfx: true,
  bgType: "particles",
  bgColor: "#030509",
  bgUrl: ""
};

let currentSettings = JSON.parse(localStorage.getItem('nexus_settings')) || { ...DEFAULT_SETTINGS };
let animationFrameId = null;

// =========================================================================
// 2. INITIALISATION & EXPORTS
// =========================================================================

export function initSettings() {
  applySettings(currentSettings);
  bindEvents();
}

export function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  if (currentSettings.bgType !== 'particles') {
    canvas.style.display = 'none';
    if (animationFrameId) cancelAnimationFrame(animationFrameId);
    return;
  }

  canvas.style.display = 'block';
}

// =========================================================================
// 3. APPLICATION EN TEMPS RÉEL DES PARAMÈTRES
// =========================================================================

function applySettings(settings) {
  const root = document.documentElement;

  // Variables CSS
  root.style.setProperty('--primary-h', settings.hue);
  root.style.setProperty('--card-radius', settings.radius);
  root.style.setProperty('--scanline-opacity', settings.scanlines ? '0.15' : '0');

  // Affichage du canvas / fond
  const canvas = document.getElementById('bgCanvas');
  const bgColorGroup = document.getElementById('bgColorGroup');
  const bgUrlGroup = document.getElementById('bgUrlGroup');

  if (bgColorGroup) bgColorGroup.style.display = (settings.bgType === 'color') ? 'block' : 'none';
  if (bgUrlGroup) bgUrlGroup.style.display = (settings.bgType === 'image') ? 'block' : 'none';

  if (settings.bgType === 'color') {
    if (canvas) canvas.style.display = 'none';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = settings.bgColor;
  } else if (settings.bgType === 'image') {
    if (canvas) canvas.style.display = 'none';
    document.body.style.backgroundColor = '#030509';
    document.body.style.backgroundImage = settings.bgUrl ? `url("${settings.bgUrl}")` : 'none';
    document.body.style.backgroundSize = 'cover';
    document.body.style.backgroundPosition = 'center';
  } else {
    // Mode Particules
    if (canvas) canvas.style.display = 'block';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--bg-dark, #030509)';
  }

  updateModalUI(settings);
  localStorage.setItem('nexus_settings', JSON.stringify(settings));
}

function updateModalUI(settings) {
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.hue === settings.hue);
  });

  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.radius === settings.radius);
  });

  const scanToggle = document.getElementById('scanlinesToggle');
  if (scanToggle) scanToggle.checked = settings.scanlines;

  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) bgSelect.value = settings.bgType;
}

// =========================================================================
// 4. ÉCOUTEURS D'ÉVÉNEMENTS
// =========================================================================

function bindEvents() {
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const modal = document.getElementById('settingsModal');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  // Pastilles de couleur
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      currentSettings.hue = e.currentTarget.dataset.hue;
      applySettings(currentSettings);
    });
  });

  // Géométrie
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentSettings.radius = e.currentTarget.dataset.radius;
      applySettings(currentSettings);
    });
  });

  // Interrupteur Scanlines
  const scanToggle = document.getElementById('scanlinesToggle');
  if (scanToggle) {
    scanToggle.addEventListener('change', (e) => {
      currentSettings.scanlines = e.target.checked;
      applySettings(currentSettings);
    });
  }

  // Type de fond
  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) {
    bgSelect.addEventListener('change', (e) => {
      currentSettings.bgType = e.target.value;
      applySettings(currentSettings);
      initParticles();
    });
  }

  // Réinitialisation
  const resetBtn = document.getElementById('resetSettingsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSettings = { ...DEFAULT_SETTINGS };
      applySettings(currentSettings);
      initParticles();
    });
  }
}
