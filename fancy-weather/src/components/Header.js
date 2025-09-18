import { svgNamespace } from "../utils/constants.js";
import { createContainer } from "../utils/container.js";
import { translations } from "../utils/translations.js";
import { getState, updateState, convertTemperature } from "../utils/state.js";
import {
  updateUIForLanguage,
  updateAllWeatherData,
  updateLocationInfo,
  updateWeatherUI,
  updateForecastUI,
  updateForecastDayNames,
} from "../utils/ui-updater.js";
import { showErrorPopup } from "./popup.js";
import { getWeather, getCityBackground } from "../utils/api-utils.js";
import { weatherApp } from "../services/app-init.js";

export async function updateCurrentData(cityName) {
  if (!cityName?.trim()) return;

  try {
    await weatherApp.loadWeatherData(cityName);
    updateAllWeatherData();

    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) searchInput.value = "";
  } catch (error) {
    if (error.message.includes("errorCityNotFound")) {
      showErrorPopup("errorWeatherUnavailable");
    } else {
      showErrorPopup("errorRefreshFailed");
    }

    const searchInput = document.querySelector('input[type="text"]');
    if (searchInput) {
      searchInput.value = "";
      searchInput.focus();
    }
  }
}

export function createHeader() {
  const header = document.createElement("header");
  header.className = "pt-10 mb-[57px] font-montserrat";

  const container = createContainer();
  container.append(createHeaderButtons(), createSearchInput());

  header.appendChild(container);
  return header;
}

function createHeaderButtons() {
  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center gap-2.5 m-0 header-button-wrapper";

  wrapper.append(
    createRefreshButton(),
    createLanguageSelector(),
    createTemperatureToggle()
  );

  return wrapper;
}

function createRefreshButton() {
  const button = document.createElement("button");
  button.className = `
    w-11 h-11 bg-[#868D96]/50 bg-center size-12
    hover:cursor-pointer relative rounded-md bg-blend-color-burn
  `;
  button.style.backgroundImage = 'url("./assets/refresh.jpg")';

  const spinner = document.createElementNS(svgNamespace, "svg");
  spinner.setAttribute(
    "class",
    `
    w-5 h-5 absolute top-1/2 left-1/2
    transform -translate-x-1/2 -translate-y-1/2
  `
  );
  spinner.setAttribute("viewBox", "0 0 24 24");
  spinner.setAttribute("fill", "none");

  const path = document.createElementNS(svgNamespace, "path");
  path.setAttribute(
    "d",
    "M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916"
  );
  path.setAttribute("stroke", "#fff");
  path.setAttribute("stroke-width", "2");
  path.setAttribute("stroke-linecap", "round");
  path.setAttribute("stroke-linejoin", "round");

  spinner.appendChild(path);
  button.appendChild(spinner);

  button.onclick = async function () {
    spinner.classList.add("animate-spin");
    try {
      const state = getState();
      if (!state.currentLatitude || !state.currentLongitude) {
        throw new Error("Coordinates not available");
      }
      const weatherData = await getWeather(
        state.currentLatitude,
        state.currentLongitude
      );

      if (!weatherData?.weather?.[0]) {
        throw new Error("Invalid weather data");
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
      });
      const bgUrl = await getCityBackground(
        state.currentCity,
        weatherData.weather[0].main,
        state.timezone
      );

      weatherApp.updateBackground(bgUrl);

      updateLocationInfo();
      updateWeatherUI();
      updateForecastUI();
    } catch (error) {
      console.error("Refresh failed:", error);
      showErrorPopup("Failed to refresh weather data");
    } finally {
      setTimeout(() => {
        spinner.classList.remove("animate-spin");
      }, 500);
    }
  };

  return button;
}

