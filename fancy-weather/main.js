import "./style.css";
const app = document.getElementById('app');
const svgNamespace = "http://www.w3.org/2000/svg";
app.className = "bg-[url('./dist/assets/bg.png')] bg-cover bg-center bg-no-repeat min-h-screen";
const container = document.createElement('div');
container.className = 'md:container md:mx-auto w-[1260px] mx-auto flex items-center justify-between';

const header = document.createElement('header');
header.appendChild(container.cloneNode()); 
app.appendChild(header);
header.classList='pt-10'
const headerButtonsWrapper = document.createElement('div');
headerButtonsWrapper.className = 'flex items-center gap-2.5 m-0 header-button-wrapper';
const refreshButton = document.createElement('button');
refreshButton.className = 'w-11 h-11 bg-[#868D96]/50  bg-center size-12 hover:cursor-pointer relative rounded-md bg-blend-color-burn';
refreshButton.style.backgroundImage = 'url("./assets/refresh.jpg")';
headerButtonsWrapper.appendChild(refreshButton);


const spinnerSVG = document.createElementNS(svgNamespace, "svg");
spinnerSVG.classList.add('w-5','h-5','absolute','top-1/2', 'left-1/2', 'transform', '-translate-x-1/2', '-translate-y-1/2');
spinnerSVG.setAttribute('viewBox', '0 0 24 24');
spinnerSVG.setAttribute('fill', 'none');
spinnerSVG.innerHTML='<path xmlns="http://www.w3.org/2000/svg" d="M4.06189 13C4.02104 12.6724 4 12.3387 4 12C4 7.58172 7.58172 4 12 4C14.5006 4 16.7332 5.14727 18.2002 6.94416M19.9381 11C19.979 11.3276 20 11.6613 20 12C20 16.4183 16.4183 20 12 20C9.61061 20 7.46589 18.9525 6 17.2916M9 17H6V17.2916M18.2002 4V6.94416M18.2002 6.94416V6.99993L15.2002 7M6 20V17.2916" stroke="#fff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>';

const langArrowSVG = document.createElementNS(svgNamespace, "svg");
langArrowSVG.classList.add('w-2','h-1','opacity-40');
langArrowSVG.setAttribute('viewBox','0 0 10 5');
langArrowSVG.setAttribute('fill','none');
langArrowSVG.innerHTML='<path fill-rule="evenodd" clip-rule="evenodd" d="M4.84162 3.75747L8.62642 0L9.68323 1.0645L4.84162 5.87114L0 1.0645L1.05681 3.57628e-07L4.84162 3.75747Z" stroke="#fff"/>';


refreshButton.appendChild(spinnerSVG);
headerButtonsWrapper.appendChild(refreshButton);

refreshButton.onclick = function() {
    spinnerSVG.classList.add('animate-spin');
    setTimeout(() => {
        spinnerSVG.classList.remove('animate-spin');
    }, 500);
};

const languageSelector  = document.createElement('div');
languageSelector.className= 'relative flex items-center justify-center w-20 h-11 bg-[#868D96]/50 rounded-md cursor-pointer gap-3';
headerButtonsWrapper.appendChild(languageSelector);

const languageButton = document.createElement('button');
languageButton.textContent = 'en ';
languageButton.className = 'flex items-center justify-center uppercase text-white text-[1rem] font-bold cursor-pointer';
languageSelector.appendChild(languageButton);
languageSelector.appendChild(langArrowSVG);

const languageMenu = document.createElement('div');
languageMenu.className = 'absolute top-[100%] left-0 w-20 overflow-hidden transition-all duration-300 ease-in-out slide-up';
languageMenu.setAttribute('role', 'menu');
languageMenu.setAttribute('aria-orientation', 'vertical');
const languages = ['en', 'ru', 'be'];

languages.forEach(lang => {
    const item = document.createElement('a');
    item.href = '#';
    item.textContent = lang;
    item.className = 'flex items-center justify-center bg-[#4C5255]/50 hover:bg-[#4C5255]/25 h-11 uppercase text-white font-bold last:rounded-b-md';
    item.setAttribute('role', 'menuitem');
    item.addEventListener('click', (event) => {
        event.preventDefault();
        languageButton.firstChild.textContent = lang;
        languageMenu.classList.remove('slide-down');
        languageMenu.classList.add('slide-up');
        languageSelector.classList.remove('rounded-b-md');
        event.stopPropagation();
    });
    languageMenu.appendChild(item);
});

languageSelector.appendChild(languageMenu);

