// Paramètres par défaut de l'application
const DEFAULT_SETTINGS = {
  hue: "185",
  radius: "4px",
  scanlines: true,
  sfx: true,
  bgType: "particles",
  bgColor: "#030509",
  bgUrl: ""
};

// Récupère les paramètres enregistrés ou charge les paramètres par défaut
let currentSettings = JSON.parse(localStorage.getItem('nexus_settings')) || { ...DEFAULT_SETTINGS };

/**
 * Initialise le gestionnaire de thème et bind les événements.
 */
export function initTheme() {
  applySettings(currentSettings);
  bindEvents();
}

/**
 * Applique l'ensemble des paramètres au DOM et sauvegarde dans localStorage.
 * @param {Object} settings 
 */
function applySettings(settings) {
  const root = document.documentElement;

  // 1. Appliquer la teinte principale (Hue HSL)
  root.style.setProperty('--primary-h', settings.hue);

  // 2. Appliquer le rayon de bordure des éléments
  root.style.setProperty('--card-radius', settings.radius);

  // 3. Appliquer la visibilité des Scanlines CRT
  root.style.setProperty('--scanline-opacity', settings.scanlines ? '0.15' : '0');

  // 4. Gestion de l'arrière-plan
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
    document.body.style.backgroundAttachment = 'fixed';
  } else {
    // Mode 'particles'
    if (canvas) canvas.style.display = 'block';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--bg-dark)';
  }

  // 5. Mettre à jour l'état visuel des contrôles dans le modal
  updateModalUI(settings);

  // 6. Enregistrement automatique et instantané
  localStorage.setItem('nexus_settings', JSON.stringify(settings));
}

/**
 * Synchronise les éléments graphiques du modal avec l'objet de configuration.
 * @param {Object} settings 
 */
function updateModalUI(settings) {
  // Sélection active de la pastille de couleur
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.hue === settings.hue);
  });

  // Sélection active du bouton de géométrie
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.radius === settings.radius);
  });

  // Checkbox Scanlines
  const scanToggle = document.getElementById('scanlinesToggle');
  if (scanToggle) scanToggle.checked = settings.scanlines;

  // Checkbox SFX
  const sfxToggle = document.getElementById('sfxToggle');
  if (sfxToggle) sfxToggle.checked = settings.sfx;

  // Selecteur de fond
  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) bgSelect.value = settings.bgType;

  // Input couleur de fond
  const bgColorInput = document.getElementById('bgColorInput');
  if (bgColorInput) bgColorInput.value = settings.bgColor;

  // Input URL image de fond
  const bgUrlInput = document.getElementById('bgUrlInput');
  if (bgUrlInput) bgUrlInput.value = settings.bgUrl;
}

/**
 * Écoute les actions utilisateur pour appliquer et sauvegarder en direct.
 */
function bindEvents() {
  // Pastilles de couleur
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      currentSettings.hue = e.currentTarget.dataset.hue;
      applySettings(currentSettings);
    });
  });

  // Boutons de rayon (Brut / Cyber / Lisse)
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

  // Interrupteur Effets Sonores
  const sfxToggle = document.getElementById('sfxToggle');
  if (sfxToggle) {
    sfxToggle.addEventListener('change', (e) => {
      currentSettings.sfx = e.target.checked;
      applySettings(currentSettings);
    });
  }

  // Type de Fond
  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) {
    bgSelect.addEventListener('change', (e) => {
      currentSettings.bgType = e.target.value;
      applySettings(currentSettings);
    });
  }

  // Couleur de Fond unie
  const bgColorInput = document.getElementById('bgColorInput');
  if (bgColorInput) {
    bgColorInput.addEventListener('input', (e) => {
      currentSettings.bgColor = e.target.value;
      applySettings(currentSettings);
    });
  }

  // URL Image de Fond
  const bgUrlInput = document.getElementById('bgUrlInput');
  if (bgUrlInput) {
    bgUrlInput.addEventListener('change', (e) => {
      currentSettings.bgUrl = e.target.value.trim();
      applySettings(currentSettings);
    });
  }

  // Bouton Réinitialiser
  const resetBtn = document.getElementById('resetSettingsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSettings = { ...DEFAULT_SETTINGS };
      applySettings(currentSettings);
    });
  }
}
