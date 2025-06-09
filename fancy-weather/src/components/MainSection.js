import { state } from '../utils/constants.js';
import { createContainer } from '../utils/container.js';
import { getLocation } from '../components/api.js';
import { updateLocalDateTime } from './Header.js';

document.addEventListener('DOMContentLoaded', async () => {
    try {
        const locationData = await getLocation();
        state.currentCity = locationData.city || state.currentCity;
        state.currentCountry = locationData.country_name || state.currentCountry;
        state.currentLatitude = locationData.latitude || state.currentLatitude;
        state.currentLongitude = locationData.longitude || state.currentLongitude;
        state.timezone = locationData.timezone || state.timezone;
    } catch (error) {
        console.warn('Using default location data due to:', error.message);
    } finally {
        updateLocalDateTime();
        updateLocationInfo();
    }
});

export function createMainSection() {
    const mainSection = document.createElement('section');
    
    const container = createContainer();
    
    const weatherDataWrapper = createWeatherDataWrapper();
    container.appendChild(weatherDataWrapper);
    
    mainSection.appendChild(container);
    
    return mainSection;
}

function createWeatherDataWrapper() {
    const weatherDataWrapper = document.createElement('div');
    
    const weatherDataHeader = document.createElement('div');
    weatherDataHeader.className = 'flex flex-col gap-1';
    
    const weatherDataLocation = document.createElement('div');
    weatherDataLocation.className = 'weather-location text-white font-bold text-4xl uppercase';
    
    const weatherDateTime = document.createElement('div');
    weatherDateTime.className = 'weather-datetime text-white font-semibold text-2xl';
    
    weatherDataHeader.appendChild(weatherDataLocation);
    weatherDataHeader.appendChild(weatherDateTime);
    weatherDataWrapper.appendChild(weatherDataHeader);
    
    updateWeatherInfo(weatherDataLocation, weatherDateTime);
    
    return weatherDataWrapper;
}

function updateWeatherInfo(locationElement, dateTimeElement) {
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