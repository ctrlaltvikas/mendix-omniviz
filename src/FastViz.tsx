import { createElement, FC, useMemo, useEffect, useState, useCallback } from "react";
import { ResponsiveBox } from "./components/ResponsiveBox";
import { DataTransformer, ParsedDataPoint } from "./services/DataTransformer";
import { getThemeConfig } from "./services/ThemeEngine";
import { GeoMapService } from "./services/GeoMapService";
import { D3Formatters } from "./services/D3Formatters";

export interface FastVizProps {
    chartType: string;
    themePreset: string;
    title?: string;
    subtitle?: string;
    height?: string;
    dataRoute: "mendix" | "api";
    mendixDatasource?: any;
    xAttribute?: any;
    yAttribute?: any;
    seriesAttribute?: any;
    secondaryAttribute?: any;
    latAttribute?: any;
    lngAttribute?: any;
    tooltipAttribute?: any;
    apiUrlOrJson?: { value?: string };
    apiRefreshInterval?: number;
    jsonPathRoot?: string;
    mapGeoJsonUrl?: { value?: string };
    mapVisualMin?: number;
    mapVisualMax?: number;
    mapRoam?: boolean;
    legendPosition?: "top" | "bottom" | "left" | "right" | "none";
    enableDataZoom?: boolean;
    showToolbox?: boolean;
    smoothCurves?: boolean;
    donutRatio?: string;
    onClickAction?: any;
    customJsonOptions?: { value?: string };
}