function createLanguageSelector() {
  const selector = document.createElement("div");
  selector.className = `
    relative flex items-center justify-center
    w-20 h-[44px] bg-[#868D96]/50 rounded-md
    cursor-pointer gap-3
  `;

  const state = getState();
  const button = document.createElement("button");
  button.textContent = state.currentLang + " ";
  button.className = `
    flex items-center justify-center
    uppercase text-white text-sm font-bold
    cursor-pointer
  `;

  const arrow = document.createElementNS(svgNamespace, "svg");
  arrow.setAttribute("class", "w-2 h-1 opacity-40");
  arrow.setAttribute("viewBox", "0 0 10 5");
  arrow.setAttribute("fill", "none");
  arrow.innerHTML = `
    <path fill-rule="evenodd" clip-rule="evenodd"
      d="M4.84162 3.75747L8.62642 0L9.68323 1.0645L4.84162 5.87114L0 1.0645L1.05681 3.57628e-07L4.84162 3.75747Z"
      stroke="#fff"
    />
  `;

  const menu = document.createElement("div");
  menu.className = `
    absolute top-[100%] left-0 w-20 overflow-hidden
    transition-all duration-300 ease-in-out slide-up
  `;
  menu.setAttribute("role", "menu");
  menu.setAttribute("aria-orientation", "vertical");

  ["en", "ru", "be"].forEach((lang) => {
    const item = document.createElement("a");
    item.href = "#";
    item.textContent = lang;
    item.className = `
      flex items-center justify-center bg-[#4C5255]/50
      hover:bg-[#4C5255]/25 h-11 uppercase text-white
      font-bold last:rounded-b-md
    `;
    item.setAttribute("role", "menuitem");

    item.addEventListener("click", (event) => {
      event.preventDefault();
      updateState({ currentLang: lang });

      button.textContent = lang;

      menu.classList.remove("slide-down");
      menu.classList.add("slide-up");
      selector.classList.remove("rounded-b-md");

      updateUIForLanguage();
      updateForecastDayNames();

      event.stopPropagation();
    });
    menu.appendChild(item);
  });

  selector.append(button, arrow, menu);

  selector.addEventListener("click", (event) => {
    event.stopPropagation();
    const isMenuOpen = menu.classList.contains("slide-down");
    if (isMenuOpen) {
      menu.classList.remove("slide-down");
      menu.classList.add("slide-up");
      selector.classList.remove("rounded-b-md");
    } else {
      menu.classList.remove("slide-up");
      menu.classList.add("slide-down");
      selector.classList.add("rounded-b-md");
    }
  });

  document.addEventListener("click", (event) => {
    if (!selector.contains(event.target)) {
      menu.classList.remove("slide-down");
      menu.classList.add("slide-up");
      selector.classList.remove("rounded-b-md");
    }
  });

  return selector;
}

function createTemperatureToggle() {
  const toggle = document.createElement("div");
  toggle.className = `
    w-[88px] h-11 flex items-center
    bg-[#868D96]/50 text-white rounded-md
    cursor-pointer transition-opacity duration-300
    font-bold text-[14px]
  `;
  const updateToggleAppearance = () => {
    const state = getState();

    const fahrenheit = toggle.querySelector("div:first-child");
    const celsius = toggle.querySelector("div:last-child");

    if (state.temperatureUnit === "fahrenheit") {
      fahrenheit.classList.add("opacity-100", "bg-[#4C5255]/50");
      fahrenheit.classList.remove("opacity-25");
      celsius.classList.remove("opacity-100", "bg-[#4C5255]/50");
      celsius.classList.add("opacity-25");
    } else {
      celsius.classList.add("opacity-100", "bg-[#4C5255]/50");
      celsius.classList.remove("opacity-25");
      fahrenheit.classList.remove("opacity-100", "bg-[#4C5255]/50");
      fahrenheit.classList.add("opacity-25");
    }
  };

  const fahrenheit = document.createElement("div");
  fahrenheit.textContent = "°F";
  fahrenheit.className = `
    w-full flex items-center justify-center
    h-full rounded-l-md
    transition-all duration-300
  `;

  const celsius = document.createElement("div");
  celsius.textContent = "°C";
  celsius.className = `
    w-full h-full flex items-center justify-center
    rounded-r-md transition-all duration-300
  `;

  toggle.append(fahrenheit, celsius);

  updateToggleAppearance();

  toggle.addEventListener("click", () => {
    const state = getState();
    const newUnit =
      state.temperatureUnit === "celsius" ? "fahrenheit" : "celsius";

    updateState({ temperatureUnit: newUnit });
    updateToggleAppearance();
    updateAllWeatherData();
  });

  return toggle;
}

function createSearchInput() {
  const state = getState();
  const t = translations[state.currentLang];

  const wrapper = document.createElement("div");
  wrapper.className = "flex items-center w-[375px] rounded-lg";

  const inputContainer = document.createElement("div");
  inputContainer.className = `
    relative flex-grow rounded-l-lg h-11 box-border
    flex items-center justify-between bg-[#868D96]/50
    border border-[#6F7884]/50
  `;

  const input = document.createElement("input");
  input.type = "text";
  input.placeholder = t.searchPlaceholder;
  input.className = `
    px-[15px] rounded-l-lg text-[14px] focus:outline-none
    w-full h-full text-white placeholder-white
    placeholder-opacity-70
  `;

  input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") {
      updateCurrentData(input.value);
    }
  });

  const micButton = document.createElement("button");
  micButton.type = "button";
  micButton.className = `
    absolute right-2 top-1/2 transform -translate-y-1/2
    text-[#848c95] transition-all duration-300
    hover:text-[#848c95]/50 focus:outline-none cursor-pointer
  `;
  micButton.innerHTML = `
    <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
      <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
    </svg>
  `;

  inputContainer.append(input, micButton);

  const searchButton = document.createElement("button");
  searchButton.type = "button";
  searchButton.className = `
    h-11 w-[101px] bg-[#848c95] text-[14px]
    font-bold uppercase rounded-r-lg text-white
    hover:bg-[#5a6268] transition-colors duration-200
    flex items-center justify-center cursor-pointer search-button
  `;
  searchButton.textContent = t.searchButton;

  searchButton.addEventListener("click", () => {
    updateCurrentData(input.value);
  });

  wrapper.append(inputContainer, searchButton);
  return wrapper;
}
