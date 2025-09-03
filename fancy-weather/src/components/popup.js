import { translations } from "../utils/translations.js";
import { state } from "../utils/constants.js";

export function createErrorPopup() {
  const popup = document.createElement("div");
  popup.id = "error-popup";
  popup.className = `
    fixed top-4 right-4 bg-red-500 text-white
    px-6 py-3 rounded-lg shadow-lg hidden z-50
    transition-all duration-300 transform translate-x-full
  `;

  const popupContent = document.createElement("div");
  popupContent.className = "flex items-center gap-2";

  const icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  icon.setAttribute("class", "h-6 w-6");
  icon.setAttribute("fill", "none");
  icon.setAttribute("viewBox", "0 0 24 24");
  icon.setAttribute("stroke", "currentColor");
  icon.innerHTML = `
    <path
      stroke-linecap="round"
      stroke-linejoin="round"
      stroke-width="2"
      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  `;

  const message = document.createElement("span");
  message.id = "error-message";

  popupContent.append(icon, message);
  popup.appendChild(popupContent);
  document.body.appendChild(popup);

  return popup;
}

export function showErrorPopup(message) {
  if (!message) {
    console.warn("Error message is empty");
    return;
  }

  let popup = document.getElementById("error-popup");

  if (!popup) {
    popup = createErrorPopup();
  }

  const errorMessage = popup.querySelector("#error-message");
  const t = translations[state.currentLang];
  errorMessage.textContent = t[message] || message;

  popup.classList.remove("hidden", "translate-x-full");
  popup.classList.add("translate-x-0");

  setTimeout(() => {
    popup.classList.remove("translate-x-0");
    popup.classList.add("translate-x-full");

    setTimeout(() => {
      popup.classList.add("hidden");
    }, 300);
  }, 3000);
}
