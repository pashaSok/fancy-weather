import {
  getLocation,
  getLocationByCity,
  getStaticMapUrl,
  getWeather,
  getWeatherForecast,
  getCityBackground,
} from "../components/api.js";
import { state, temperatureUtils } from "../utils/constants.js";
import { translations } from "../utils/translations.js";
import { createContainer } from "../utils/container.js";
import { updateLocalDateTime, updateUIForLanguage } from "./Header.js";

function createLoader() {
  const loader = document.createElement("div");
  loader.id = "app-loader";
  loader.className = `
    fixed inset-0 z-50 flex items-center justify-center
    bg-black bg-opacity-50 transition-opacity duration-300
  `;

  const spinner = document.createElement("div");
  spinner.className = `
    w-16 h-16 border-4 border-white border-t-transparent
    rounded-full animate-spin
  `;

  loader.appendChild(spinner);
  return loader;
}

function showLoader() {
  let loader = document.getElementById("app-loader");
  if (!loader) {
    loader = createLoader();
    document.body.appendChild(loader);
  }
  loader.classList.remove("opacity-0", "hidden");
}

function hideLoader() {
  const loader = document.getElementById("app-loader");
  if (loader) {
    loader.classList.add("opacity-0");
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 300);
  }
}

export async function loadWeatherData(latitude, longitude, cityName = null) {
  showLoader();
  try {
    if (cityName) {
      const locationData = await getLocationByCity(cityName.trim());
      state.currentCity = locationData.city;
      state.currentCountry = locationData.country_name;
      state.currentLatitude = locationData.latitude;
      state.currentLongitude = locationData.longitude;
      state.timezone = locationData.timezone;
    }

    const [weatherData, forecastData] = await Promise.all([
      getWeather(state.currentLatitude, state.currentLongitude),
      getWeatherForecast(state.currentLatitude, state.currentLongitude),
    ]);

    if (weatherData) {
      state.currentWeather = {
        temp: Math.round(weatherData.main.temp),
        feels_like: Math.round(weatherData.main.feels_like),
        humidity: weatherData.main.humidity,
        wind: Math.round(weatherData.wind.speed),
        icon: weatherData.weather[0].icon,
        description: weatherData.weather[0].description,
      };
      const bgUrl = await getCityBackground(
        state.currentCity,
        weatherData.weather[0].main,
        state.timezone
      );
      updateBackground(bgUrl);
    }

    state.forecast = forecastData || [];
    updateMapUI();
    return true;
  } catch (error) {
    console.error(`Failed to load weather data: ${error.message}`);
    throw error;
  } finally {
    hideLoader();
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  showLoader();
  try {
    const locationData = await getLocation();
    state.currentCity = locationData.city || state.currentCity;
    state.currentCountry = locationData.country_name || state.currentCountry;
    state.currentLatitude = locationData.latitude || state.currentLatitude;
    state.currentLongitude = locationData.longitude || state.currentLongitude;
    state.timezone = locationData.timezone || state.timezone;

    await loadWeatherData(state.currentLatitude, state.currentLongitude);
  } catch (error) {
    console.warn(`Using default location data due to: ${error.message}`);
  } finally {
    updateLocalDateTime();
    updateLocationInfo();
    updateAllTemperatures();
    updateForecastUI();
    updateMapUI();
    updateUIForLanguage();
    hideLoader();
  }
});

export function createMainSection() {
  const mainSection = document.createElement("section");
  mainSection.className = "font-montserrat";

  const container = createContainer();
  container.append(
    createWeatherDataWrapper(),
    state.currentLatitude && state.currentLongitude
      ? createMap(state.currentLatitude, state.currentLongitude)
      : null
  );

  mainSection.appendChild(container);
  return mainSection;
}

