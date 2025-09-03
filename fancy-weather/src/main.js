import "./css/fonts.css";
import "../style.css";
import { createHeader } from "./components/Header.js";
import { createMainSection } from "./components/MainSection.js";

function createLayout() {
  const app = document.getElementById("app");
  const header = createHeader();

  const mainSection = createMainSection();

  app.append(header, mainSection);
}

createLayout();
