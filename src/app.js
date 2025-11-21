import { ParameterMenu } from './parameterMenu.js';
import { Plot } from './plot.js'


let parameterMenu;
let HRplot;

/**
 * Loads the translation file for the specified language and updates the parameter menu.
 * 
 * @param {string} lang - Language code (default is "en").
 * @returns {Promise<void>} Resolves when translations are loaded and applied.
 */
async function loadLanguage(lang = "en") {

    const res = await fetch(`/locales/${lang}.json`);
    const translations = await res.json();
    parameterMenu.setLanguage(translations);
}

function init() {

    console.log("Initializing Plotly plot...");

    if (!HRplot) {
        HRplot = new Plot("<i>R</i> (<i>R<sub>ISCO</sub></i>)", "<i>H/R</i>");
    }

    if (!parameterMenu) {
        parameterMenu = new ParameterMenu((data) => {
            HRplot.update(data);
        });
    }

    loadLanguage();
}

init();