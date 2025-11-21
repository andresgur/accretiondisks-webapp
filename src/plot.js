import Plotly from 'plotly.js-dist-min';

export class Plot {
    constructor(xlabel, ylabel, title) {

        // Initialize menu elements
        this.layout = this.createlayout(xlabel, ylabel, title)

        Plotly.newPlot('H_R', null, this.layout, { responsive: true });

    }

    createlayout(xlabel, ylabel, title, xscale = "log", yscale = "linear") {
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
                tickmode: 'array',  // 1. Specify that you are manually defining ticks
                tickvals: tickvals, // 2. Pass the numeric positions (e.g., [1000, 10000])
                ticktext: ticktext, // 3. Pass the HTML labels (e.g., ['10<sup>3</sup>', '10<sup>4</sup>'])
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
                linewidth: 2
            },
            margin: { t: 40, r: 20, b: 50, l: 60 }
        };

        return layout;
    };

    getLogTicks(Rmin, Rmax) {
        const minPower = Math.ceil(Math.log10(Rmin));
        const maxPower = Math.floor(Math.log10(Rmax));

        let tickvals = [];
        let ticktext = [];

        for (let i = minPower; i <= maxPower; i++) {
            // 1. Calculate the numeric position (e.g., 100, 1000, 10000)
            const value = Math.pow(10, i);
            tickvals.push(value);

            // 2. Create the HTML label (e.g., 10<sup>3</sup>)
            let label;
            if (i == 0) {
                label = 1
            } else if (i == 1) {
                label = 10
            } else {
                label = `10<sup>${i}</sup>`;
            }
            ticktext.push(label);
        }

        return { tickvals, ticktext };
    }

update(data) {
    const R = data.R
    const H = data.H
    Plotly.react("H_R", [{
        x: R,
        y: H,
        type: 'scatter', // plot type (line/scatter)
        mode: 'lines+markers', // optional: lines, markers, or both
        name: 'Series 1' // optional label for legend
    }], this.layout);
}
}