// =========================================================================
// 1. CONFIGURATION PAR DÉFAUT & ÉTAT
// =========================================================================

const DEFAULT_SETTINGS = {
  hue: "185",             // Cyan par défaut
  radius: "4px",          // Bords type "Cyber" par défaut
  scanlines: true,        // Effet CRT activé
  sfx: true,              // Effets sonores de l'UI activés
  bgType: "particles",    // Type de fond par défaut
  bgColor: "#030509",     // Couleur unie par défaut
  bgUrl: ""               // URL de l'image vide par défaut
};

// Charge les paramètres depuis le cache du navigateur ou applique ceux par défaut
let currentSettings = JSON.parse(localStorage.getItem('nexus_settings')) || { ...DEFAULT_SETTINGS };


// =========================================================================
// 2. EXPORTS PRINCIPAUX (Appelés par app.js)
// =========================================================================

/**
 * Initialise le thème global, applique les paramètres et lance les écouteurs
 */
export function initSettings() {
  applySettings(currentSettings);
  bindEvents();
}

/**
 * Initialise l'animation du Canvas (exporté ici car demandé par app.js)
 */
export function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;

  // Si le mode particules n'est pas sélectionné, on coupe l'exécution
  if (currentSettings.bgType !== 'particles') {
    canvas.style.display = 'none';
    return;
  }

  canvas.style.display = 'block';
  // (Insère ici ta logique d'animation du canvas de particules si tu en as une complexe, 
  // sinon l'affichage est géré dynamiquement par applySettings).
}


// =========================================================================
// 3. LOGIQUE D'APPLICATION DES PARAMÈTRES
// =========================================================================

/**
 * Applique les paramètres au DOM et sauvegarde instantanément
 */
function applySettings(settings) {
  const root = document.documentElement;

  // 3.1. Variables CSS dynamiques
  root.style.setProperty('--primary-h', settings.hue);
  root.style.setProperty('--card-radius', settings.radius);
  root.style.setProperty('--scanline-opacity', settings.scanlines ? '0.15' : '0');

  // 3.2. Gestion du fond d'écran
  const canvas = document.getElementById('bgCanvas');
  const bgColorGroup = document.getElementById('bgColorGroup');
  const bgUrlGroup = document.getElementById('bgUrlGroup');

  // Affichage conditionnel des champs dans les paramètres
  if (bgColorGroup) bgColorGroup.style.display = (settings.bgType === 'color') ? 'block' : 'none';
  if (bgUrlGroup) bgUrlGroup.style.display = (settings.bgType === 'image') ? 'block' : 'none';

  // Application visuelle du fond
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
    // Mode Particules
    if (canvas) canvas.style.display = 'block';
    document.body.style.backgroundImage = 'none';
    document.body.style.backgroundColor = 'var(--bg-dark)';
  }

  // 3.3. Mise à jour de l'interface du Modal
  updateModalUI(settings);

  // 3.4. SAUVEGARDE DIRECTE (Save-on-change)
  localStorage.setItem('nexus_settings', JSON.stringify(settings));
}

/**
 * Synchronise les boutons/inputs du menu avec l'état actuel
 */
function updateModalUI(settings) {
  // Teintes (Hue)
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.hue === settings.hue);
  });

  // Géométrie (Bordures)
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.radius === settings.radius);
  });

  // Interrupteurs (Toggles)
  const scanToggle = document.getElementById('scanlinesToggle');
  if (scanToggle) scanToggle.checked = settings.scanlines;

  const sfxToggle = document.getElementById('sfxToggle');
  if (sfxToggle) sfxToggle.checked = settings.sfx;

  // Options du fond
  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) bgSelect.value = settings.bgType;

  const bgColorInput = document.getElementById('bgColorInput');
  if (bgColorInput) bgColorInput.value = settings.bgColor;

  const bgUrlInput = document.getElementById('bgUrlInput');
  if (bgUrlInput) bgUrlInput.value = settings.bgUrl;
}


// =========================================================================
// 4. ÉCOUTEURS D'ÉVÉNEMENTS (INTERACTIONS UTILISATEUR)
// =========================================================================

function bindEvents() {
  // Modal Open/Close
  const openBtn = document.getElementById('openSettingsBtn');
  const closeBtn = document.getElementById('closeSettingsBtn');
  const modal = document.getElementById('settingsModal');

  if (openBtn && modal) openBtn.addEventListener('click', () => modal.classList.add('active'));
  if (closeBtn && modal) closeBtn.addEventListener('click', () => modal.classList.remove('active'));

  // Clic sur les pastilles de couleur néon
  document.querySelectorAll('.color-dot').forEach(dot => {
    dot.addEventListener('click', (e) => {
      currentSettings.hue = e.currentTarget.dataset.hue;
      applySettings(currentSettings);
    });
  });

  // Clic sur les boutons de géométrie (Brut, Cyber, Lisse)
  document.querySelectorAll('.radius-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      currentSettings.radius = e.currentTarget.dataset.radius;
      applySettings(currentSettings);
    });
  });

  // Clic sur l'interrupteur Scanlines
  const scanToggle = document.getElementById('scanlinesToggle');
  if (scanToggle) {
    scanToggle.addEventListener('change', (e) => {
      currentSettings.scanlines = e.target.checked;
      applySettings(currentSettings);
    });
  }

  // Clic sur l'interrupteur SFX (Sons UI)
  const sfxToggle = document.getElementById('sfxToggle');
  if (sfxToggle) {
    sfxToggle.addEventListener('change', (e) => {
      currentSettings.sfx = e.target.checked;
      applySettings(currentSettings);
    });
  }

  // Changement du menu déroulant du type de fond
  const bgSelect = document.getElementById('bgTypeSelect');
  if (bgSelect) {
    bgSelect.addEventListener('change', (e) => {
      currentSettings.bgType = e.target.value;
      applySettings(currentSettings);
    });
  }

  // Sélection d'une couleur unie
  const bgColorInput = document.getElementById('bgColorInput');
  if (bgColorInput) {
    bgColorInput.addEventListener('input', (e) => {
      currentSettings.bgColor = e.target.value;
      applySettings(currentSettings);
    });
  }

  // Validation d'une URL pour l'image personnalisée
  const bgUrlInput = document.getElementById('bgUrlInput');
  if (bgUrlInput) {
    bgUrlInput.addEventListener('change', (e) => {
      currentSettings.bgUrl = e.target.value.trim();
      applySettings(currentSettings);
    });
  }

  // Bouton Réinitialiser (Retour aux paramètres d'usine)
  const resetBtn = document.getElementById('resetSettingsBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', () => {
      currentSettings = { ...DEFAULT_SETTINGS };
      applySettings(currentSettings);
    });
  }
}
