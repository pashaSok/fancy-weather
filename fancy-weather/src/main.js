import "./css/fonts.css";
import "../style.css";
import { createHeader } from "./components/Header.js";
import { createMainSection } from "./components/MainSection.js";
import { weatherApp } from "./services/app-init.js";

function createLayout() {
  const app = document.getElementById("app");
  const header = createHeader();
  const mainSection = createMainSection();

  app.append(header, mainSection);
}

document.addEventListener("DOMContentLoaded", () => {
  createLayout();
  weatherApp.init();
});