export const FastViz: FC<FastVizProps> = (props) => {
    const [apiData, setApiData] = useState<any>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);

    // 1. Initialize Map engine if geo chart is requested
    useEffect(() => {
        GeoMapService.initDefaultMap();
        if (props.mapGeoJsonUrl?.value) {
            GeoMapService.loadCustomGeoJson("userGeoMap", props.mapGeoJsonUrl.value).then(() => {
                setMapReady(true);
            });
        } else {
            setMapReady(true);
        }
    }, [props.mapGeoJsonUrl?.value]);

    // 2. Route B: Fetch REST API or parse JSON expression with auto-refresh polling
    useEffect(() => {
        if (props.dataRoute !== "api" || !props.apiUrlOrJson?.value) {
            return;
        }

        const fetchOrParse = async () => {
            const rawVal = props.apiUrlOrJson?.value?.trim();
            if (!rawVal) return;

            // Direct JSON string check
            if (rawVal.startsWith("[") || rawVal.startsWith("{")) {
                try {
                    setApiData(JSON.parse(rawVal));
                } catch {
                    // Not valid JSON, try fetching as URL
                }
                return;
            }

            // Otherwise, fetch as REST API URL
            try {
                const res = await fetch(rawVal);
                if (res.ok) {
                    const json = await res.json();
                    setApiData(json);
                }
            } catch (err) {
                console.error("FastViz: API Route Fetch failed:", err);
            }
        };

        fetchOrParse();

        const intervalSec = props.apiRefreshInterval || 0;
        if (intervalSec > 0) {
            const timer = setInterval(fetchOrParse, intervalSec * 1000);
            return () => clearInterval(timer);
        }
    }, [props.dataRoute, props.apiUrlOrJson?.value, props.apiRefreshInterval]);

    // 3. Parse Data Points from Mendix Datasource or API
    const parsedDataPoints: ParsedDataPoint[] = useMemo(() => {
        if (props.dataRoute === "mendix") {
            const items = props.mendixDatasource?.items || [];
            return DataTransformer.parseMendixItems(
                items,
                props.xAttribute,
                props.yAttribute,
                props.seriesAttribute,
                props.secondaryAttribute,
                props.latAttribute,
                props.lngAttribute,
                props.tooltipAttribute
            );
        } else {
            return DataTransformer.parseApiJson(apiData, props.jsonPathRoot);
        }
    }, [
        props.dataRoute,
        props.mendixDatasource?.items,
        props.xAttribute,
        props.yAttribute,
        props.seriesAttribute,
        props.secondaryAttribute,
        props.latAttribute,
        props.lngAttribute,
        props.tooltipAttribute,
        apiData,
        props.jsonPathRoot
    ]);

    // 4. Transform into ECharts Structure
    const transformed = useMemo(() => {
        return DataTransformer.buildEChartsStructure(parsedDataPoints, props.chartType);
    }, [parsedDataPoints, props.chartType]);

    // 5. Build Complete High-Performance ECharts Option
    const option = useMemo(() => {
        const theme = getThemeConfig(props.themePreset || "uberDark");
        const chartType = props.chartType || "bar";
        const isCartesian = ["bar", "horizontalBar", "stackedBar", "line", "area", "stackedArea", "scatter"].includes(chartType);

        // Legend configuration
        const legendPos = props.legendPosition || "top";
        const legendConfig = legendPos === "none" ? { show: false } : {
            show: true,
            orient: legendPos === "left" || legendPos === "right" ? "vertical" : "horizontal",
            top: legendPos === "top" ? 15 : undefined,
            bottom: legendPos === "bottom" ? 10 : undefined,
            left: legendPos === "left" ? 10 : undefined,
            right: legendPos === "right" ? 10 : undefined,
            textStyle: { color: theme.textColor, fontSize: 12 },
            type: "scroll" // Auto horizontal scroll for mobile
        };

        // Toolbox controls
        const toolboxConfig = props.showToolbox ? {
            show: true,
            right: 15,
            top: 10,
            iconStyle: { borderColor: theme.subTextColor },
            feature: {
                saveAsImage: { show: true, title: "Export Image" },
                dataView: { show: true, title: "Data Grid", readOnly: true },
                restore: { show: true, title: "Reset Zoom" }
            }
        } : undefined;

        // Base options
        const baseOption: any = {
            backgroundColor: theme.background,
            color: theme.colorPalette,
            title: props.title ? {
                text: props.title,
                subtext: props.subtitle || "",
                left: 15,
                top: 10,
                textStyle: { color: theme.textColor, fontWeight: "600", fontSize: 16 },
                subtextStyle: { color: theme.subTextColor, fontSize: 12 }
            } : undefined,
            tooltip: {
                trigger: chartType === "pie" || chartType === "rose" || chartType === "geoMap" ? "item" : "axis",
                axisPointer: { type: "cross" },
                backgroundColor: theme.tooltipBg,
                borderColor: theme.tooltipBorder,
                textStyle: { color: theme.textColor },
                formatter: (params: any) => {
                    if (Array.isArray(params)) {
                        let res = `<div style="font-weight:600;margin-bottom:4px;">${params[0]?.axisValue || ""}</div>`;
                        params.forEach((p: any) => {
                            const valStr = D3Formatters.formatSmartNumber(p.value);
                            res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                                <span>${p.marker} ${p.seriesName}</span>
                                <span style="font-weight:600;">${valStr}</span>
                            </div>`;
                        });
                        return res;
                    }
                    return `${params.name}: <b>${D3Formatters.formatSmartNumber(params.value)}</b>`;
                }
            },
            legend: legendConfig,
            toolbox: toolboxConfig
        };

        // Handle Map Choropleth & Geo Scatter
        if (chartType === "geoMap" || chartType === "geoScatter") {
            const mapName = props.mapGeoJsonUrl?.value ? "userGeoMap" : "world";
            baseOption.geo = {
                map: mapName,
                roam: props.mapRoam ?? true,
                emphasis: {
                    label: { show: false },
                    itemStyle: { areaColor: "#2563eb" }
                },
                itemStyle: {
                    areaColor: theme.axisColor,
                    borderColor: theme.splitLineColor
                }
            };

            if (chartType === "geoMap") {
                baseOption.visualMap = {
                    min: props.mapVisualMin ?? 0,
                    max: props.mapVisualMax ?? 1000,
                    text: ["High", "Low"],
                    realtime: false,
                    calculable: true,
                    inRange: { color: theme.visualMapColors },
                    textStyle: { color: theme.textColor }
                };
            }
            baseOption.series = transformed.series;
            return baseOption;
        }

        // Handle Radar
        if (chartType === "radar") {
            baseOption.radar = {
                indicator: transformed.radarIndicators || [],
                shape: "polygon",
                splitLine: { lineStyle: { color: theme.splitLineColor } },
                splitArea: { show: false },
                axisLine: { lineStyle: { color: theme.axisColor } }
            };
            baseOption.series = transformed.series;
            return baseOption;
        }

        // Handle Pie / Rose / Gauge / Funnel / Treemap / Sunburst
        if (!isCartesian) {
            baseOption.series = transformed.series;
            return baseOption;
        }

        // Cartesian Grid layout & Mobile Zoom
        const hasTitle = Boolean(props.title);
        baseOption.grid = {
            left: "3%",
            right: "4%",
            top: hasTitle ? 65 : 45,
            bottom: props.enableDataZoom ? 55 : 25,
            containLabel: true
        };

        if (props.enableDataZoom) {
            baseOption.dataZoom = [
                {
                    type: "slider",
                    show: true,
                    height: 18,
                    bottom: 12,
                    borderColor: theme.axisColor,
                    fillerColor: "rgba(100, 150, 255, 0.15)",
                    textStyle: { color: theme.subTextColor }
                },
                {
                    type: "inside" // Native touch pinch-to-zoom & drag for mobile
                }
            ];
        }

        // Axes definition
        const isHorizontal = chartType === "horizontalBar";
        const categoryAxis = {
            type: "category",
            data: transformed.categories,
            axisLine: { lineStyle: { color: theme.axisColor } },
            axisLabel: { color: theme.subTextColor, fontSize: 11 }
        };
        const valueAxis = {
            type: "value",
            axisLine: { lineStyle: { color: theme.axisColor } },
            splitLine: { lineStyle: { color: theme.splitLineColor } },
            axisLabel: {
                color: theme.subTextColor,
                formatter: (v: number) => D3Formatters.formatSmartNumber(v)
            }
        };

        baseOption.xAxis = isHorizontal ? valueAxis : categoryAxis;
        baseOption.yAxis = isHorizontal ? categoryAxis : valueAxis;

        // Series definition
        const isStacked = chartType === "stackedBar" || chartType === "stackedArea";
        const isArea = chartType === "area" || chartType === "stackedArea";
        const isLine = chartType === "line" || isArea;

        baseOption.series = transformed.series.map(s => {
            const actualType = (chartType === "horizontalBar" || chartType === "stackedBar") ? "bar" : (isLine ? "line" : chartType);
            return {
                ...s,
                type: actualType,
                stack: isStacked ? "total" : undefined,
                smooth: isLine ? Boolean(props.smoothCurves) : false,
                areaStyle: isArea ? { opacity: 0.35 } : undefined,
                emphasis: { focus: "series" },
                barMaxWidth: 48
            };
        });

        // Advanced custom JSON override deep merge
        if (props.customJsonOptions?.value) {
            try {
                const customObj = JSON.parse(props.customJsonOptions.value);
                return Object.assign({}, baseOption, customObj);
            } catch (e) {
                console.warn("FastViz: Custom JSON Override parsing failed", e);
            }
        }

        return baseOption;
    }, [
        props.chartType,
        props.themePreset,
        props.title,
        props.subtitle,
        props.legendPosition,
        props.showToolbox,
        props.enableDataZoom,
        props.smoothCurves,
        props.mapGeoJsonUrl?.value,
        props.mapRoam,
        props.mapVisualMin,
        props.mapVisualMax,
        transformed,
        props.customJsonOptions?.value
    ]);

    // 6. Handle Data Point Click Event (Bridge to Mendix Microflow / Nanoflow)
    const handlePointClick = useCallback((params: any) => {
        if (!props.onClickAction) return;

        // Find the matching Mendix Object
        let matchedItem: any = null;

        if (transformed.series?.[params.seriesIndex]?.itemMapping) {
            matchedItem = transformed.series[params.seriesIndex].itemMapping[params.dataIndex];
        } else if (transformed.series?.[params.seriesIndex]?.data?.[params.dataIndex]?.originalItem) {
            matchedItem = transformed.series[params.seriesIndex].data[params.dataIndex].originalItem;
        } else if (transformed.geoData?.[params.dataIndex]?.originalItem) {
            matchedItem = transformed.geoData[params.dataIndex].originalItem;
        }

        if (matchedItem && props.onClickAction.canExecute) {
            props.onClickAction.execute(matchedItem);
        }
    }, [props.onClickAction, transformed]);

    return (
        <ResponsiveBox
            option={option}
            height={props.height || "420px"}
            onPointClick={handlePointClick}
        />
    );
};

export default FastViz;