function createWeatherDataWrapper() {
  const wrapper = document.createElement("div");

  const header = document.createElement("div");
  header.className = `
    flex flex-col
    mb-[70px]
  `;

  const location = document.createElement("div");
  location.className = `
    weather-location
    text-white font-bold text-[44px]
    uppercase
  `;

  const dateTime = document.createElement("div");
  dateTime.className = `
    weather-datetime
    text-white font-[600] text-[24px]
  `;

  header.append(location, dateTime);
  wrapper.appendChild(header);

  const currentDataWrapper = document.createElement("div");
  currentDataWrapper.className = `
    flex items-end
    gap-[35px]
    mb-[70px]
  `;

  const tempWrapper = document.createElement("div");
  tempWrapper.className = `
    flex items-end
    relative
  `;

  const tempImg = document.createElement("img");
  tempImg.className = `
    weather-icon
    absolute top-[-100px] left-1/2
    transform -translate-x-[-45%]
    z-0
  `;

  const tempElement = document.createElement("div");
  tempElement.className = `
    weather-temp
    text-white text-[306px]
    relative z-10
    leading-none
    transform -translate-y-[-15px]
    font-montserrat font-bold
    flex align-top
  `;

  state.tempElement = tempElement;

  tempWrapper.append(tempImg, tempElement);
  currentDataWrapper.append(tempWrapper, createWeatherDetails());

  wrapper.append(currentDataWrapper, createForecastBlock());

  updateWeatherInfo(location, dateTime);
  return wrapper;
}

function createWeatherDetails() {
  const detailsWrapper = document.createElement("div");
  detailsWrapper.className = `
    flex flex-col
    text-white font-bold
    uppercase text-[22px]
    leading-[37px]
  `;

  const weatherDesc = document.createElement("div");
  weatherDesc.className = "weather-desc";

  const feelsLike = document.createElement("div");
  feelsLike.className = "weather-feels-like";

  const wind = document.createElement("div");
  wind.className = "weather-wind";

  const humidity = document.createElement("div");
  humidity.className = "weather-humidity";

  detailsWrapper.append(weatherDesc, feelsLike, wind, humidity);
  return detailsWrapper;
}

export function updateWeatherInfo(locationElement, dateTimeElement) {
  if (locationElement && state.currentCity) {
    locationElement.textContent = `
      ${state.currentCity}, ${state.currentCountry || ""}
    `;
  }

  if (dateTimeElement && state.currentDate && state.currentTime) {
    dateTimeElement.textContent = `
      ${state.currentDate} • ${state.currentTime}
    `;
  }
}

export function updateLocationInfo() {
  const location = document.querySelector(".weather-location");
  const dateTime = document.querySelector(".weather-datetime");

  if (location) {
    location.textContent = `
      ${state.currentCity}, ${state.currentCountry || ""}
    `;
  }

  if (dateTime) {
    dateTime.textContent = `
      ${state.currentDate} ${state.currentTime}
    `;
  }
}

