export interface ParsedDataPoint {
    id: string;
    parentId?: string;
    level?: string;
    x: string | number | Date;
    y: number;
    seriesName: string;
    secondary?: number;
    lat?: number;
    lng?: number;
    tooltip?: string;
    originalItem?: any;
    color?: string;
}

export interface TransformedChartData {
    categories: string[];
    series: any[];
    radarIndicators?: { name: string; max?: number }[];
    geoData?: any[];
}

export interface DataFilterOptions {
    activeParentId?: string;
    sortMode?: "none" | "descending" | "ascending" | "topBottomN";
    topBottomCount?: number;
    enableRAGColoring?: boolean;
    ragRedThreshold?: number;
    ragGreenThreshold?: number;
}

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
    static parseMendixItems(
        items: any[],
        xAttr?: any,
        yAttr?: any,
        seriesAttr?: any,
        secondaryAttr?: any,
        latAttr?: any,
        lngAttr?: any,
        tooltipAttr?: any,
        idAttr?: any,
        parentIdAttr?: any,
        levelAttr?: any
    ): ParsedDataPoint[] {
        if (!items || !Array.isArray(items)) return [];

        return items.map((item, index) => {
            const rawX = getMendixAttrValue(xAttr, item);
            const rawY = getMendixAttrValue(yAttr, item);
            const rawSeries = getMendixAttrValue(seriesAttr, item);
            const rawSecondary = getMendixAttrValue(secondaryAttr, item);
            const rawLat = getMendixAttrValue(latAttr, item);
            const rawLng = getMendixAttrValue(lngAttr, item);
            const rawTooltip = getMendixAttrValue(tooltipAttr, item);
            const rawId = getMendixAttrValue(idAttr, item);
            const rawParentId = getMendixAttrValue(parentIdAttr, item);
            const rawLevel = getMendixAttrValue(levelAttr, item);

            const numY = rawY !== null && rawY !== undefined ? Number(rawY) : 0;
            const numSecondary = rawSecondary !== null && rawSecondary !== undefined ? Number(rawSecondary) : undefined;
            const numLat = rawLat !== null && rawLat !== undefined ? Number(rawLat) : undefined;
            const numLng = rawLng !== null && rawLng !== undefined ? Number(rawLng) : undefined;

            const fallbackId = String(rawId || rawX || `point-${index}`);

            return {
                id: fallbackId,
                parentId: rawParentId !== undefined && rawParentId !== null ? String(rawParentId) : undefined,
                level: rawLevel ? String(rawLevel) : undefined,
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

    static parseApiJson(jsonInput: any, jsonPathRoot?: string): ParsedDataPoint[] {
        if (!jsonInput) return [];

        let rawData = jsonInput;
        if (typeof jsonInput === "string") {
            try {
                rawData = JSON.parse(jsonInput);
            } catch (e) {
                console.error("OmniViz: Failed to parse API JSON input", e);
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
            const id = String(item.id ?? x);
            const parentId = item.parentId ? String(item.parentId) : undefined;
            const level = item.level ? String(item.level) : undefined;

            return {
                id,
                parentId,
                level,
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
     * Filters, sorts, and applies performance RAG coloring
     */
    static processDataPoints(
        points: ParsedDataPoint[],
        options: DataFilterOptions
    ): ParsedDataPoint[] {
        let result = [...points];

        // 1. Hierarchical Filter (if parent-child hierarchy exists)
        const hasHierarchy = points.some(p => p.parentId !== undefined);
        if (hasHierarchy) {
            if (options.activeParentId) {
                result = result.filter(p => p.parentId === options.activeParentId);
            } else {
                // Root view: items without parentId or level === 'National'
                result = result.filter(p => !p.parentId || p.level?.toLowerCase() === "national");
            }
        }

        // 2. Sorting & Performer Isolation
        const sortMode = options.sortMode || "none";
        if (sortMode === "descending") {
            result.sort((a, b) => b.y - a.y);
        } else if (sortMode === "ascending") {
            result.sort((a, b) => a.y - b.y);
        } else if (sortMode === "topBottomN") {
            const count = options.topBottomCount || 5;
            if (result.length > count * 2) {
                const sorted = [...result].sort((a, b) => b.y - a.y);
                const topN = sorted.slice(0, count);
                const bottomN = sorted.slice(-count);
                result = [...topN, ...bottomN];
            }
        }

        // 3. Dynamic RAG Performance Coloring
        const redThreshold = options.ragRedThreshold ?? 60;
        const greenThreshold = options.ragGreenThreshold ?? 90;

        if (options.enableRAGColoring) {
            result = result.map(p => {
                let color = "#f59e0b"; // Amber (On-track)
                if (p.y < redThreshold) {
                    color = "#ef4444"; // Red (Critical Alert / Underperforming)
                } else if (p.y >= greenThreshold) {
                    color = "#10b981"; // Green (Star Performer)
                }
                return { ...p, color };
            });
        }

        return result;
    }

    static buildEChartsStructure(
        dataPoints: ParsedDataPoint[],
        chartType: string
    ): TransformedChartData {
        // Map Choropleth
        if (chartType === "geoMap") {
            const geoData = dataPoints.map(p => ({
                name: String(p.x),
                value: p.y,
                id: p.id,
                parentId: p.parentId,
                originalItem: p.originalItem,
                itemStyle: p.color ? { areaColor: p.color } : undefined
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

        // Map Geo Scatter
        if (chartType === "geoScatter") {
            const geoScatterData = dataPoints
                .filter(p => p.lat !== undefined && p.lng !== undefined)
                .map(p => ({
                    name: String(p.x || p.tooltip || "Location"),
                    value: [p.lng, p.lat, p.y],
                    id: p.id,
                    parentId: p.parentId,
                    originalItem: p.originalItem,
                    itemStyle: p.color ? { color: p.color } : undefined
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

        // Pie / Rose / Funnel
        if (chartType === "pie" || chartType === "rose" || chartType === "funnel") {
            const pieData = dataPoints.map(p => ({
                name: String(p.x),
                value: p.y,
                id: p.id,
                originalItem: p.originalItem,
                itemStyle: p.color ? { color: p.color } : undefined
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

        // Gauge
        if (chartType === "gauge") {
            const primaryPoint: ParsedDataPoint = dataPoints[0] || {
                id: "root",
                x: "Score",
                y: 0,
                secondary: 100,
                seriesName: "Default"
            };
            return {
                categories: [String(primaryPoint.x)],
                series: [{
                    type: "gauge",
                    max: primaryPoint.secondary || 100,
                    progress: { show: true, width: 14 },
                    detail: { valueAnimation: true, formatter: "{value}" },
                    data: [{
                        value: primaryPoint.y,
                        name: String(primaryPoint.x),
                        itemStyle: primaryPoint.color ? { color: primaryPoint.color } : undefined
                    }]
                }]
            };
        }

        // Radar
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

        // Treemap / Sunburst (Hierarchical)
        if (chartType === "treemap" || chartType === "sunburst") {
            const seriesNames = Array.from(new Set(dataPoints.map(p => p.seriesName)));
            const treeData = seriesNames.map(sName => {
                const children = dataPoints
                    .filter(p => p.seriesName === sName)
                    .map(p => ({
                        name: String(p.x),
                        value: p.y,
                        id: p.id,
                        originalItem: p.originalItem,
                        itemStyle: p.color ? { color: p.color } : undefined
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
                    return {
                        value: [cat, pt.y, pt.secondary || 15],
                        itemStyle: pt.color ? { color: pt.color } : undefined
                    };
                }
                // Support individual data point styling (RAG colors)
                if (pt.color) {
                    return {
                        value: pt.y,
                        itemStyle: { color: pt.color }
                    };
                }
                return pt.y;
            });

            return {
                name: sName,
                data,
                itemMapping: categories.map(cat => seriesMap.get(cat)?.originalItem),
                idMapping: categories.map(cat => seriesMap.get(cat)?.id),
                nameMapping: categories.map(cat => seriesMap.get(cat)?.x)
            };
        });

        return {
            categories,
            series
        };
    }
}
