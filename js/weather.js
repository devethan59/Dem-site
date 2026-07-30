/* ==========================================================================
   WEATHER WIDGET (Gestion d'erreurs robuste)
   ========================================================================== */

export function initWeather() {
  const container = document.getElementById('weatherWidget');
  if (!container) return;

  if (!navigator.geolocation) {
    container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Géo non supportée</span>`;
    return;
  }

  navigator.geolocation.getCurrentPosition(
    position => fetchWeather(position.coords.latitude, position.coords.longitude, container),
    () => {
      // Fallback si géolocalisation refusée (ex: Paris)
      fetchWeather(48.8566, 2.3522, container);
    },
    { timeout: 8000 }
  );
}

async function fetchWeather(lat, lon, container) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`);
    if (!res.ok) throw new Error(`HTTP Error: ${res.status}`);

    const data = await res.json();
    if (!data.current_weather) throw new Error('Données météo invalides');

    const temp = Math.round(data.current_weather.temperature);
    const code = data.current_weather.weathercode;
    const icon = getWeatherIcon(code);

    container.innerHTML = `
      <div style="display: flex; align-items: center; justify-content: center; gap: 8px; font-size: 0.9rem;">
        <i class="${icon}" style="color: var(--primary);"></i>
        <span>${temp}°C</span>
      </div>
    `;
  } catch (err) {
    container.innerHTML = `<span style="font-size: 0.8rem; color: var(--text-muted);">Météo indisponible</span>`;
  }
}

function getWeatherIcon(code) {
  if (code === 0) return 'fa-solid fa-sun';
  if (code >= 1 && code <= 3) return 'fa-solid fa-cloud-sun';
  if (code >= 45 && code <= 48) return 'fa-solid fa-smog';
  if (code >= 51 && code <= 67) return 'fa-solid fa-cloud-rain';
  if (code >= 71 && code <= 77) return 'fa-solid fa-snowflake';
  if (code >= 80 && code <= 82) return 'fa-solid fa-cloud-showers-heavy';
  if (code >= 95) return 'fa-solid fa-bolt';
  return 'fa-solid fa-cloud';
}
