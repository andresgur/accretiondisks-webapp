import { ParameterMenu } from './parameterMenu.js';
import { GridPlot } from './grid.js'


let parameterMenu;
let gridPlot;
let Mdotplot;
let Qvisplot;
let densityPlot;
let temperaturePlot;

/**
 * Loads the translation file for the specified language and updates the parameter menu.
 * 
 * @param {string} lang - Language code (default is "en").
 * @returns {Promise<void>} Resolves when translations are loaded and applied.
 */
async function loadLanguage(lang = "en") {

    const res = await fetch(`../locales/${lang}.json`);
    const translations = await res.json();
    parameterMenu.setLanguage(translations);
}

function init() {

    console.log("Initializing Plotly plot...");

    if (!gridPlot) {
        gridPlot = new GridPlot("grid");
    }
    /*
    if (!Mdotplot) {
        Mdotplot = new MdotPlot("Mdot", "<i><span>M</span></i>(<i>R</i>)/<i><span>M</span><sub>0</sub></i>");
    }

    /*if (!densityPlot) {
        densityPlot = new gridPlot("density", "<i>&#961;</i> (g/cm<sup>3</sup>)");
    }

    if (!Qvisplot) {
        Qvisplot = new MdotPlot("Qvis", "<i>Q/Q</i><sub>vis</sub>")
    }

    */

    if (!parameterMenu) {
        parameterMenu = new ParameterMenu((data => {
            console.log(data.Rsph)
           gridPlot.update(data.R, data.H, data.Mdot, data.Qrad, data.Qadv, data.vr, data.Rsph);
            //Mdotplot.update(data.R, data.Mdot);
           // Qvisplot.update(data.R, data.Qrad)
            //densityPlot.update(data.R, data.rho)
        }), data => {
            console.log("Alpha changed");
        }
    )
    }

    

    loadLanguage();
}

init();