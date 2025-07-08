export async function getLocation() {
    const url = 'https://ipapi.co/json/';
    const res = await fetch(url);
    const data = await res.json();
    return {
        city: data.city,
        country_name: data.country_name,
        latitude: data.latitude,
        longitude: data.longitude,
        timezone: data.timezone,
    };
}

export async function getLocationByCity(city) {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(city)}&count=1`;
    const res = await fetch(url);
    const data = await res.json();
    
    if (data.results && data.results.length > 0) {
        return {
            city: data.results[0].name,
            country_name: data.results[0].country,
            latitude: data.results[0].latitude,
            longitude: data.results[0].longitude,
            timezone: data.results[0].timezone
        };
    }
    throw new Error('City not found');
}

export async function getWeather(lat, lon) {
    const apiKey = 'e642079ae1bab0c72fd6413ea06a1c8b';
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    const res = await fetch(url);
    const data = await res.json();
    return data;
}

export async function getWeatherForecast(lat, lon) {

    const apiKey = 'e642079ae1bab0c72fd6413ea06a1c8b';
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric&cnt=40`;
    
    try {
      const res = await fetch(url);
      const data = await res.json();
      
      const middayForecasts = data.list.filter(item => {
        const hour = new Date(item.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      }).slice(0, 3);
      
      return middayForecasts.map(day => ({
        date: new Date(day.dt * 1000).toLocaleDateString('en-US', { weekday: 'long' }),
        temp: Math.round(day.main.temp),
        icon: day.weather[0].icon.replace('n', 'd'),
        description: day.weather[0].description
      }));
      
    } catch (error) {
      console.error('Error fetching forecast:', error);
      throw error;
    }
}