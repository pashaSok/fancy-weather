const WEATHER_API_KEY = "e642079ae1bab0c72fd6413ea06a1c8b";
const UNSPLASH_API_KEY = "Re_IpqUhO1nW0Xy9dxV5nSYM2zYqU6dp4WUhphjNU08";

export const fetchWithErrorHandling = async (url, errorMessage) => {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error(`${errorMessage}:`, error.message);
    throw new Error(errorMessage);
  }
};

export const getLocation = async () => {
  const data = await fetchWithErrorHandling(
    "https://ipapi.co/json/",
    "Failed to get location by IP"
  );

  return {
    city: data.city || "Unknown",
    country_name: data.country_name || "Unknown",
    latitude: data.latitude || 0,
    longitude: data.longitude || 0,
    timezone: data.timezone || "UTC",
  };
};

export const getLocationByCity = async (city) => {
  if (!city?.trim()) {
    throw new Error("City name cannot be empty");
  }

  const data = await fetchWithErrorHandling(
    `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      city
    )}&count=1`,
    `Failed to geocode city "${city}"`
  );

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
};

export const getWeather = async (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates");
  }

  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric`;
  return fetchWithErrorHandling(url, "Failed to fetch weather data");
};

export const getWeatherForecast = async (latitude, longitude) => {
  if (typeof latitude !== "number" || typeof longitude !== "number") {
    throw new Error("Invalid coordinates");
  }

  try {
    const url = `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${WEATHER_API_KEY}&units=metric&cnt=40`;
    const data = await fetchWithErrorHandling(url, "Failed to fetch forecast");

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
};

export const getCityBackground = async (city, weatherCondition, timezone) => {
  const options = {
    timeZone: timezone,
    hour12: false,
    hour: "numeric",
  };

  const cityHour = parseInt(new Date().toLocaleString("en-US", options));
  let timeOfDay;

  if (cityHour >= 5 && cityHour < 12) timeOfDay = "morning";
  else if (cityHour >= 12 && cityHour < 17) timeOfDay = "day";
  else if (cityHour >= 17 && cityHour < 21) timeOfDay = "evening";
  else timeOfDay = "night";

  try {
    const query = `${city} city landscape ${weatherCondition} ${timeOfDay}`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.unsplash.com/photos/random?query=${encodedQuery}&client_id=${UNSPLASH_API_KEY}&orientation=landscape`;

    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    return data.urls.regular;
  } catch (error) {
    return null;
  }
};
