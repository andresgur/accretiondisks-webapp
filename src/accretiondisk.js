import { Gcgs, cgs,  M_sun, k_T} from './constants.js';

export function EddAccretionRate(M, R_in) {
    /**
     * Compute the classical Eddington accretion rate for a given mass.
     * @param {number} M - Mass (astropy.quantity)
     * @param {number} R_in - Inner radius (astropy.quantity)
     * @returns {number} Eddington accretion rate in cgs units
     */
    const efficiency = accretionEfficiency(M, R_in);
    // convert to g/s
    const Mdot0 = LEdd(M) / efficiency / cgs ** 2;
    return Mdot0;
}

export function accretionEfficiency(M, R_in) {
    /**
     * Compute the accretion efficiency for a given mass and inner radius.
     * @param {number} M - Mass in g
     * @param {number} R_in - Inner radius (astropy.quantity)
     * @returns {number} Accretion efficiency (dimensionless)
     */
    const efficiency = Gcgs * M / (2 * R_in * cgs ** 2);
    return efficiency;
}
/**
 * Compute the classical Eddington luminosity in cgs (ergs/s)
 * @param {number} M - Mass in g
 * @returns {number} Eddington luminosity in erg/s
 */
export function LEdd(M) {
    const Ledd = 4 * Math.PI * Gcgs * M *cgs / k_T
    return Ledd
}

export class AccretionDisk {
    constructor(M=10, mdot=0.5, spin=0, alpha=0.1, name="disk", Rmin=1, Rmax=500, torque_Rin=0) {
        this.mdot = mdot; // in Eddington units
        this.M = M * M_sun; // in grams
        this.spin = spin; // in units of GM/c^2
        this.name = name;
        this.points = 100;
        this.torque_Rin = torque_Rin;
        this.Rmin = Rmin;
        this.Rmax = Rmax;
        
        this.calculateRadii();
        this.Mdot_0 = this.mdot * EddAccretionRate(this.M, this.R0);
        //TODO: Calculate Mdot_0 in grams per second
        this.radii = [];
        this.alpha = alpha;
    }

    calculateRadii() {
        this.Rg = this.gravitationalRadius(); // in cm
        this.R0 = this.isco()
    }

    isco() {
        const z1 = 1 + (1 - this.spin**2) ** (1/3) * ((1 + this.spin)** (1/3) + (1-this.spin) ** (1/3));
        const z2 = Math.sqrt(3 * this.spin ** 2 + z1**2);
        const R0 = (3 + z2 - Math.sqrt((3 - z1) * (3 + z1 + 2 * z2))) * this.Rg;
        return R0;
    }

    solve() {
        // Placeholder for accretion disk calculations
        console.log(`Calculating accretion disk properties for ${this.name}`);
        const indexes = Array.from({ length: this.points }, (_, i) => i);
        indexes.forEach(i => {
            // Perform calculations at each radius
            const R = this.Rg * (this.Rmin +  (this.Rmax - this.Rmin) * (i / (this.points - 1)));
            this.radii[i] = R;
            const omega = this.angularVelocity(R);
            const Wrphi = this.torque(R, omega);
            const Qrad = this.Q_rad(Wrphi, R); 
            const H  = this.scaleHeight(Wrphi, omega);
            const density = this.density(Wrphi, H, omega)
            const vr = this.radialVelocity(H, density, R)

        });
    }




    set M(M) {
        this._M = M * M_sun;
        this.calculateRadii();
        this.Mdot_0 = this.mdot * EddAccretionRate(this.M, this.R0);
        this.solve();
    }

    set mdot(mdot) {
        this._mdot = mdot;
        this.Mdot_0 = this.mdot * EddAccretionRate(this.M, this.R0);
        this.solve();
    }

    density(Wrphi, H, omega) {
        const density = -Wrphi / (2 * this.alpha * omega**2 * H**3);
        return density;
    }

    scaleHeight(Wrphi, omega) {
        const H = -3/4 * k_T *Wrphi / (omega * cgs);
        return H;
    }

    radialVelocity(H, density, R) {
        const vr = this.Mdot_0 / (density * H * 4 * Math.PI * R);
        return vr;
    }

    torque(R, omega) {
        const Wrphi = -(this.Mdot_0 * omega / (2 * Math.PI) * (1 - Math.sqrt(this.R0 / R))) + this.Wrphi_Rin * (this.R0 / R) ** 2;
        return Wrphi
    }

    gravitationalRadius() {
        const Rg = (Gcgs * this.M) / (cgs ** 2); // in cm
        return Rg;
    }

    angularVelocity(R) {
        const omega = Math.sqrt(Gcgs * this.M / (R ** 3))
        return omega;
    }

    Q_rad(H, R) {
        const Qrad = (3/8) * (H/R) * (Gcgs * this.M / (cgs ** 2));
        return Qrad;
    }

}