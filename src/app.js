import { ParameterMenu } from './parameterMenu.js';
import { MdotPlot, HRPlot } from './plot.js'


let parameterMenu;
let HRplot;
let Mdotplot;

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
        HRplot = new HRPlot("H_R", "<i>H/R</i>");
    }

    if (!Mdotplot) {
        Mdotplot = new MdotPlot("Mdot", "<i><span>M</span></i>(<i>R</i>)/<i><span>M</span><sub>0</sub></i>")
    }

    if (!parameterMenu) {
        parameterMenu = new ParameterMenu((data) => {
            HRplot.update(data);
            Mdotplot.update(data);
        });
    }

    loadLanguage();
}

init();