import { temperatureUtils } from "./constants.js";

let appState = {
  currentLang: localStorage.getItem("language") || "en",
  temperatureUnit: localStorage.getItem("temperatureUnit") || "celsius",
  currentCity: "Minsk",
  currentCountry: "Belarus",
  currentTime: "12:00",
  currentDate: "Mon, 1 Jan",
  currentLatitude: 53.9,
  currentLongitude: 27.5667,
  timezone: "Europe/Minsk",
  currentWeather: null,
  forecast: [],
  timeUpdateInterval: null,
  tempElement: null,
};

export const getState = () => ({ ...appState });

export const updateState = (newState) => {
  appState = { ...appState, ...newState };
  saveToLocalStorage();
  return appState;
};

const saveToLocalStorage = () => {
  localStorage.setItem("language", appState.currentLang);
  localStorage.setItem("temperatureUnit", appState.temperatureUnit);
};

export const convertTemperature = (temp) => {
  if (appState.temperatureUnit === "fahrenheit") {
    return temperatureUtils.celsiusToFahrenheit(temp);
  }
  return temp;
};

export const getTemperatureSymbol = () => {
  return appState.temperatureUnit === "celsius" ? "C" : "F";
};

export const clearTimeInterval = () => {
  if (appState.timeUpdateInterval) {
    clearInterval(appState.timeUpdateInterval);
    appState.timeUpdateInterval = null;
  }
};
