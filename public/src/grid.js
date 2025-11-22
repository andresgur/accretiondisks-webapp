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
            grid: {
                rows: 2,
                columns: 2,
                roworder: "top to bottom",
                subplots: [['xy', 'x2y2'], ['x3y3', 'x4y4']],
                xgap: 0.2,
                ygap: 0.1,
            },
            xaxis: {
                type: "log",
                ticklen: 10,
                tickwidth: 1.2,

                minor: {
                    tickwidth: 1,
                    ticklen: 6,
                    ticks: "inside",
                },
                mirror: true,
                showticklabels: false,
                type: xscale,
                showgrid: true,
                ticks: "inside",
                linewidth: 2,

                exponentformat: "power",
            }, xaxis2: {
                type: "log",
                ticklen: 10,
                tickwidth: 1.2,

                minor: {
                    tickwidth: 1,
                    ticklen: 6,
                    ticks: "inside",
                },
                mirror: true,
                showticklabels: false,
                type: xscale,
                showgrid: true,
                ticks: "inside",
                linewidth: 2,
                exponentformat: "power",
            },
            xaxis3: {
                type: "log",
                ticklen: 10,
                tickwidth: 1.2,

                minor: {
                    tickwidth: 1,
                    ticklen: 6,
                    ticks: "inside",
                },
                mirror: true,

                title: {
                    text: xlabel,
                    standoff: 2,
                },
                minorloglabels: "none",
                showticklabels: true,
                showline: true,
                type: xscale,
                showgrid: true,
                ticks: "inside",
                automargin: true,
                linewidth: 2,
                exponentformat: "power",
            },
            xaxis4: {
                type: "log",
                ticklen: 10,
                tickwidth: 1.2,
                minorloglabels: "none",
                minor: {

                    tickwidth: 1,
                    ticklen: 6,
                    ticks: "inside",
                },
                mirror: true,
                title: {
                    text: xlabel,
                    standoff: 2,
                },
                //ticklabelstandoff :10,
                showline: true,
                type: xscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
                automargin: true,
                showlegend: true,
                exponentformat: "power",
            },
            yaxis1: {
                mirror: true,
                title: {
                    text: "",
                },
                type: yscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
            },
            yaxis2: {
                mirror: true,
                title: {
                    text: "",
                },
                type: yscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
            },
            yaxis3: {
                mirror: true,
                title: {
                    text: "",
                },
                type: yscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
            },
            yaxis4: {
                mirror: true,
                title: {
                    text: "",
                },
                type: yscale,
                showgrid: true,
                zeroline: false,
                ticks: "inside",
                linewidth: 2,
                exponentformat: "power"
            },
            margin: { t: 100, r: 10, b: 50, l: 60 },
            font: {
                size: 18,
                family: "DejaVu Sans"
            }
        }

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
    update(x, y) {
        console.warn(`Update method not implemented for BasePlot with ID: ${this.plotId}`);
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
    constructor(plotId, ylabel) {
        super(plotId, ylabel, undefined, "");
    }


    /**
     * Overrides the base update method to plot Mdot data and add the horizontal line.
     * @param {object} data - The data object containing R and Mdot values.
     */
    update(x, H, Mdot, Qrad, Qvis, vr) {

        var Hdata = {
            x: x,
            y: H,
            xaxis: "x",
            yaxis: "y1",
            name: "<i>H/R</i>",
            type: "scatter",
        }

        var Mdotdata = {
            x: x,
            y: Mdot,
            xaxis: "x2",
            yaxis: "y2",
            name: "<i><span>M</span></i>(<i>R</i>)/<i><span>M</span><sub>0</sub></i>",
            type: "scatter",
        }

        var Qraddata = {
            x: x,
            y: Qrad,
            xaxis: "x3",
            yaxis: "y3",
            name: "<i>Q</i><sub>rad</sub>",
            type: "scatter",
        }

        var Qvisdata = {
            x: x,
            y: Qvis,
            xaxis: "x3",
            yaxis: "y3",
            name: "<i>Q</i><sub>vis</sub>",
            type: "scatter",
        }

        var vrdata = {
            x: x,
            y: vr,
            xaxis: "x4",
            yaxis: "y4",
            name: "<i>v(R)/c</i>",
            type: "scatter",
        }

        const data = [Hdata, Mdotdata, Qraddata, Qvisdata, vrdata]


        // 3. Update the plot with new data and the new layout
        Plotly.react(this.plotId, data, this.layout);
    }
}