export function updateWeatherUI() {
  if (!state.currentWeather) return;

  const t = translations[state.currentLang];

  const elements = {
    temp: document.querySelector(".weather-temp"),
    icon: document.querySelector(".weather-icon"),
    desc: document.querySelector(".weather-desc"),
    feelsLike: document.querySelector(".weather-feels-like"),
    wind: document.querySelector(".weather-wind"),
    humidity: document.querySelector(".weather-humidity"),
  };

  if (elements.temp) {
    elements.temp.innerHTML = "";
    const container = document.createElement("div");
    container.className = "flex";

    let displayTemp = state.currentWeather.temp;
    if (state.temperatureUnit === "fahrenheit") {
      displayTemp = temperatureUtils.celsiusToFahrenheit(displayTemp);
    }

    const value = document.createElement("span");
    value.className = "text-[306px] leading-[0.8]";
    value.textContent = displayTemp;

    const degree = document.createElement("span");
    degree.className = `
      degree-symbol
      text-[100px] leading-[0.8]
      self-start pt-[0.2em]
    `;
    degree.textContent = "°";

    container.append(value, degree);
    elements.temp.append(container);
  }

  if (elements.icon) {
    elements.icon.src = `
      https://openweathermap.org/img/wn/${state.currentWeather.icon}@4x.png
    `;
    elements.icon.alt = state.currentWeather.description;
  }

  if (elements.desc) {
    elements.desc.textContent = state.currentWeather.description;
  }
  if (elements.feelsLike && t) {
    let feelsLikeTemp = state.currentWeather.feels_like;
    if (state.temperatureUnit === "fahrenheit") {
      feelsLikeTemp = temperatureUtils.celsiusToFahrenheit(feelsLikeTemp);
    }
    elements.feelsLike.textContent = `${t.feelsLike}: ${feelsLikeTemp}°${
      state.temperatureUnit === "celsius" ? "C" : "F"
    }`;
  }

  if (elements.wind && t) {
    elements.wind.textContent = `${t.wind}: ${state.currentWeather.wind} ${t.m_s}`;
  }

  if (elements.humidity && t) {
    elements.humidity.textContent = `${t.humidity}: ${state.currentWeather.humidity}%`;
  }
}

function createForecastBlock() {
  const block = document.createElement("div");
  const daysContainer = document.createElement("div");
  daysContainer.className = "flex gap-[55px]";

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "text-white font-montserrat";

    const name = document.createElement("div");
    name.className = `
      font-[700] text-[22px]
      forecast-day-name
      uppercase
    `;

    const tempContainer = document.createElement("div");
    tempContainer.className = "flex items-baseline";

    const temp = document.createElement("div");
    temp.className = "font-[600] text-[80px] forecast-day-temp";

    const icon = document.createElement("img");
    icon.className = `
      forecast-day-icon
      object-contain
      max-w-full max-h-[80px]
    `;
    icon.alt = "Weather icon";

    tempContainer.append(temp, icon);
    card.append(name, tempContainer);
    daysContainer.appendChild(card);
  }

  block.appendChild(daysContainer);
  return block;
}

export function updateForecastUI() {
  if (!state.forecast?.length) return;

  document.querySelectorAll(".forecast-day-name").forEach((el, i) => {
    if (state.forecast[i]) el.textContent = state.forecast[i].date;
  });

  document.querySelectorAll(".forecast-day-icon").forEach((el, i) => {
    if (state.forecast[i]) {
      el.src = `
        https://openweathermap.org/img/wn/${state.forecast[i].icon}@2x.png
      `;
      el.alt = state.forecast[i].description || "Weather icon";
    }
  });

  document.querySelectorAll(".forecast-day-temp").forEach((el, i) => {
    if (state.forecast[i]) el.textContent = `${state.forecast[i].temp}°`;
  });
  updateForecastTemperatures();
}

export function createMap(lat, lng) {
  const wrapper = document.createElement("div");
  wrapper.className = "map-wrapper w-[375px] relative";

  const container = document.createElement("div");
  container.className =
    "relative h-[375px] rounded-2xl overflow-hidden mb-[40px]";

  const mask = document.createElement("div");
  mask.className = "relative w-full h-full overflow-hidden";

  const iframe = document.createElement("iframe");
  iframe.className = `
    w-[calc(100%+90px)] h-[calc(100%+90px)]
    absolute top-[-45px] left-[-45px]
    border-0
    [&_.ymaps-2-1-79-controls__control]:hidden
    [&_.ymaps-2-1-79-copyright]:hidden
    [&_.ymaps-2-1-79-controls__toolbar]:hidden
  `;
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.src = getStaticMapUrl(lat, lng);

  mask.appendChild(iframe);
  container.appendChild(mask);
  wrapper.appendChild(container);

  const coordinates = document.createElement("div");
  coordinates.className = `
    flex flex-col items-end
    text-white font-montserrat
    font-semibold text-[20px]
    leading-[30px] mt-2
  `;

  const latRow = document.createElement("div");
  latRow.className = "flex gap-1";

  const latLabel = document.createElement("span");
  latLabel.className = "latitude-label";
  latLabel.textContent = "Latitude:";

  const latValue = document.createElement("span");
  latValue.className = "font-bold";
  latValue.textContent = `${lat.toFixed(0)}°${((lat % 1) * 60).toFixed(0)}'`;

  latRow.append(latLabel, latValue);

  const lngRow = document.createElement("div");
  lngRow.className = "flex gap-1";

  const lngLabel = document.createElement("span");
  lngLabel.className = "longitude-label";
  lngLabel.textContent = "Longitude:";

  const lngValue = document.createElement("span");
  lngValue.className = "font-bold";
  lngValue.textContent = `${lng.toFixed(0)}°${((lng % 1) * 60).toFixed(0)}'`;

  lngRow.append(lngLabel, lngValue);

  coordinates.append(latRow, lngRow);
  wrapper.appendChild(coordinates);

  return wrapper;
}

