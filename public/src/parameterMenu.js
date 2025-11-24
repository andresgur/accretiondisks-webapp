import { ToolTipLabel } from "./toolTipLabel.js";

export class ParameterMenu {
    constructor(onPlotUpdate, onAlphaChanged) {
        this.onPlotUpdate = onPlotUpdate; // Callback to restart the simulation
        this.onAlphaChanged = onAlphaChanged;

        // Initialize menu elements
        this.initParameters()

    }

    initParameters() {

        //labels
        this.LEddLabel = document.getElementById("eddington-luminosity");
        this.leddTip = new ToolTipLabel("eddington-luminosity")
        this.RiscoLabel = document.getElementById("isco-radius")
        this.RiscoTip = new ToolTipLabel("isco-radius");
        this.LtotLabel = document.getElementById("total-luminosity");
        this.RsphLabel = document.getElementById("spherization-radius");
        this.Rsphdiv = document.getElementById("rsph-div");
        this.regimeLabel = document.getElementById("accretion-regime")
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

        this.setRegime(this.mdot);

        this.createBlackHole();

        this.mdotInput.addEventListener("input", (event) => {
            this.mdot = parseFloat(event.target.value);
            if (this.mdot>0) {
                this.updateMdot()

            }
        });

        this.alphaInput.addEventListener("input", (event) => {
            this.alpha = parseFloat(event.target.value);
            if (this.alpha < 1. && this.alpha > 0.) {
                this.updateAlpha();
            };
        });


        this.massInput.addEventListener("input", (event) => {
            this.mass = parseFloat(event.target.value);
            this.updateMass()
        });

        this.spinInput.addEventListener("input", (event) => {
            this.spin = parseFloat(event.target.value);
            if (this.spin < 1. && this.spin > 0.) {
                this.updateSpin();
            }
        });
    }

    async updateMdot() {
        const params = {
            mdot: this.mdot,
            alpha: this.alpha
        };

        const res = await fetch("http://localhost:8000/accretiondisk/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        console.log("Updating mdot");
        const data = await res.json();
        this.LtotLabel.innerHTML = (data.Ltot).toFixed(1);
        this.setRegime(this.mdot, data.Rsph);
        this.onPlotUpdate(data); // Trigger simulation update
        console.log("Done");
    }

    async updateAlpha() {
        const params = {
            mdot: this.mdot,
            alpha: this.alpha
        };

        const res = await fetch("http://localhost:8000/accretiondisk/update", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        console.log("Updating alpha")

        const data = await res.json();
        this.onPlotUpdate(data); // Trigger simulation update
        console.log("Done");
    }

    async updateSpin() {

        const params = {
            spin: this.spin,
            mdot: this.mdot,
            alpha: this.alpha
        };

        console.log("Updating spin");
        const res = await fetch("http://localhost:8000/compactobject/spin_change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });
        console.log("JSON received")
        const data = await res.json();
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1);
        this.LtotLabel.innerHTML = (data.Ltot).toFixed(2);
        this.onPlotUpdate(data); // Trigger simulation update
        console.log("Done");

    }

    async updateMass() {
        const params = {

            mass: this.mass,
            mdot: this.mdot,
            alpha: this.alpha
        };

        const res = await fetch("http://localhost:8000/compactobject/mass_change", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();
        console.log("Updating mass");
        this.LEddLabel.innerHTML = (data.LEdd / 10 ** 39).toFixed(1)
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1)
        this.LtotLabel.innerHTML = (data.Ltot).toFixed(2)
        this.onPlotUpdate(data); // Trigger simulation update
        console.log("Done");
    };


    async createBlackHole() {

        const params = {
            mass: this.mass,
            spin: this.spin,
            mdot: this.mdot,
            alpha: this.alpha
        };

        const res = await fetch("http://localhost:8000/init", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(params),
        });

        const data = await res.json();

        this.LEddLabel.innerHTML = (data.LEdd / 10 ** 39).toFixed(1);
        this.RiscoLabel.innerHTML = (data.Risco / 100000).toFixed(1);
        this.LtotLabel.innerHTML = (data.Ltot).toFixed(2);
        this.onPlotUpdate(data); // Trigger simulation update
        console.log("Done");

    };


    setLanguage(translations) {
        this.mdotLabel.setLanguage(translations);
        this.alphaLabel.setLanguage(translations);
        this.massLabel.setLanguage(translations);
        this.spinLabel.setLanguage(translations);
        this.RiscoTip.setLanguage(translations);
        this.leddTip.setLanguage(translations);
    }

    setRegime(mdot, Rsph=0) {

        if (mdot < 1) {
            this.Rsphdiv.classList.add("hidden");
            this.regimeLabel.innerHTML = "Sub-Eddington";

        } else {
            this.Rsphdiv.classList.remove("hidden");
            this.RsphLabel.innerHTML = (Rsph).toFixed(1);
            this.regimeLabel.innerHTML = "Super-Eddington";

        }

    }
}
