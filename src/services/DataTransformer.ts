export interface ParsedDataPoint {
    x: string | number | Date;
    y: number;
    seriesName: string;
    secondary?: number;
    lat?: number;
    lng?: number;
    tooltip?: string;
    originalItem?: any;
}

export interface TransformedChartData {
    categories: string[];
    series: any[];
    radarIndicators?: { name: string; max?: number }[];
    geoData?: any[];
}

/**
 * Safely extracts a value from a Mendix ListAttributeValue or function
 */
function getMendixAttrValue(attr: any, item: any): any {
    if (!attr || !item) return undefined;
    try {
        if (typeof attr.get === "function") {
            const prop = attr.get(item);
            return prop?.value !== undefined ? prop.value : prop;
        } else if (typeof attr === "function") {
            const prop = attr(item);
            return prop?.value !== undefined ? prop.value : prop;
        } else if (item[attr] !== undefined) {
            return item[attr];
        }
    } catch {
        return undefined;
    }
    return undefined;
}

export class DataTransformer {
    /**
     * Transforms Mendix List Items into structured data points
     */
    static parseMendixItems(
        items: any[],
        xAttr?: any,
        yAttr?: any,
        seriesAttr?: any,
        secondaryAttr?: any,
        latAttr?: any,
        lngAttr?: any,
        tooltipAttr?: any
    ): ParsedDataPoint[] {
        if (!items || !Array.isArray(items)) return [];

        return items.map(item => {
            const rawX = getMendixAttrValue(xAttr, item);
            const rawY = getMendixAttrValue(yAttr, item);
            const rawSeries = getMendixAttrValue(seriesAttr, item);
            const rawSecondary = getMendixAttrValue(secondaryAttr, item);
            const rawLat = getMendixAttrValue(latAttr, item);
            const rawLng = getMendixAttrValue(lngAttr, item);
            const rawTooltip = getMendixAttrValue(tooltipAttr, item);

            const numY = rawY !== null && rawY !== undefined ? Number(rawY) : 0;
            const numSecondary = rawSecondary !== null && rawSecondary !== undefined ? Number(rawSecondary) : undefined;
            const numLat = rawLat !== null && rawLat !== undefined ? Number(rawLat) : undefined;
            const numLng = rawLng !== null && rawLng !== undefined ? Number(rawLng) : undefined;

            return {
                x: rawX !== undefined && rawX !== null ? rawX : "",
                y: isNaN(numY) ? 0 : numY,
                seriesName: rawSeries ? String(rawSeries) : "Default",
                secondary: numSecondary !== undefined && !isNaN(numSecondary) ? numSecondary : undefined,
                lat: numLat !== undefined && !isNaN(numLat) ? numLat : undefined,
                lng: numLng !== undefined && !isNaN(numLng) ? numLng : undefined,
                tooltip: rawTooltip ? String(rawTooltip) : undefined,
                originalItem: item
            };
        });
    }

    /**
     * Transforms an API JSON response or JSON string into structured data points
     */
    static parseApiJson(jsonInput: any, jsonPathRoot?: string): ParsedDataPoint[] {
        if (!jsonInput) return [];

        let rawData = jsonInput;
        if (typeof jsonInput === "string") {
            try {
                rawData = JSON.parse(jsonInput);
            } catch (e) {
                console.error("FastViz: Failed to parse API JSON input", e);
                return [];
            }
        }

        if (jsonPathRoot && rawData && typeof rawData === "object") {
            const parts = jsonPathRoot.split(".");
            for (const part of parts) {
                if (rawData && rawData[part] !== undefined) {
                    rawData = rawData[part];
                }
            }
        }

        if (!Array.isArray(rawData)) {
            return [];
        }

        return rawData.map((item, index) => {
            const x = item.x ?? item.category ?? item.name ?? item.label ?? `Point ${index + 1}`;
            const y = Number(item.y ?? item.value ?? item.measure ?? 0);
            const seriesName = item.series ?? item.group ?? item.type ?? "Default";
            const secondary = item.secondary ?? item.size ?? item.target;
            const lat = item.lat ?? item.latitude;
            const lng = item.lng ?? item.longitude;
            const tooltip = item.tooltip ?? item.description;

            return {
                x,
                y: isNaN(y) ? 0 : y,
                seriesName: String(seriesName),
                secondary: secondary !== undefined ? Number(secondary) : undefined,
                lat: lat !== undefined ? Number(lat) : undefined,
                lng: lng !== undefined ? Number(lng) : undefined,
                tooltip: tooltip ? String(tooltip) : undefined,
                originalItem: item
            };
        });
    }

