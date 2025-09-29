const WEATHER_API_KEY = "e642079ae1bab0c72fd6413ea06a1c8b";
const UNSPLASH_API_KEY = "Re_IpqUhO1nW0Xy9dxV5nSYM2zYqU6dp4WUhphjNU08";

export const fetchWithErrorHandling = async (
  url,
  errorMessage,
  options = {}
) => {
  try {
    const response = await fetch(url, options);
    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    throw new Error(errorMessage);
  }
};

export const getLocation = async (lang = "en") => {
  try {
    const ipData = await fetchWithErrorHandling(
      "https://ipapi.co/json/",
      "Failed to get location by IP"
    );

    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${ipData.latitude}&lon=${ipData.longitude}&accept-language=${lang}`;

    const nominatimData = await fetchWithErrorHandling(
      nominatimUrl,
      "Failed to get localized location name",
      {
        headers: {
          "Accept-Language": `${lang},en;q=0.5`,
        },
      }
    );

    let city = ipData.city || "Minsk";
    let country = ipData.country_name || "Belarus";

    if (nominatimData.address) {
      if (nominatimData.address.city) {
        city = nominatimData.address.city;
      } else if (nominatimData.address.town) {
        city = nominatimData.address.town;
      } else if (nominatimData.address.village) {
        city = nominatimData.address.village;
      }

      if (nominatimData.address.country) {
        country = nominatimData.address.country;
      }
    }

    return {
      city: city,
      country_name: country,
      latitude: ipData.latitude || 53.9,
      longitude: ipData.longitude || 27.5667,
      timezone: ipData.timezone || "Europe/Minsk",
    };
  } catch (error) {
    return {
      city: "Minsk",
      country_name: "Belarus",
      latitude: 53.9,
      longitude: 27.5667,
      timezone: "Europe/Minsk",
    };
  }
};

export const getLocationByCity = async (city, lang = "en") => {
  if (!city?.trim()) {
    throw new Error("City name cannot be empty");
  }

  try {
    const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
      city
    )}&limit=1`;

    const data = await fetchWithErrorHandling(
      url,
      `Failed to geocode city "${city}"`,
      {
        headers: {
          "Accept-Language": `${lang},en;q=0.5`,
        },
      }
    );

    if (!data.length) {
      throw new Error("City not found");
    }

    const result = data[0];

    let localizedCity = city;
    let localizedCountry = "Unknown";

    if (result.display_name) {
      const parts = result.display_name.split(",");

      if (parts.length > 0) {
        localizedCity = parts[0].trim();
      }

      if (parts.length > 1) {
        localizedCountry = parts[parts.length - 1].trim();
        if (localizedCountry.length > 30) {
          for (let i = parts.length - 2; i >= 0; i--) {
            const part = parts[i].trim();
            if (part.length > 2 && part.length < 30) {
              localizedCountry = part;
              break;
            }
          }
        }
      }
    }

    if (localizedCountry === "Unknown") {
      throw new Error("Please enter a city name, not a country");
    }

    let timezone = "UTC";
    try {
      timezone = await getTimezoneByCoordinates(result.lat, result.lon);
    } catch (tzError) {}

    return {
      city: localizedCity,
      country_name: localizedCountry,
      latitude: parseFloat(result.lat) || 0,
      longitude: parseFloat(result.lon) || 0,
      timezone: timezone,
    };
  } catch (error) {
    throw error;
  }
};

export const getTimezoneByCoordinates = async (lat, lng) => {
  try {
    const offset = Math.round(lng / 15);
    const timezones = {
      "-12": "Pacific/Midway",
      "-11": "Pacific/Pago_Pago",
      "-10": "Pacific/Honolulu",
      "-9": "America/Anchorage",
      "-8": "America/Los_Angeles",
      "-7": "America/Denver",
      "-6": "America/Chicago",
      "-5": "America/New_York",
      "-4": "America/Caracas",
      "-3": "America/Sao_Paulo",
      "-2": "America/Noronha",
      "-1": "Atlantic/Azores",
      0: "Europe/London",
      1: "Europe/Paris",
      2: "Europe/Helsinki",
      3: "Europe/Moscow",
      4: "Asia/Dubai",
      5: "Asia/Karachi",
      6: "Asia/Dhaka",
      7: "Asia/Bangkok",
      8: "Asia/Shanghai",
      9: "Asia/Tokyo",
      10: "Australia/Sydney",
      11: "Pacific/Noumea",
      12: "Pacific/Auckland",
    };

    return timezones[offset] || "UTC";
  } catch (error) {
    return "UTC";
  }
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
      date: new Date(day.dt * 1000),
      temp: Math.round(day.main.temp),
      icon: day.weather[0].icon.replace("n", "d"),
      description: day.weather[0].description,
    }));
  } catch (error) {
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
    const timestamp = new Date().getTime();
    const query = `${city} city landscape ${weatherCondition} ${timeOfDay} ${timestamp}`;
    const encodedQuery = encodeURIComponent(query);
    const url = `https://api.unsplash.com/photos/random?query=${encodedQuery}&client_id=${UNSPLASH_API_KEY}&orientation=landscape`;
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json();
    if (data.urls?.regular) {
      return data.urls.regular;
    }

    return null;
  } catch (error) {
    return null;
  }
};
