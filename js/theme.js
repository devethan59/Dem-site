import { playUiSound } from './audio.js';

export function initSettings() {
  const bgTypeSelect = document.getElementById('bgTypeSelect');
  const bgValueGroup = document.getElementById('bgValueGroup');
  const bgValueInput = document.getElementById('bgValueInput');
  const neonColorSelect = document.getElementById('neonColorSelect');
  const saveBtn = document.getElementById('saveSettingsBtn');
  const openSettingsBtn = document.getElementById('openSettingsBtn');
  const settingsModal = document.getElementById('settingsModal');

  openSettingsBtn?.addEventListener('click', () => {
    playUiSound(500, 0.05);
    settingsModal?.classList.add('active');
  });

  bgTypeSelect?.addEventListener('change', () => {
    const val = bgTypeSelect.value;
    if (bgValueGroup) {
      bgValueGroup.style.display = val === 'particles' ? 'none' : 'flex';
      if (bgValueInput) bgValueInput.placeholder = val === 'image' ? "URL de l'image..." : "Code Couleur...";
    }
  });

  const savedBgType = localStorage.getItem('nexus_bg_type') || 'particles';
  const savedBgVal = localStorage.getItem('nexus_bg_val') || '';
  const savedNeon = localStorage.getItem('nexus_neon') || 'cyan';

  if (bgTypeSelect) bgTypeSelect.value = savedBgType;
  if (bgValueInput) bgValueInput.value = savedBgVal;
  if (neonColorSelect) neonColorSelect.value = savedNeon;
  
  applyTheme(savedBgType, savedBgVal, savedNeon);

  saveBtn?.addEventListener('click', () => {
    playUiSound(900, 0.06);
    const type = bgTypeSelect.value;
    const val = bgValueInput.value.trim();
    const neon = neonColorSelect.value;

    localStorage.setItem('nexus_bg_type', type);
    localStorage.setItem('nexus_bg_val', val);
    localStorage.setItem('nexus_neon', neon);

    applyTheme(type, val, neon);
    settingsModal?.classList.remove('active');
  });
}

function applyTheme(type, val, neon) {
  const canvas = document.getElementById('bgCanvas');
  
  if (canvas) {
    if (type === 'particles') {
      canvas.style.display = 'block';
      document.body.style.background = 'var(--bg-dark)';
    } else {
      canvas.style.display = 'none';
      if (type === 'gradient') {
        document.body.style.background = 'linear-gradient(135deg, #05070f 0%, #170d2b 50%, #05141f 100%)';
      } else if (type === 'color' && val) {
        document.body.style.background = val;
      } else if (type === 'image' && val) {
        document.body.style.background = `url('${val}') center/cover no-repeat fixed`;
      }
    }
  }

  const colors = {
    cyan: { p: '#00f0ff', pg: 'rgba(0,240,255,0.4)' },
    magenta: { p: '#ff0055', pg: 'rgba(255,0,85,0.4)' },
    purple: { p: '#8a2be2', pg: 'rgba(138,43,226,0.4)' },
    green: { p: '#00ff66', pg: 'rgba(0,255,102,0.4)' }
  };

  const choice = colors[neon] || colors.cyan;
  document.documentElement.style.setProperty('--primary', choice.p);
  document.documentElement.style.setProperty('--primary-glow', choice.pg);
}

export function initParticles() {
  const canvas = document.getElementById('bgCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  let width = canvas.width = window.innerWidth;
  let height = canvas.height = window.innerHeight;

  window.addEventListener('resize', () => {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
  });

  const particles = [];
  const count = 50;

  for (let i = 0; i < count; i++) {
    particles.push({
      x: Math.random() * width,
      y: Math.random() * height,
      vx: (Math.random() - 0.5) * 0.5,
      vy: (Math.random() - 0.5) * 0.5,
      radius: Math.random() * 2 + 1
    });
  }

  function animate() {
    if (canvas.style.display === 'none') {
      requestAnimationFrame(animate);
      return;
    }

    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--primary').trim() || '#00f0ff';
    ctx.strokeStyle = 'rgba(0, 240, 255, 0.05)';

    for (let i = 0; i < count; i++) {
      let p = particles[i];
      p.x += p.vx;
      p.y += p.vy;

      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();

      for (let j = i + 1; j < count; j++) {
        let p2 = particles[j];
        let dist = Math.hypot(p.x - p2.x, p.y - p2.y);
        if (dist < 120) {
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(p2.x, p2.y);
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(animate);
  }

  animate();
}
