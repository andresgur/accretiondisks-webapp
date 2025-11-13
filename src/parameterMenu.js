import { ToolTipLabel } from "./toolTipLabel.js";

export class ParametersMenu {
    constructor(onUpdate) {
        this.onUpdate = onUpdate; // Callback to restart the simulation

        // Initialize menu elements
        this.initParameters()

    }

    initParameters() {
        this.massInput = document.getElementById("input-mass");
        this.massLabel = new ToolTipLabel("mass")
        this.mass = parseFloat(this.massInput.value);
        this.massInput.addEventListener("input", (event) => {
            this.mass = parseFloat(event.target.value);
            this.onUpdate(this.mass); // Trigger simulation update
        });
        //this is for the popup menu
        this.mdotLabel = new ToolTipLabel("mdot");
        this.mdotInput = document.getElementById("input-mdot");
        this.mdot = parseFloat(this.mdotInput.value);
        this.mdotInput.addEventListener("input", (event) => {
            this.mdot = parseFloat(event.target.value);
            this.onUpdate(this.mdot); // Trigger simulation update
        });
    }


    setLanguage(translations) {
        this.massLabel.setLanguage(translations);
        this.mdotLabel.setLanguage(translations);
    }

    

}
