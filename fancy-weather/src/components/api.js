export async function getLocation() {
  try {
    const url = "https://ipapi.co/json/";
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const data = await response.json();

    return {
      city: data.city || "Unknown",
      country_name: data.country_name || "Unknown",
      latitude: data.latitude || 0,
      longitude: data.longitude || 0,
      timezone: data.timezone || "UTC",
    };
  } catch (error) {
    console.error("Failed to get location by IP:", error.message);
    throw new Error("Could not determine your location");
  }
}

export async function getLocationByCity(city) {
  if (!city?.trim()) {
    throw new Error("City name cannot be empty");
  }

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Geocoding API error! Status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.results?.length) {
      throw new Error("City not found");
    }

    const [result] = data.results;

    return {
      city: result.name || city,
      country_name: result.country || "Unknown",
      latitude: result.latitude || 0,
      longitude: result.longitude || 0,
      timezone: result.timezone || "UTC",
    };
  } catch (error) {
    console.error(`Failed to geocode city "${city}":`, error.message);
    throw error;
  }
}

export async function getWeather(latitude, longitude) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates");
  }

  try {
    const apiKey = "e642079ae1bab0c72fd6413ea06a1c8b";
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Weather API error! Status: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    console.error("Failed to fetch weather data:", error.message);
    throw new Error("Could not retrieve weather information");
  }
}

export async function getWeatherForecast(latitude, longitude) {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates");
  }

  try {
    const apiKey = "e642079ae1bab0c72fd6413ea06a1c8b";
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${apiKey}&units=metric&cnt=40`;

    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Forecast API error! Status: ${response.status}`);
    }

    const data = await response.json();
    const middayForecasts = data.list
      .filter((item) => {
        const hour = new Date(item.dt * 1000).getHours();
        return hour >= 11 && hour <= 13;
      })
      .slice(0, 3);

    return middayForecasts.map((day) => ({
      date: new Date(day.dt * 1000).toLocaleDateString("en-US", {
        weekday: "long",
      }),
      temp: Math.round(day.main.temp),
      icon: day.weather[0].icon.replace("n", "d"),
      description: day.weather[0].description,
    }));
  } catch (error) {
    console.error("Failed to fetch forecast:", error.message);
    throw new Error("Could not retrieve forecast data");
  }
}

export function getStaticMapUrl(latitude, longitude, options = {}) {
  const defaultOptions = {
    zoom: 15,
    markerColor: "pm2blm",
  };

  const { zoom, markerColor } = { ...defaultOptions, ...options };

  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates for map");
  }

  return `https://yandex.ru/map-widget/v1/?ll=${longitude},${latitude}&z=${zoom}&l=map&pt=${longitude},${latitude},${markerColor}`;
}
