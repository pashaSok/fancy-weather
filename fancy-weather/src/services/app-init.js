import { getState, updateState } from "../utils/state.js";
import {
  updateAllWeatherData,
  updateLocationInfo,
  updateWeatherUI,
  updateForecastUI,
  updateMapUI,
  updateMapOnCityChange,
  initializeMap,
} from "../utils/ui-updater.js";
import {
  getLocation,
  getLocationByCity,
  getWeather,
  getWeatherForecast,
  getCityBackground,
} from "../utils/api-utils.js";
import { showLoader, hideLoader } from "../utils/dom-utils.js";

export const initApp = async () => {
  showLoader();
  try {
    await loadInitialData();
    updateAllWeatherData();
    initializeMap();
  } catch (error) {
    console.error("App initialization failed:", error);
  } finally {
    hideLoader();
  }
};

export const loadInitialData = async () => {
  try {
    const locationData = await getLocation();
    updateState({
      currentCity: locationData.city || "Minsk",
      currentCountry: locationData.country_name || "Belarus",
      currentLatitude: locationData.latitude || 53.9,
      currentLongitude: locationData.longitude || 27.5667,
      timezone: locationData.timezone || "Europe/Minsk",
    });

    await loadWeatherData();
  } catch (error) {
    console.warn("Using default location data:", error.message);
  }
};

export const loadWeatherData = async (cityName = null) => {
  const state = getState();

  if (cityName) {
    const locationData = await getLocationByCity(cityName);
    updateMapOnCityChange(locationData.latitude, locationData.longitude);

    updateState({
      currentCity: locationData.city,
      currentCountry: locationData.country_name,
      timezone: locationData.timezone,
    });
  }

  const [weatherData, forecastData] = await Promise.all([
    getWeather(state.currentLatitude, state.currentLongitude),
    getWeatherForecast(state.currentLatitude, state.currentLongitude),
  ]);

  if (weatherData) {
    updateState({
      currentWeather: {
        temp: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        wind: Math.round(weatherData.wind.speed),
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
      },
    });

    const bgUrl = await getCityBackground(
      state.currentCity,
      weatherData.weather[0].main,
      state.timezone
    );
    updateBackground(bgUrl);
  }

  updateState({ forecast: forecastData || [] });
};

export const updateBackground = (imageUrl) => {
  const app = document.getElementById("app");
  if (!app) return;

  if (!imageUrl) {
    app.style.backgroundImage =
      "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
    app.className = "min-h-screen flex flex-col";
    return;
  }

  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    app.className =
      "min-h-screen bg-cover bg-center bg-no-repeat bg-fixed flex flex-col transition-all duration-500";
    app.style.backgroundImage = `linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)), url("${imageUrl}")`;
  };
  img.onerror = () => {
    app.style.backgroundImage =
      "linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)";
    app.className = "min-h-screen flex flex-col";
  };
};

export const weatherApp = {
  init: initApp,
  loadWeatherData,
  updateBackground,
  updateAllWeatherData,
  updateLocationInfo,
  updateWeatherUI,
  updateForecastUI,
  updateMapUI,
};
