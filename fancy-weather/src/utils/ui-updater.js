import {
  getState,
  updateState,
  convertTemperature,
  getTemperatureSymbol,
  clearTimeInterval,
} from "./state.js";
import { translations } from "./translations.js";
import { getStaticMapUrl } from "../components/api.js";

let mapInitialized = false;

export const updateAllWeatherData = () => {
  updateLocationInfo();
  updateWeatherUI();
  updateForecastUI();
  updateDateTime();
};

export const updateLocationInfo = () => {
  const state = getState();
  const locationElement = document.querySelector(".weather-location");
  const dateTimeElement = document.querySelector(".weather-datetime");

  if (locationElement) {
    locationElement.textContent = `${state.currentCity}, ${
      state.currentCountry || ""
    }`;
  }

  if (dateTimeElement && state.currentDate && state.currentTime) {
    dateTimeElement.textContent = `${state.currentDate} • ${state.currentTime}`;
  }
};

export const updateWeatherUI = () => {
  const state = getState();
  const t = translations[state.currentLang];

  if (!state.currentWeather) return;

  const elements = {
    temp: document.querySelector(".weather-temp"),
    icon: document.querySelector(".weather-icon"),
    desc: document.querySelector(".weather-desc"),
    feelsLike: document.querySelector(".weather-feels-like"),
    wind: document.querySelector(".weather-wind"),
    humidity: document.querySelector(".weather-humidity"),
  };

  if (elements.temp) {
    const displayTemp = convertTemperature(state.currentWeather.temp);
    elements.temp.textContent = "";

    const container = document.createElement("div");
    container.className = "flex";

    const valueSpan = document.createElement("span");
    valueSpan.className = "text-[306px] leading-[0.8]";
    valueSpan.textContent = displayTemp;

    const degreeSpan = document.createElement("span");
    degreeSpan.className =
      "degree-symbol text-[100px] leading-[0.8] self-start pt-[0.2em]";
    degreeSpan.textContent = "°";

    container.appendChild(valueSpan);
    container.appendChild(degreeSpan);
    elements.temp.appendChild(container);
  }

  if (elements.icon) {
    elements.icon.src = `https://openweathermap.org/img/wn/${state.currentWeather.icon}@4x.png`;
    elements.icon.alt = state.currentWeather.description;
  }

  if (elements.desc) {
    elements.desc.textContent = state.currentWeather.description;
  }

  if (elements.feelsLike && t) {
    const feelsLikeTemp = convertTemperature(state.currentWeather.feels_like);
    elements.feelsLike.textContent = `${
      t.feelsLike
    }: ${feelsLikeTemp}°${getTemperatureSymbol()}`;
  }

  if (elements.wind && t) {
    elements.wind.textContent = `${t.wind}: ${state.currentWeather.wind} ${t.m_s}`;
  }

  if (elements.humidity && t) {
    elements.humidity.textContent = `${t.humidity}: ${state.currentWeather.humidity}%`;
  }
};

export const updateForecastUI = () => {
  const state = getState();
  if (!state.forecast?.length) return;

  document.querySelectorAll(".forecast-day-name").forEach((el, i) => {
    if (state.forecast[i]) el.textContent = state.forecast[i].date;
  });

  document.querySelectorAll(".forecast-day-icon").forEach((el, i) => {
    if (state.forecast[i]) {
      el.src = `https://openweathermap.org/img/wn/${state.forecast[i].icon}@2x.png`;
      el.alt = state.forecast[i].description || "Weather icon";
    }
  });

  updateForecastTemperatures();
};

export const updateForecastTemperatures = () => {
  const state = getState();
  if (!state.forecast?.length) return;

  document.querySelectorAll(".forecast-day-temp").forEach((el, i) => {
    if (state.forecast[i]) {
      let temp = state.forecast[i].temp;
      if (state.temperatureUnit === "fahrenheit") {
        temp = convertTemperature(temp);
      }
      el.textContent = `${temp}°`;
    }
  });
};

export const updateTemperaturesOnly = () => {
  updateWeatherUI();
  updateForecastTemperatures();
};

export const updateMapUI = () => {
  const state = getState();
  if (!state.currentLatitude || !state.currentLongitude) return;

  const wrapper = document.querySelector(".map-wrapper");

  if (!wrapper) {
    const container = document.querySelector(".flex.gap-\\[30px\\]");
    if (container) {
      container.appendChild(
        createMap(state.currentLatitude, state.currentLongitude)
      );
      mapInitialized = true;
    }
    return;
  }

  const iframe = wrapper.querySelector("iframe");
  if (iframe) {
    const currentSrc = iframe.src;
    const newSrc = getStaticMapUrl(
      state.currentLatitude,
      state.currentLongitude
    );

    if (currentSrc !== newSrc) {
      iframe.src = newSrc;
    }
  }
};

