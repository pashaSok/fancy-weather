export const svgNamespace = "http://www.w3.org/2000/svg";

export const state = {
  currentLang: localStorage.getItem("language") || "en",
  currentCity: "Minsk",
  currentCountry: "Belarus",
  currentTime: "12:00",
  currentDate: "Mon, 1 Jan",
  currentLatitude: 53.9,
  currentLongitude: 27.5667,
  timezone: "Europe/Minsk",
  currentWeather: null,
  weatherIcon: null,
  temperature: null,
  weatherDescription: null,
  temperatureUnit: localStorage.getItem("temperatureUnit") || "celsius",
  tempElement: null,
};

export const temperatureUtils = {
  celsiusToFahrenheit: (celsius) => Math.round((celsius * 9) / 5 + 32),
  fahrenheitToCelsius: (fahrenheit) => Math.round(((fahrenheit - 32) * 5) / 9),

  convertTemperature: (temp, fromUnit, toUnit) => {
    if (fromUnit === toUnit) return temp;
    if (fromUnit === "celsius" && toUnit === "fahrenheit") {
      return temperatureUtils.celsiusToFahrenheit(temp);
    }
    if (fromUnit === "fahrenheit" && toUnit === "celsius") {
      return temperatureUtils.fahrenheitToCelsius(temp);
    }
    return temp;
  },
};
