import { state } from '../utils/constants.js';
import { createContainer } from '../utils/container.js';
import { updateLocalDateTime } from './Header.js';
import { getLocation, getLocationByCity, getWeather, getWeatherForecast } from '../components/api.js';

export async function loadWeatherData(latitude, longitude, cityName = null) {
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
        getWeatherForecast(state.currentLatitude, state.currentLongitude)
      ]);
      
      if (weatherData) {
        state.currentWeather = {
          temp: Math.round(weatherData.main.temp),
          feels_like: Math.round(weatherData.main.feels_like),
          humidity: weatherData.main.humidity,
          wind: Math.round(weatherData.wind.speed),
          icon: weatherData.weather[0].icon,
          description: weatherData.weather[0].description
        };
      }
      
      state.forecast = forecastData || [];
      return true;
    } catch (error) {
      console.error('Failed to load weather data:', error);
      throw error;
    }
}

document.addEventListener('DOMContentLoaded', async () => {
    try {
      const locationData = await getLocation();
      state.currentCity = locationData.city || state.currentCity;
      state.currentCountry = locationData.country_name || state.currentCountry;
      state.currentLatitude = locationData.latitude || state.currentLatitude;
      state.currentLongitude = locationData.longitude || state.currentLongitude;
      state.timezone = locationData.timezone || state.timezone;
      
      await loadWeatherData(state.currentLatitude, state.currentLongitude);
    } catch (error) {
      console.warn('Using default location data due to:', error.message);
    } finally {
      updateLocalDateTime();
      updateLocationInfo();
      updateWeatherUI();
      updateForecastUI();
    }
  });

export function createMainSection() {
    const mainSection = document.createElement('section');
    mainSection.classList = 'font-montserrat'
    
    const container = createContainer();
    
    const weatherDataWrapper = createWeatherDataWrapper();
    container.appendChild(weatherDataWrapper);
    
    mainSection.appendChild(container);
    
    return mainSection;
}

function createWeatherDataWrapper() {
    const weatherDataWrapper = document.createElement('div');
    
    const weatherDataHeader = document.createElement('div');
    weatherDataHeader.className = 'flex flex-col mb-[70px]';
    
    const weatherDataLocation = document.createElement('div');
    weatherDataLocation.className = 'weather-location text-white font-bold text-[44px] uppercase';
    
    const weatherDateTime = document.createElement('div');
    weatherDateTime.className = 'weather-datetime text-white font-[600] text-[24px]';
    
    weatherDataHeader.appendChild(weatherDataLocation);
    weatherDataHeader.appendChild(weatherDateTime);
    weatherDataWrapper.appendChild(weatherDataHeader);

    const weatherCurrentDataWrapper = document.createElement('div');
    weatherCurrentDataWrapper.className = 'flex items-end gap-[35px] mb-[70px]';
    
    const currentTemperatureWrapper = document.createElement('div');
    currentTemperatureWrapper.className = 'flex items-end relative';
    
    const currentTemperatureImg = document.createElement('img');
    currentTemperatureImg.className = 'weather-icon absolute top-[-100px] left-1/2 transform -translate-x-[-45%] z-0';
    
    const currentTemperature = document.createElement('div');
    currentTemperature.className = 'weather-temp text-white text-[306px] relative z-10 leading-none transform -translate-y-[-15px] font-montserrat font-bold flex align-top';
    currentTemperatureWrapper.appendChild(currentTemperatureImg);
    currentTemperatureWrapper.appendChild(currentTemperature);
    
    const weatherDetailsWrapper = document.createElement('div');
    weatherDetailsWrapper.className = 'flex flex-col text-white font-bold uppercase text-[22px] leading-[37px]';

    const currentWeatherStatus = document.createElement('div');
    currentWeatherStatus.className = 'weather-desc';

    const currentFeelsLike = document.createElement('div');
    currentFeelsLike.className = 'weather-feels-like';

    const currentWind = document.createElement('div');
    currentWind.className = 'weather-wind';

    const currentHumidity = document.createElement('div');
    currentHumidity.className = 'weather-humidity';
    
    weatherDetailsWrapper.appendChild(currentWeatherStatus);
    weatherDetailsWrapper.appendChild(currentFeelsLike);
    weatherDetailsWrapper.appendChild(currentWind);
    weatherDetailsWrapper.appendChild(currentHumidity);
    
    weatherCurrentDataWrapper.appendChild(currentTemperatureWrapper);
    weatherCurrentDataWrapper.appendChild(weatherDetailsWrapper);
    weatherDataWrapper.appendChild(weatherCurrentDataWrapper);
    

    const forecastBlock = createForecastBlock();
    weatherDataWrapper.appendChild(forecastBlock);

    updateWeatherInfo(weatherDataLocation, weatherDateTime);
    
    return weatherDataWrapper;
}

