/* ==========================================================================
   CLOCK & DATE WIDGET
   ========================================================================== */

export function initClock() {
  const clockDisplay = document.getElementById('clockDisplay');
  const dateDisplay = document.getElementById('dateDisplay');

  if (!clockDisplay || !dateDisplay) return;

  function update() {
    const now = new Date();

    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    clockDisplay.textContent = `${hours}:${minutes}:${seconds}`;

    const options = { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' };
    dateDisplay.textContent = now.toLocaleDateString('fr-FR', options);
  }

  update();
  setInterval(update, 1000);
}
