import * as d3 from "d3";

export class D3Formatters {
    private static siFormatter = d3.format(".2~s");
    private static currencyFormatter = d3.format("$,.2f");
    private static percentFormatter = d3.format(".1%");
    private static integerFormatter = d3.format(",d");

    /**
     * Smart number formatter that automatically adapts based on magnitude
     */
    static formatSmartNumber(value: number | null | undefined): string {
        if (value === null || value === undefined || isNaN(value)) {
            return "-";
        }

        const absVal = Math.abs(value);
        if (absVal >= 10000) {
            return this.siFormatter(value);
        } else if (Number.isInteger(value)) {
            return this.integerFormatter(value);
        } else {
            return d3.format(",.2f")(value);
        }
    }

    /**
     * Format currency values
     */
    static formatCurrency(value: number | null | undefined): string {
        if (value === null || value === undefined || isNaN(value)) {
            return "-";
        }
        return this.currencyFormatter(value);
    }

    /**
     * Format percentage values
     */
    static formatPercent(value: number | null | undefined): string {
        if (value === null || value === undefined || isNaN(value)) {
            return "-";
        }
        return this.percentFormatter(value);
    }

    /**
     * Format dates based on D3 time format
     */
    static formatDate(date: Date | string | number, formatPattern = "%b %d, %Y"): string {
        const d = date instanceof Date ? date : new Date(date);
        if (isNaN(d.getTime())) {
            return String(date);
        }
        return d3.timeFormat(formatPattern)(d);
    }

    /**
     * Generate an interpolated color from a value range using D3 scale
     */
    static getColorInterpolator(min: number, max: number, interpolator: (t: number) => string) {
        const scale = d3.scaleSequential(interpolator).domain([min, max]);
        return (val: number) => scale(val);
    }
}
