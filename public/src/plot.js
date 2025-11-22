import Plotly from 'plotly.js-dist-min';

/**
 * BasePlot Class
 * Handles initialization, creating the standard log-scale layout, 
 * and managing the plot container. This class should be extended 
 * for specific plot types.
 */
export class BasePlot {
    /**
     * @param {string} plotId - The DOM ID of the container where the plot will be rendered (e.g., 'H_R' or 'Mdot').
     * @param {string} ylabel - The label for the Y-axis.
     * @param {string} xlabel - The label for the X-axis (default: R).
     * @param {string} title - The title of the plot.
     */
    constructor(plotId, ylabel, xlabel = "<i>R</i> (<i>R<sub>ISCO</sub></i>)", title = "") {
        this.plotId = plotId;
        // The layout is initialized here and stored for subsequent updates
        this.layout = this.createLayout(xlabel, ylabel, title);
        
        // Initialize the plot. Data is null initially.
        Plotly.newPlot(this.plotId, [], this.layout, { responsive: true });
    }

    /**
     * Creates the standard Plotly layout configuration. 
     * NOTE: No specific shapes are included in the base layout.
     */
    createLayout(xlabel, ylabel, title, xscale = "log", yscale = "linear") {
        // Calculate tick values for the log-scale R axis
        const { tickvals, ticktext } = this.getLogTicks(1, 1e6);

        const layout = {
            title: title,
            xaxis: {
                mirror: true,
                title: {
                    text: xlabel,
                },
                type: xscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
                tickmode: 'array',
                tickvals: tickvals,
                ticktext: ticktext,
            },
            yaxis: {
                mirror: true,
                title: {
                    text: ylabel,
                },
                type: yscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
            },
            margin: { t: 30, r: 10, b: 50, l: 60 },
            showlegend: false
        };

        return layout;
    }

    /**
     * Generates an array of tick values and corresponding HTML labels 
     * for a log-scale axis, ensuring labels use sup for exponents.
     */
    getLogTicks(Rmin, Rmax) {
        const minPower = Math.ceil(Math.log10(Rmin));
        const maxPower = Math.floor(Math.log10(Rmax));

        let tickvals = [];
        let ticktext = [];

        for (let i = minPower; i <= maxPower; i++) {
            const value = Math.pow(10, i);
            tickvals.push(value);

            let label;
            if (i === 0) {
                label = '1';
            } else if (i === 1) {
                label = '10';
            } else {
                label = `10<sup>${i}</sup>`;
            }
            ticktext.push(label);
        }

        return { tickvals, ticktext };
    }

    /**
     * Generic update method - intended to be overridden by subclasses.
     * @param {object} data - The data object containing R and Y values.
     */
    update(data) {
        console.warn(`Update method not implemented for BasePlot with ID: ${this.plotId}`);
    }
}


/**
 * MdotPlot Class
 * Extends BasePlot to handle specific Mdot data and adds a fixed horizontal line at y=1.
 */
export class MdotPlot extends BasePlot {
    /**
     * @param {string} plotId - The DOM ID of the Mdot plot container.
     */
    constructor(plotId) {
        super(plotId, "<i><span>M</span></i>(<i>R</i>)/<i><span>M</span><sub>0</sub></i>", undefined, "");

    
            // 1. Define the horizontal line shape
        const horizontalline = {
            type: "line",
            // The line spans the entire plot horizontally (from paper x=0 to x=1)
            xref: "paper",
            x0: 0, 
            x1: 1,
            // The line's vertical position is anchored to the data value y=1
            yref: "y", 
            y0: 1.0, 
            y1: 1.0,
            layer: "below",
            line: {
                color: 'black',
                dash: "dash",
                width: 1
            }
        };

        this.layout =  {
            ...this.layout,

            // Initialize or append to the shapes array
            shapes: [
                ...(this.layout.shapes || []), // Preserve any existing shapes
                horizontalline                 // Add the new shape
            ]
        };
    }

    /**
     * Overrides the base update method to plot Mdot data and add the horizontal line.
     * @param {object} data - The data object containing R and Mdot values.
     */
    update(data) {
        const R = data.R;
    
        // 3. Update the plot with new data and the new layout
        Plotly.react(this.plotId, [
            {
                x: R,
                y: data.Mdot,
                type: 'scatter',
                mode: "lines",
                name: "<i><span>M</span></i>(<i>R</i>)/<i><span>M</span><sub>0</sub></i>"
            },
        ], this.layout);
    }
}


/**
 * MdotPlot Class
 * Extends BasePlot to handle specific Mdot data and adds a fixed horizontal line at y=1.
 */
export class HRPlot extends BasePlot {
    /**
     * @param {string} plotId - The DOM ID of the Mdot plot container.
     */
    constructor(plotId) {
        super(plotId, "<i>H/R</i>", undefined, "");
    }

    /**
     * Overrides the base update method to plot Mdot data and add the horizontal line.
     * @param {object} data - The data object containing R and Mdot values.
     */
    update(data) {
        const R = data.R;
    
        // 3. Update the plot with new data and the new layout
        Plotly.react(this.plotId, [
            {
                x: R,
                y: data.H,
                type: 'scatter',
                mode: "lines",
                name: "<i>H/R</i>"
            },
        ], this.layout);
    }
}