languageSelector.addEventListener('click', (event) => {
    event.stopPropagation();
    const isMenuOpen = languageMenu.classList.contains('slide-down');
    if (isMenuOpen) {
        languageMenu.classList.remove('slide-down');
        languageMenu.classList.add('slide-up');
        languageSelector.classList.remove('rounded-b-md');
    } else {
        languageMenu.classList.remove('slide-up');
        languageMenu.classList.add('slide-down');
        languageSelector.classList.add('rounded-b-md');
    }
});

document.addEventListener('click', (event) => {
    if (!languageSelector.contains(event.target)) {
        languageMenu.classList.remove('slide-down');
        languageMenu.classList.add('slide-up');
        languageSelector.classList.remove('rounded-b-md');
    }
});

const temperatureToggle = document.createElement('div');
const celsiusField = document.createElement('div');
const fahrenheitField = document.createElement('div');

temperatureToggle.appendChild(fahrenheitField);
temperatureToggle.appendChild(celsiusField);
headerButtonsWrapper.appendChild(temperatureToggle);

temperatureToggle.className = 'w-[88px] h-11 flex items-center bg-[#868D96]/50  text-white rounded-md cursor-pointer transition-opacity duration-300 font-bold';
fahrenheitField.textContent =' °F';
fahrenheitField.className = 'w-full flex items-center justify-center bg-[#4C5255]/50 h-full rounded-l-md transition-all duration-300';
celsiusField.textContent = '°C';
celsiusField.className = 'w-full h-full flex items-center justify-center opacity-25 rounded-r-md transition-all duration-300';
let activeTemperature = 'far';
temperatureToggle.addEventListener('click', (event) => {   
    if (activeTemperature==='far') {
        fahrenheitField.classList.remove('opacity-100', 'bg-[#4C5255]/50');
        fahrenheitField.classList.add('opacity-25');
        celsiusField.classList.remove('opacity-25');
        celsiusField.classList.add('opacity-100', 'bg-[#4C5255]/50');
        activeTemperature = 'cel';
    } else if(activeTemperature === 'cel') {
        celsiusField.classList.remove('opacity-100', 'bg-[#4C5255]/50');
        celsiusField.classList.add('opacity-25');
        fahrenheitField.classList.remove('opacity-25');
        fahrenheitField.classList.add('opacity-100', 'bg-[#4C5255]/50');
        activeTemperature ='far';
    }
});

header.querySelector('.md\\:container').appendChild(headerButtonsWrapper);

const headerSearchWrapper = document.createElement('div');
headerSearchWrapper.className = 'flex items-center w-[375px] rounded-lg';

const headerSearchInputContainer = document.createElement('div');
headerSearchInputContainer.className = 'relative flex-grow rounded-l-lg h-11 box-border flex items-center justify-between bg-[#868D96]/50 border border-[#6F7884]/50';

const headerSearchInput = document.createElement('input');
headerSearchInput.type = 'text';
headerSearchInput.placeholder = 'Search city or ZIP';
headerSearchInput.className = 'px-[15px] rounded-l-lg focus:outline-none w-full h-full text-white placeholder-white placeholder-opacity-70';

const headerSearchMicButton = document.createElement('button');
headerSearchMicButton.type = 'button';
headerSearchMicButton.className = 'absolute right-2 top-1/2 transform -translate-y-1/2 text-[#848c95] transition-all duration-300 hover:text-[#848c95]/50 focus:outline-none cursor-pointer';
headerSearchMicButton.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
    <path fill-rule="evenodd" d="M7 4a3 3 0 016 0v4a3 3 0 11-6 0V4zm4 10.93A7.001 7.001 0 0017 8a1 1 0 10-2 0A5 5 0 015 8a1 1 0 00-2 0 7.001 7.001 0 006 6.93V17H6a1 1 0 100 2h8a1 1 0 100-2h-3v-2.07z" clip-rule="evenodd" />
  </svg>
`;

headerSearchInputContainer.appendChild(headerSearchInput);
headerSearchInputContainer.appendChild(headerSearchMicButton);

const headerSearchButton = document.createElement('button');
headerSearchButton.type = 'button';
headerSearchButton.className = 'h-11 w-[101px] px-4 bg-[#848c95] rounded-r-lg text-white hover:bg-[#5a6268] transition-colors duration-200 flex items-center justify-center cursor-pointer';
headerSearchButton.textContent = 'Search';

headerSearchWrapper.appendChild(headerSearchInputContainer);
headerSearchWrapper.appendChild(headerSearchButton);
header.querySelector('.md\\:container').appendChild(headerSearchWrapper);

const main = document.createElement('section');
main.appendChild(container.cloneNode());
app.appendChild(main);