export function updateWeatherInfo(locationElement, dateTimeElement) {
    if (locationElement && state.currentCity) {
        locationElement.innerText = `${state.currentCity}, ${state.currentCountry || ''}`;
    }
    if (dateTimeElement && state.currentDate && state.currentTime) {
        dateTimeElement.innerText = `${state.currentDate} • ${state.currentTime}`;
    }
}

export function updateLocationInfo() {
    const weatherDataLocation = document.querySelector('.weather-location');
    const weatherDateTime = document.querySelector('.weather-datetime');
    weatherDataLocation.textContent = `${state.currentCity}, ${state.currentCountry || ''}`;
    weatherDateTime.textContent = `${state.currentDate} ${state.currentTime}`;
}

export function updateWeatherUI() {
    if (!state.currentWeather) return;
    
    const currentTemperature = document.querySelector('.weather-temp');
    const currentTemperatureImg = document.querySelector('.weather-icon');
    const currentWeatherStatus = document.querySelector('.weather-desc');
    const currentFeelsLike = document.querySelector('.weather-feels-like');
    const currentWind = document.querySelector('.weather-wind');
    const currentHumidity = document.querySelector('.weather-humidity');

 
    if (currentTemperature) {
        currentTemperature.innerHTML = '';
        const tempContainer = document.createElement('div');
        tempContainer.className = 'flex';
        const tempValue = document.createElement('span');
        tempValue.className = 'text-[306px] leading-[0.8]';
        tempValue.textContent = state.currentWeather.temp;
        const degreeSymbol = document.createElement('span');
        degreeSymbol.className = 'degree-symbol text-[100px] leading-[0.8] self-start pt-[0.2em]';
        degreeSymbol.textContent = '°';
        tempContainer.appendChild(tempValue);
        tempContainer.appendChild(degreeSymbol);
        currentTemperature.appendChild(tempContainer);
        currentTemperature.className = 'weather-temp text-white relative z-10 font-montserrat font-bold';
    }

    if (currentTemperatureImg) {
        currentTemperatureImg.src = `https://openweathermap.org/img/wn/${state.currentWeather.icon}@4x.png`;
        currentTemperatureImg.alt = state.currentWeather.description;
    }
    if (currentWeatherStatus) {
        currentWeatherStatus.textContent = state.currentWeather.description;
    }
    if (currentFeelsLike) {
        currentFeelsLike.textContent = `Feels like: ${state.currentWeather.feels_like}°C`;
    }
    if (currentWind) {
        currentWind.textContent = `Wind: ${state.currentWeather.wind} m/s`;
    }
    if (currentHumidity) {
        currentHumidity.textContent = `Humidity: ${state.currentWeather.humidity}%`;
    }
}


function createForecastBlock() {
  const forecastBlock = document.createElement('div');
  const daysContainer = document.createElement('div');
  daysContainer.className = 'flex gap-[55px]';
  for (let i = 0; i < 3; i++) {
    const dayCard = document.createElement('div');
    dayCard.className = 'text-white font-montserrat';
        
    const dayName = document.createElement('div');
    dayName.className = 'font-[700] text-[22px] forecast-day-name uppercase';
        
    const iconTempContainer = document.createElement('div');
    iconTempContainer.className = 'flex items-baseline'
    const dayTemp = document.createElement('div');
    dayTemp.className = 'font-[600] text-[80px] forecast-day-temp ';
        

    const dayIcon = document.createElement('img');
    dayIcon.className = 'forecast-day-icon object-contain max-w-full max-h-[80px]';
    dayIcon.alt = 'Weather icon';

    iconTempContainer.append(dayTemp,dayIcon);
    dayCard.append(dayName, iconTempContainer);
    daysContainer.appendChild(dayCard);
  }

  forecastBlock.appendChild(daysContainer);
  return forecastBlock;
}

export function updateForecastUI() {
    if (!state.forecast || !state.forecast.length) return;
    
    const dayNames = document.querySelectorAll('.forecast-day-name');
    const dayIcons = document.querySelectorAll('.forecast-day-icon');
    const dayTemps = document.querySelectorAll('.forecast-day-temp');
    
    state.forecast.forEach((day, index) => {
        if (dayNames[index]) dayNames[index].textContent = day.date;
        if (dayIcons[index]) {
            dayIcons[index].src = `https://openweathermap.org/img/wn/${day.icon}@2x.png`;
            dayIcons[index].alt = day.description || 'Weather icon';
        }
        if (dayTemps[index]) dayTemps[index].textContent = `${day.temp}°`;
    });
}