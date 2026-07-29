let audioCtx = null;
let noiseNode = null;
let isAudioPlaying = false;

export function playUiSound(freq, duration) {
  const enabled = document.getElementById('soundFxToggle')?.checked;
  if (!enabled) return;

  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.05, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + duration);
  } catch (e) {}
}

export function initAudioGenerator() {
  const btn = document.getElementById('audioToggleBtn');
  const label = document.getElementById('audioLabel');

  btn?.addEventListener('click', () => {
    if (!isAudioPlaying) {
      startAmbientAudio();
      btn.classList.add('active');
      if (label) label.textContent = 'On';
      isAudioPlaying = true;
    } else {
      stopAmbientAudio();
      btn.classList.remove('active');
      if (label) label.textContent = 'Off';
      isAudioPlaying = false;
    }
  });
}

function startAmbientAudio() {
  audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  const bufferSize = audioCtx.sampleRate * 2;
  const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);

  for (let i = 0; i < bufferSize; i++) {
    data[i] = Math.random() * 2 - 1;
  }

  noiseNode = audioCtx.createBufferSource();
  noiseNode.buffer = buffer;
  noiseNode.loop = true;

  const filter = audioCtx.createBiquadFilter();
  filter.type = 'lowpass';
  filter.frequency.setValueAtTime(600, audioCtx.currentTime);

  const gain = audioCtx.createGain();
  gain.gain.setValueAtTime(0.05, audioCtx.currentTime);

  noiseNode.connect(filter);
  filter.connect(gain);
  gain.connect(audioCtx.destination);

  noiseNode.start();
}

function stopAmbientAudio() {
  if (noiseNode) {
    noiseNode.stop();
    noiseNode.disconnect();
  }
  if (audioCtx) {
    audioCtx.close();
  }
}