export const createMap = (lat, lng) => {
  const wrapper = document.createElement("div");
  wrapper.className = "map-wrapper w-[375px] relative";

  const container = document.createElement("div");
  container.className =
    "relative h-[375px] rounded-2xl overflow-hidden mb-[40px]";

  const mask = document.createElement("div");
  mask.className = "relative w-full h-full overflow-hidden";

  const iframe = document.createElement("iframe");
  iframe.className =
    "w-[calc(100%+90px)] h-[calc(100%+90px)] absolute top-[-45px] left-[-45px] border-0 [&_.ymaps-2-1-79-controls__control]:hidden [&_.ymaps-2-1-79-copyright]:hidden [&_.ymaps-2-1-79-controls__toolbar]:hidden";
  iframe.loading = "lazy";
  iframe.referrerPolicy = "no-referrer-when-downgrade";
  iframe.src = getStaticMapUrl(lat, lng);

  mask.appendChild(iframe);
  container.appendChild(mask);
  wrapper.appendChild(container);

  const state = getState();
  const t = translations[state.currentLang];

  const coordinates = document.createElement("div");
  coordinates.className =
    "flex flex-col items-end text-white font-montserrat font-semibold text-[20px] leading-[30px] mt-2";

  const latRow = document.createElement("div");
  latRow.className = "flex gap-1";

  const latLabel = document.createElement("span");
  latLabel.className = "latitude-label";
  latLabel.textContent = t.latitude + ":";

  const latValue = document.createElement("span");
  latValue.className = "font-bold";
  latValue.textContent = `${lat.toFixed(0)}°${((lat % 1) * 60).toFixed(0)}'`;

  latRow.appendChild(latLabel);
  latRow.appendChild(latValue);

  const lngRow = document.createElement("div");
  lngRow.className = "flex gap-1";

  const lngLabel = document.createElement("span");
  lngLabel.className = "longitude-label";
  lngLabel.textContent = t.longitude + ":";

  const lngValue = document.createElement("span");
  lngValue.className = "font-bold";
  lngValue.textContent = `${lng.toFixed(0)}°${((lng % 1) * 60).toFixed(0)}'`;

  lngRow.appendChild(lngLabel);
  lngRow.appendChild(lngValue);

  coordinates.appendChild(latRow);
  coordinates.appendChild(lngRow);
  wrapper.appendChild(coordinates);

  return wrapper;
};

export const updateDateTime = () => {
  const state = getState();
  clearTimeInterval();

  const updateTime = () => {
    if (state.timezone) {
      const now = new Date();
      const options = {
        timeZone: state.timezone,
        weekday: "short",
        day: "numeric",
        month: "long",
        hour: "2-digit",
        minute: "2-digit",
        hour12: false,
      };

      const formatter = new Intl.DateTimeFormat(state.currentLang, options);
      const parts = formatter.formatToParts(now);

      updateState({
        currentDate: `${parts.find((p) => p.type === "weekday").value}, ${
          parts.find((p) => p.type === "day").value
        } ${parts.find((p) => p.type === "month").value}`,
        currentTime: `${parts
          .find((p) => p.type === "hour")
          .value.padStart(2, "0")}:${parts
          .find((p) => p.type === "minute")
          .value.padStart(2, "0")}`,
      });

      updateLocationInfo();
    }
  };

  updateTime();
  const now = new Date();
  const secondsUntilNextMinute = 60 - now.getSeconds();

  const interval = setTimeout(() => {
    updateTime();
    updateState({
      timeUpdateInterval: setInterval(updateTime, 60000),
    });
  }, secondsUntilNextMinute * 1000);
};

export const updateUIForLanguage = () => {
  const state = getState();
  const t = translations[state.currentLang];
  if (!t) return;

  const searchInput = document.querySelector('input[type="text"]');
  const searchButton = document.querySelector(".search-button");
  if (searchInput) searchInput.placeholder = t.searchPlaceholder;
  if (searchButton) searchButton.textContent = t.searchButton;

  updateWeatherUI();
  updateDateTime();
  updateMapTexts();
};

export const updateMapTexts = () => {
  const state = getState();
  const t = translations[state.currentLang];
  if (!t) return;

  const latLabels = document.querySelectorAll(".latitude-label");
  const lngLabels = document.querySelectorAll(".longitude-label");

  latLabels.forEach((label) => {
    label.textContent = t.latitude + ":";
  });

  lngLabels.forEach((label) => {
    label.textContent = t.longitude + ":";
  });
};

export const updateMapOnCityChange = (newLat, newLng) => {
  const wrapper = document.querySelector(".map-wrapper");

  updateState({
    currentLatitude: newLat,
    currentLongitude: newLng,
  });

  if (wrapper) {
    const iframe = wrapper.querySelector("iframe");
    if (iframe) {
      iframe.src = getStaticMapUrl(newLat, newLng);
    }

    const latValue = wrapper.querySelector(".font-bold:first-child");
    const lngValue = wrapper.querySelector(".font-bold:last-child");

    if (latValue) {
      latValue.textContent = `${newLat.toFixed(0)}°${(
        (newLat % 1) *
        60
      ).toFixed(0)}'`;
    }
    if (lngValue) {
      lngValue.textContent = `${newLng.toFixed(0)}°${(
        (newLng % 1) *
        60
      ).toFixed(0)}'`;
    }
  } else {
    const container = document.querySelector(".flex.gap-\\[30px\\]");
    if (container) {
      container.appendChild(createMap(newLat, newLng));
      mapInitialized = true;
    }
  }
};
export const initializeMap = () => {
  const state = getState();
  if (state.currentLatitude && state.currentLongitude && !mapInitialized) {
    updateMapUI();
    mapInitialized = true;
  }
};
