import { createContainer } from "../utils/container.js";
import { createMap, updateAllWeatherData } from "../utils/ui-updater.js";

export function createMainSection() {
  const mainSection = document.createElement("section");
  mainSection.className = "font-montserrat";

  const container = createContainer();
  container.append(createWeatherDataWrapper(), createMap(53.9, 27.5667));

  mainSection.appendChild(container);
  return mainSection;
}

function createWeatherDataWrapper() {
  const wrapper = document.createElement("div");

  const header = document.createElement("div");
  header.className = "flex flex-col mb-[70px]";

  const location = document.createElement("div");
  location.className =
    "weather-location text-white font-bold text-[44px] uppercase";

  const dateTime = document.createElement("div");
  dateTime.className = "weather-datetime text-white font-[600] text-[24px]";

  header.append(location, dateTime);
  wrapper.appendChild(header);

  const currentDataWrapper = document.createElement("div");
  currentDataWrapper.className = "flex items-end gap-[35px] mb-[70px]";

  const tempWrapper = document.createElement("div");
  tempWrapper.className = "flex items-end relative";

  const tempImg = document.createElement("img");
  tempImg.className =
    "weather-icon absolute top-[-100px] left-1/2 transform -translate-x-[-45%] z-0";

  const tempElement = document.createElement("div");
  tempElement.className =
    "weather-temp text-white text-[306px] relative z-10 leading-none transform -translate-y-[-15px] font-montserrat font-bold flex align-top";

  tempWrapper.append(tempImg, tempElement);
  currentDataWrapper.append(tempWrapper, createWeatherDetails());

  wrapper.append(currentDataWrapper, createForecastBlock());

  return wrapper;
}

function createWeatherDetails() {
  const detailsWrapper = document.createElement("div");
  detailsWrapper.className =
    "flex flex-col text-white font-bold uppercase text-[22px] leading-[37px]";

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

function createForecastBlock() {
  const block = document.createElement("div");
  const daysContainer = document.createElement("div");
  daysContainer.className = "flex gap-[55px]";

  for (let i = 0; i < 3; i++) {
    const card = document.createElement("div");
    card.className = "text-white font-montserrat";

    const name = document.createElement("div");
    name.className = "font-[700] text-[22px] forecast-day-name uppercase";

    const tempContainer = document.createElement("div");
    tempContainer.className = "flex items-baseline";

    const temp = document.createElement("div");
    temp.className = "font-[600] text-[80px] forecast-day-temp";

    const icon = document.createElement("img");
    icon.className = "forecast-day-icon object-contain max-w-full max-h-[80px]";
    icon.alt = "Weather icon";

    tempContainer.append(temp, icon);
    card.append(name, tempContainer);
    daysContainer.appendChild(card);
  }

  block.appendChild(daysContainer);
  return block;
}
