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
