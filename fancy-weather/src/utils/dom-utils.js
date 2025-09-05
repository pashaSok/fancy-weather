export const createElement = (tag, classes = "", attributes = {}) => {
  const element = document.createElement(tag);
  if (classes) element.className = classes;

  Object.entries(attributes).forEach(([key, value]) => {
    element.setAttribute(key, value);
  });

  return element;
};

export const createLoader = () => {
  const loader = document.createElement("div");
  loader.id = "app-loader";
  loader.className =
    "fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50 transition-opacity duration-300";

  const spinner = document.createElement("div");
  spinner.className =
    "w-16 h-16 border-4 border-white border-t-transparent rounded-full animate-spin";

  loader.appendChild(spinner);
  return loader;
};

export const showLoader = () => {
  let loader = document.getElementById("app-loader");
  if (!loader) {
    loader = createLoader();
    document.body.appendChild(loader);
  }
  loader.classList.remove("opacity-0", "hidden");
};

export const hideLoader = () => {
  const loader = document.getElementById("app-loader");
  if (loader) {
    loader.classList.add("opacity-0");
    setTimeout(() => {
      loader.classList.add("hidden");
    }, 300);
  }
};
