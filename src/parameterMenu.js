import { ToolTipLabel } from "./toolTipLabel.js";

export class ParameterMenu {
    constructor(onUpdate) {
        this.onUpdate = onUpdate; // Callback to restart the simulation

        // Initialize menu elements
        this.initParameters()

    }

    initParameters() {

        //labels
        this.LEddLabel = document.getElementById("eddington-luminosity");
        this.RiscoLabel = document.getElementById("isco-radius")
        // mass
        this.massInput = document.getElementById("input-mass");
        this.massLabel = new ToolTipLabel("mass");
        this.mass = parseFloat(this.massInput.value);
        // spin
        this.spinLabel = new ToolTipLabel("spin");
        this.spinInput = document.getElementById("input-spin");
        this.spin = parseFloat(this.spinInput.value);

        // alpha
        this.alphaLabel = new ToolTipLabel("alpha");
        this.alphaInput = document.getElementById("input-alpha");
        this.alpha = parseFloat(this.alphaInput.value);

        //mdot
        this.mdotLabel = new ToolTipLabel("mdot");
        this.mdotInput = document.getElementById("input-mdot");
        this.mdot = parseFloat(this.mdotInput.value);

        this.createBlackHole();

        this.mdotInput.addEventListener("input", (event) => {
            this.mdot = parseFloat(event.target.value);
            this.updateMdot()
        });

        this.alphaInput.addEventListener("input", (event) => {
            this.alpha = parseFloat(event.target.value);
            this.updateAlpha()
        });


        this.massInput.addEventListener("input", (event) => {
            this.mass = parseFloat(event.target.value);
            this.updateMass()
        });

        this.spinInput.addEventListener("input", (event) => {
            this.spin = parseFloat(event.target.value);
            if (this.spin > 1.) {
                return
            }
            this.updateSpin()
        });
    }

    async updateMdot() {

    }

    async updateAlpha() {

    }

    async updateSpin() {

        const params = {
            spin: this.spin
        };

        const res = await fetch("http://localhost:8000/compactobject/spin_change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1)
        //this.onUpdate(this.mass, this.spin); // Trigger simulation update

    }

    async updateMass() {
        const params = {
            mass: this.mass
        };

        const res = await fetch("http://localhost:8000/compactobject/mass_change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        this.LEddLabel.innerHTML = (data.LEdd / 10 ** 39).toFixed(1)
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1)
        //this.onUpdate(this.mass, this.spin); // Trigger simulation update
    };


    async createBlackHole() {

        const params = {
            mass: this.mass,
            spin: this.spin,
            mdot: this.mdot,
            alpha: this.alpha
        };

        const res = await fetch("http://localhost:8000/create_compact_object", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        this.LEddLabel.innerHTML = (data.LEdd / 10 ** 39).toFixed(1)
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1)
        this.onUpdate(data); // Trigger simulation update


    };


    setLanguage(translations) {
        this.mdotLabel.setLanguage(translations);
        this.alphaLabel.setLanguage(translations);
        this.massLabel.setLanguage(translations);
        this.spinLabel.setLanguage(translations);
    }



}
