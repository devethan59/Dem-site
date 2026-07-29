import { playUiSound } from './audio.js';

export function initWeather() {
  const weatherContainer = document.getElementById('weatherWidget') || document.querySelector('.weather-container');
  if (!weatherContainer) return;

  // Récupérer dernière ville ou géolocaliser
  const savedCity = localStorage.getItem('nexus_city');
  if (savedCity) {
    fetchWeatherByCity(savedCity);
  } else if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeatherByCoords(pos.coords.latitude, pos.coords.longitude),
      () => fetchWeatherByCity('Paris') // Ville par défaut si refus
    );
  } else {
    fetchWeatherByCity('Paris');
  }
}

async function fetchWeatherByCity(cityName) {
  try {
    const geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityName)}&count=1&language=fr&format=json`);
    const geoData = await geoRes.json();

    if (geoData.results && geoData.results.length > 0) {
      const city = geoData.results[0];
      localStorage.setItem('nexus_city', city.name);
      await fetchWeatherByCoords(city.latitude, city.longitude, city.name);
    } else {
      renderWeatherError('Ville introuvable');
    }
  } catch (e) {
    renderWeatherError('Erreur Réseau');
  }
}

async function fetchWeatherByCoords(lat, lon, customName = null) {
  try {
    const res = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
    const data = await res.json();

    const current = data.current;
    const weatherInfo = getWeatherDescription(current.weather_code);
    const displayName = customName || 'Ma Position';

    renderWeatherWidget(displayName, Math.round(current.temperature_2m), weatherInfo, current.relative_humidity_2m, Math.round(current.wind_speed_10m));
  } catch (e) {
    renderWeatherError('Erreur Météo');
  }
}

function renderWeatherWidget(city, temp, info, humidity, wind) {
  const container = document.getElementById('weatherWidget') || document.querySelector('.weather-container');
  if (!container) return;

  container.innerHTML = `
    <div style="
      background: rgba(10, 15, 30, 0.7); 
      border: 1px solid rgba(0, 240, 255, 0.2); 
      border-radius: 12px; 
      padding: 12px 16px; 
      display: flex; 
      align-items: center; 
      justify-content: space-between;
      backdrop-filter: blur(8px);
    ">
      <div style="display: flex; align-items: center; gap: 12px;">
        <i class="${info.icon}" style="font-size: 1.8rem; color: var(--primary);"></i>
        <div>
          <div style="display: flex; align-items: center; gap: 6px;">
            <span style="color: #fff; font-weight: bold; font-size: 1rem;">${city}</span>
            <button id="changeCityBtn" style="background: none; border: none; color: var(--text-muted, #777); cursor: pointer; font-size: 0.75rem;">
              <i class="fa-solid fa-pen"></i>
            </button>
          </div>
          <span style="color: #aaa; font-size: 0.75rem;">${info.label} · Humidité ${humidity}%</span>
        </div>
      </div>

      <div style="text-align: right;">
        <div style="font-family: var(--font-title); font-size: 1.5rem; font-weight: bold; color: var(--primary);">
          ${temp}°C
        </div>
        <div style="color: #888; font-size: 0.7rem;"><i class="fa-solid fa-wind"></i> ${wind} km/h</div>
      </div>
    </div>
  `;

  document.getElementById('changeCityBtn')?.addEventListener('click', () => {
    playUiSound(500, 0.04);
    const newCity = prompt('Entrez le nom de votre ville :');
    if (newCity && newCity.trim()) {
      fetchWeatherByCity(newCity.trim());
    }
  });
}

function renderWeatherError(msg) {
  const container = document.getElementById('weatherWidget') || document.querySelector('.weather-container');
  if (!container) return;
  container.innerHTML = `<div style="color: #f55; font-size: 0.8rem; padding: 10px;">${msg}</div>`;
}

// Codes WMO Open-Meteo
function getWeatherDescription(code) {
  if (code === 0) return { label: 'Ensoleillé', icon: 'fa-solid fa-sun' };
  if (code >= 1 && code <= 3) return { label: 'Nuageux', icon: 'fa-solid fa-cloud-sun' };
  if (code >= 45 && code <= 48) return { label: 'Brouillard', icon: 'fa-solid fa-smog' };
  if (code >= 51 && code <= 67) return { label: 'Pluie', icon: 'fa-solid fa-cloud-showers-heavy' };
  if (code >= 71 && code <= 77) return { label: 'Neige', icon: 'fa-solid fa-snowflake' };
  if (code >= 95) return { label: 'Orage', icon: 'fa-solid fa-bolt' };
  return { label: 'Ciel Variable', icon: 'fa-solid fa-cloud' };
}
