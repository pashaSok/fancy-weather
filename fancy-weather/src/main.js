import "./css/fonts.css";
import "../style.css";
import { createHeader } from "./components/Header.js";
import { createMainSection } from "./components/MainSection.js";

function createLayout() {
  const app = document.getElementById("app");
  app.className =
    "min-h-screen bg-[linear-gradient(rgba(0,0,0,0.5),rgba(0,0,0,0.5)),url('./dist/assets/bg.png')] bg-cover bg-center bg-no-repeat";

  const header = createHeader();

  const mainSection = createMainSection();

  app.append(header, mainSection);
}

createLayout();
