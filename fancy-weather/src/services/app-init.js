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
import { showErrorPopup } from "../components/popup.js";
import { translations } from "../utils/translations.js";

export const initApp = async () => {
  showLoader();
  try {
    await loadInitialData();
  } catch (error) {
    console.error("App initialization failed:", error);
  } finally {
    hideLoader();
  }
};

export const loadInitialData = async () => {
  try {
    const state = getState();
    const locationData = await getLocation(state.currentLang);

    await updateWeatherForLocation(
      locationData.city,
      locationData.country_name,
      locationData.latitude,
      locationData.longitude,
      locationData.timezone
    );
  } catch (error) {
    console.warn("Using default location data:", error.message);
    await updateWeatherForLocation(
      "Minsk",
      "Belarus",
      53.9,
      27.5667,
      "Europe/Minsk"
    );
  }
};

export const loadWeatherData = async (cityName = null) => {
  if (!cityName) {
    return false;
  }

  try {
    const state = getState();
    const locationData = await getLocationByCity(cityName, state.currentLang);

    await updateWeatherForLocation(
      locationData.city,
      locationData.country_name,
      locationData.latitude,
      locationData.longitude,
      locationData.timezone
    );

    return true;
  } catch (error) {
    console.error("Failed to get location:", error);

    const state = getState();
    const t = translations[state.currentLang];
    let errorMessage = t.errorWeatherUnavailable;

    if (error.message.includes("Please enter a city name")) {
      errorMessage = t.errorEnterCity;
    } else if (error.message.includes("City not found")) {
      errorMessage = t.errorCityNotFound;
    }

    showErrorPopup(errorMessage);
    return false;
  }
};

const updateWeatherForLocation = async (city, country, lat, lng, timezone) => {
  try {
    updateState({
      currentCity: city,
      currentCountry: country,
      currentLatitude: lat,
      currentLongitude: lng,
      timezone: timezone,
    });

    updateMapOnCityChange(lat, lng);

    const [weatherData, forecastData] = await Promise.all([
      getWeather(lat, lng),
      getWeatherForecast(lat, lng),
    ]);

    if (!weatherData) {
      throw new Error("No weather data received");
    }

    updateState({
      currentWeather: {
        temp: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        wind: Math.round(weatherData.wind.speed),
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
      },
      forecast: forecastData || [],
    });

    try {
      const bgUrl = await getCityBackground(
        city,
        weatherData.weather[0].main,
        timezone
      );
      updateBackground(bgUrl);
    } catch (bgError) {
      console.error("Failed to update background:", bgError);
      updateBackground(null);
    }

    updateAllWeatherData();

    return true;
  } catch (error) {
    console.error("Failed to update weather for location:", error);
    throw error;
  }
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

export const updateLocationLocalization = async () => {
  const state = getState();
  try {
    const locationData = await getLocationByCity(
      state.currentCity,
      state.currentLang
    );

    updateState({
      currentCity: locationData.city,
      currentCountry: locationData.country_name,
    });

    updateLocationInfo();
  } catch (error) {
    console.warn("Failed to update location localization:", error);
  }
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
  updateLocationLocalization,
};
