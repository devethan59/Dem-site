export function initClockAndTimer() {
  updateClock();
  setInterval(updateClock, 1000);
}

function updateClock() {
  const clockDisplay = document.getElementById('clockDisplay');
  const dateDisplay = document.getElementById('dateDisplay');

  if (!clockDisplay) return;

  const now = new Date();
  
  // Format HH:MM:SS
  const hours = String(now.getHours()).padStart(2, '0');
  const minutes = String(now.getMinutes()).padStart(2, '0');
  const seconds = String(now.getSeconds()).padStart(2, '0');

  clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

  if (dateDisplay) {
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('fr-FR', options);
  }
}