    /**
     * Converts parsed data points into ECharts categories & series representations
     */
    static buildEChartsStructure(
        dataPoints: ParsedDataPoint[],
        chartType: string
    ): TransformedChartData {
        // Handle Map Choropleth
        if (chartType === "geoMap") {
            const geoData = dataPoints.map(p => ({
                name: String(p.x),
                value: p.y,
                originalItem: p.originalItem
            }));
            return {
                categories: [],
                series: [{
                    type: "map",
                    map: "world",
                    data: geoData,
                    emphasis: {
                        label: { show: true },
                        itemStyle: { areaColor: "#38bdf8" }
                    }
                }],
                geoData
            };
        }

        // Handle Map Geo Scatter
        if (chartType === "geoScatter") {
            const geoScatterData = dataPoints
                .filter(p => p.lat !== undefined && p.lng !== undefined)
                .map(p => ({
                    name: String(p.x || p.tooltip || "Location"),
                    value: [p.lng, p.lat, p.y],
                    originalItem: p.originalItem
                }));

            return {
                categories: [],
                series: [{
                    type: "scatter",
                    coordinateSystem: "geo",
                    data: geoScatterData,
                    symbolSize: (val: any[]) => {
                        const magnitude = val[2] || 10;
                        return Math.max(8, Math.min(40, Math.sqrt(magnitude) * 3));
                    },
                    emphasis: {
                        scale: true,
                        itemStyle: { shadowBlur: 15, shadowColor: "rgba(255, 255, 255, 0.8)" }
                    }
                }],
                geoData: geoScatterData
            };
        }

        // Handle Pie / Rose / Funnel
        if (chartType === "pie" || chartType === "rose" || chartType === "funnel") {
            const pieData = dataPoints.map(p => ({
                name: String(p.x),
                value: p.y,
                originalItem: p.originalItem
            }));

            return {
                categories: pieData.map(d => d.name),
                series: [{
                    type: chartType === "rose" ? "pie" : chartType,
                    roseType: chartType === "rose" ? "radius" : undefined,
                    radius: chartType === "pie" ? ["40%", "72%"] : "70%",
                    data: pieData,
                    emphasis: {
                        itemStyle: {
                            shadowBlur: 10,
                            shadowOffsetX: 0,
                            shadowColor: "rgba(0, 0, 0, 0.5)"
                        }
                    }
                }]
            };
        }

        // Handle Gauge
        if (chartType === "gauge") {
            const primaryPoint = dataPoints[0] || { x: "Score", y: 0, secondary: 100 };
            return {
                categories: [String(primaryPoint.x)],
                series: [{
                    type: "gauge",
                    max: primaryPoint.secondary || 100,
                    progress: { show: true, width: 14 },
                    detail: { valueAnimation: true, formatter: "{value}" },
                    data: [{ value: primaryPoint.y, name: String(primaryPoint.x) }]
                }]
            };
        }

        // Handle Radar
        if (chartType === "radar") {
            const categories = Array.from(new Set(dataPoints.map(p => String(p.x))));
            const seriesNames = Array.from(new Set(dataPoints.map(p => p.seriesName)));

            const indicators = categories.map(cat => {
                const values = dataPoints.filter(p => String(p.x) === cat).map(p => p.y);
                const max = Math.max(...values, 100);
                return { name: cat, max: Math.ceil(max * 1.15) };
            });

            const seriesData = seriesNames.map(sName => {
                const row = categories.map(cat => {
                    const match = dataPoints.find(p => p.seriesName === sName && String(p.x) === cat);
                    return match ? match.y : 0;
                });
                return { name: sName, value: row };
            });

            return {
                categories,
                radarIndicators: indicators,
                series: [{
                    type: "radar",
                    data: seriesData
                }]
            };
        }

        // Handle Treemap / Sunburst
        if (chartType === "treemap" || chartType === "sunburst") {
            const seriesNames = Array.from(new Set(dataPoints.map(p => p.seriesName)));
            const treeData = seriesNames.map(sName => {
                const children = dataPoints
                    .filter(p => p.seriesName === sName)
                    .map(p => ({
                        name: String(p.x),
                        value: p.y,
                        originalItem: p.originalItem
                    }));
                return {
                    name: sName,
                    children
                };
            });

            return {
                categories: [],
                series: [{
                    type: chartType,
                    data: treeData,
                    leafDepth: 2,
                    levels: [
                        { itemStyle: { borderColor: "#555", borderWidth: 2, gapWidth: 2 } },
                        { colorSaturation: [0.35, 0.5], itemStyle: { gapWidth: 1 } }
                    ]
                }]
            };
        }

        // Standard 2D Charts: Bar, Horizontal Bar, Line, Area, Scatter
        const categories = Array.from(new Set(dataPoints.map(p => String(p.x))));
        const seriesNames = Array.from(new Set(dataPoints.map(p => p.seriesName)));

        const series = seriesNames.map(sName => {
            const pointsForSeries = dataPoints.filter(p => p.seriesName === sName);
            const seriesMap = new Map(pointsForSeries.map(p => [String(p.x), p]));

            const data = categories.map(cat => {
                const pt = seriesMap.get(cat);
                if (!pt) return 0;
                if (chartType === "scatter") {
                    return [cat, pt.y, pt.secondary || 15];
                }
                return pt.y;
            });

            return {
                name: sName,
                data,
                itemMapping: categories.map(cat => seriesMap.get(cat)?.originalItem)
            };
        });

        return {
            categories,
            series
        };
    }
}
