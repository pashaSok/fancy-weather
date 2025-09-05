export const svgNamespace = "http://www.w3.org/2000/svg";

export const temperatureUtils = {
  celsiusToFahrenheit: (celsius) => Math.round((celsius * 9) / 5 + 32),
  fahrenheitToCelsius: (fahrenheit) => Math.round(((fahrenheit - 32) * 5) / 9),
};
