import { getState, updateState } from "../utils/state.js";
import {
  updateAllWeatherData,
  updateLocationInfo,
  updateWeatherUI,
  updateForecastUI,
  updateForecastDayNames,
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
  let currentCity = getState().currentCity;
  let currentTimezone = getState().timezone;

  if (cityName) {
    try {
      const locationData = await getLocationByCity(cityName);

      updateMapOnCityChange(locationData.latitude, locationData.longitude);

      currentCity = locationData.city;
      currentTimezone = locationData.timezone;

      updateState({
        currentCity: locationData.city,
        currentCountry: locationData.country_name,
        currentLatitude: locationData.latitude,
        currentLongitude: locationData.longitude,
        timezone: locationData.timezone,
      });
    } catch (error) {
      console.error("Failed to get location:", error);
      throw error;
    }
  }

  const state = getState();
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

    try {
      const bgUrl = await getCityBackground(
        currentCity,
        weatherData.weather[0].main,
        currentTimezone
      );

      if (bgUrl) {
        updateBackground(bgUrl);
      } else {
        updateBackground(null);
      }
    } catch (bgError) {
      console.error("Failed to update background:", bgError);
      updateBackground(null);
    }
  }

  updateState({ forecast: forecastData || [] });
  return true;
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

  const currentBg = app.style.backgroundImage;
  if (currentBg.includes(imageUrl)) {
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

export const refreshBackground = async () => {
  const state = getState();
  if (!state.currentWeather || !state.currentCity) return;

  const bgUrl = await getCityBackground(
    state.currentCity,
    state.currentWeather.description,
    state.timezone
  );
  updateBackground(bgUrl);
};

export const weatherApp = {
  init: initApp,
  loadWeatherData,
  updateBackground,
  refreshBackground,
  updateAllWeatherData,
  updateLocationInfo,
  updateWeatherUI,
  updateForecastUI,
  updateForecastDayNames,
  updateMapUI,
};