export function updateMapUI() {
  if (!state.currentLatitude || !state.currentLongitude) return;

  const wrapper = document.querySelector(".map-wrapper");
  if (!wrapper) {
    const container = document.querySelector(".flex.gap-\\[30px\\]");
    if (container) {
      container.appendChild(
        createMap(state.currentLatitude, state.currentLongitude)
      );
    }
    return;
  }

  const iframe = wrapper.querySelector("iframe");
  if (iframe) {
    iframe.src = getStaticMapUrl(state.currentLatitude, state.currentLongitude);
  }

  const latValue = wrapper.querySelector(".latitude-value");
  const lngValue = wrapper.querySelector(".longitude-value");
  if (latValue) latValue.textContent = state.currentLatitude.toFixed(4);
  if (lngValue) lngValue.textContent = state.currentLongitude.toFixed(4);
}

export function updateBackground(imageUrl) {
  const app = document.getElementById("app");
  if (!app) return;
  if (!imageUrl) {
    app.style.backgroundImage = `
      linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)
    `;
    app.className = `
      min-h-screen
      flex flex-col
    `;
    return;
  }

  const img = new Image();
  img.src = imageUrl;
  img.onload = () => {
    app.className = `
      min-h-screen
      bg-cover bg-center bg-no-repeat bg-fixed
      flex flex-col
      transition-all duration-500
    `;
    app.style.backgroundImage = `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      url("${imageUrl}")
    `;
  };
  img.onerror = () => {
    app.style.backgroundImage = `
      linear-gradient(135deg, #1e3c72 0%, #2a5298 100%)
    `;
    app.className = `
      min-h-screen
      flex flex-col
    `;
  };
}

export function updateBackgroundWithoutLoader(imageUrl) {
  const app = document.getElementById("app");
  if (!app || !imageUrl) return;

  const img = new Image();
  img.src = imageUrl;

  img.onload = () => {
    app.className = `
      min-h-screen
      bg-cover bg-center bg-no-repeat bg-fixed
      flex flex-col
      transition-all duration-500
    `;
    app.style.backgroundImage = `
      linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5)),
      url("${imageUrl}")
    `;
  };

  img.onerror = () => {
    console.error("Background image failed to load");
  };
}

export function updateAllTemperatures() {
  if (!state.currentWeather) return;
  updateWeatherUI();
  updateForecastTemperatures();
}

function updateForecastTemperatures() {
  if (!state.forecast?.length) return;

  const forecastElements = document.querySelectorAll(".forecast-day-temp");
  forecastElements.forEach((el, index) => {
    if (state.forecast[index]) {
      let temp = state.forecast[index].temp;
      if (state.temperatureUnit === "fahrenheit") {
        temp = temperatureUtils.celsiusToFahrenheit(temp);
      }
      el.textContent = `${temp}°`;
    }
  });
}
