import { ParametersMenu } from './parameterMenu.js';


let parameterMenu;

/**
 * Loads the translation file for the specified language and updates the parameter menu.
 * 
 * @param {string} lang - Language code (default is "en").
 * @returns {Promise<void>} Resolves when translations are loaded and applied.
 */
async function loadLanguage(lang = "en") {
    
    const res = await fetch(`/locales/${lang}.json`);
    translations = await res.json();
    parameterMenu.setLanguage(translations);
}


function onParameterUpdate() {  

}
function init() {

    if (!parameterMenu) {
        parameterMenu = new ParameterMenu(onParameterUpdate);
    }
    loadLanguage();

}


init();