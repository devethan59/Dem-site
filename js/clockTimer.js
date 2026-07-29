import { playUiSound } from './audio.js';

export function initClockAndTimer() {
  const clockEl = document.getElementById('clock');
  const dateEl = document.getElementById('date');
  const timerDisplay = document.getElementById('timerDisplay');
  const timerTime = document.getElementById('timerTime');
  const startTimer = document.getElementById('startTimer');
  const resetTimer = document.getElementById('resetTimer');
  const closeTimer = document.getElementById('closeTimer');

  const optionsDate = { weekday: 'long', day: 'numeric', month: 'long' };

  function updateClock() {
    const now = new Date();
    if (clockEl) clockEl.textContent = now.toLocaleTimeString('fr-FR');
    if (dateEl) {
      let strDate = now.toLocaleDateString('fr-FR', optionsDate);
      dateEl.textContent = strDate.charAt(0).toUpperCase() + strDate.slice(1);
    }
  }

  updateClock();
  setInterval(updateClock, 1000);

  clockEl?.addEventListener('click', () => {
    playUiSound(600, 0.05);
    clockEl.style.display = 'none';
    if (timerDisplay) timerDisplay.style.display = 'flex';
  });

  closeTimer?.addEventListener('click', () => {
    playUiSound(400, 0.05);
    if (timerDisplay) timerDisplay.style.display = 'none';
    if (clockEl) clockEl.style.display = 'block';
  });

  let timerInterval = null;
  let timeLeft = 25 * 60;

  function updateTimerText() {
    const m = Math.floor(timeLeft / 60).toString().padStart(2, '0');
    const s = (timeLeft % 60).toString().padStart(2, '0');
    if (timerTime) timerTime.textContent = `${m}:${s}`;
  }

  startTimer?.addEventListener('click', () => {
    playUiSound(800, 0.05);
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      startTimer.className = 'fa-solid fa-play';
    } else {
      startTimer.className = 'fa-solid fa-pause';
      timerInterval = setInterval(() => {
        if (timeLeft > 0) {
          timeLeft--;
          updateTimerText();
        } else {
          clearInterval(timerInterval);
          playUiSound(1000, 0.3);
          alert('Session Terminée !');
        }
      }, 1000);
    }
  });

  resetTimer?.addEventListener('click', () => {
    playUiSound(300, 0.05);
    clearInterval(timerInterval);
    timerInterval = null;
    timeLeft = 25 * 60;
    if (startTimer) startTimer.className = 'fa-solid fa-play';
    updateTimerText();
  });
}
