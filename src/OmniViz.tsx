import { createElement, FC, useMemo, useEffect, useState, useCallback } from "react";
import { ResponsiveBox } from "./components/ResponsiveBox";
import { BreadcrumbNav, BreadcrumbNode } from "./components/BreadcrumbNav";
import { DataTransformer, ParsedDataPoint } from "./services/DataTransformer";
import { getThemeConfig } from "./services/ThemeEngine";
import { GeoMapService } from "./services/GeoMapService";
import { D3Formatters } from "./services/D3Formatters";

export interface OmniVizProps {
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
    idAttribute?: any;
    parentIdAttribute?: any;
    levelAttribute?: any;
    latAttribute?: any;
    lngAttribute?: any;
    tooltipAttribute?: any;
    apiUrlOrJson?: { value?: string };
    apiRefreshInterval?: number;
    jsonPathRoot?: string;
    enableBenchmarkLine?: boolean;
    benchmarkValue?: { value?: number };
    benchmarkLabel?: string;
    enableRAGColoring?: boolean;
    ragRedThreshold?: { value?: number };
    ragGreenThreshold?: { value?: number };
    sortMode?: "none" | "descending" | "ascending" | "topBottomN";
    topBottomCount?: number;
    enableBreadcrumb?: boolean;
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

export const OmniViz: FC<OmniVizProps> = (props) => {
    const [apiData, setApiData] = useState<any>(null);
    const [mapReady, setMapReady] = useState<boolean>(false);
    const [drillPath, setDrillPath] = useState<BreadcrumbNode[]>([
        { id: "ROOT", name: "National / All", level: "National" }
    ]);

    const activeNode = drillPath[drillPath.length - 1];
    const activeParentId = activeNode.id === "ROOT" ? undefined : activeNode.id;

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

            if (rawVal.startsWith("[") || rawVal.startsWith("{")) {
                try {
                    setApiData(JSON.parse(rawVal));
                } catch {
                    // Not valid JSON, try fetching as URL
                }
                return;
            }

            try {
                const res = await fetch(rawVal);
                if (res.ok) {
                    const json = await res.json();
                    setApiData(json);
                }
            } catch (err) {
                console.error("OmniViz: API Route Fetch failed:", err);
            }
        };

        fetchOrParse();

        const intervalSec = props.apiRefreshInterval || 0;
        if (intervalSec > 0) {
            const timer = setInterval(fetchOrParse, intervalSec * 1000);
            return () => clearInterval(timer);
        }
    }, [props.dataRoute, props.apiUrlOrJson?.value, props.apiRefreshInterval]);

    // 3. Raw Parsed Data Points
    const rawDataPoints: ParsedDataPoint[] = useMemo(() => {
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
                props.tooltipAttribute,
                props.idAttribute,
                props.parentIdAttribute,
                props.levelAttribute
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
        props.idAttribute,
        props.parentIdAttribute,
        props.levelAttribute,
        apiData,
        props.jsonPathRoot
    ]);

    // 4. Process Data: Hierarchy drill-down filtering, sorting, and RAG performance coloring
    const processedPoints: ParsedDataPoint[] = useMemo(() => {
        return DataTransformer.processDataPoints(rawDataPoints, {
            activeParentId,
            sortMode: props.sortMode,
            topBottomCount: props.topBottomCount,
            enableRAGColoring: props.enableRAGColoring,
            ragRedThreshold: props.ragRedThreshold?.value ? Number(props.ragRedThreshold.value) : 60,
            ragGreenThreshold: props.ragGreenThreshold?.value ? Number(props.ragGreenThreshold.value) : 90
        });
    }, [
        rawDataPoints,
        activeParentId,
        props.sortMode,
        props.topBottomCount,
        props.enableRAGColoring,
        props.ragRedThreshold?.value,
        props.ragGreenThreshold?.value
    ]);

    // 5. Transform into ECharts Structure
    const transformed = useMemo(() => {
        return DataTransformer.buildEChartsStructure(processedPoints, props.chartType);
    }, [processedPoints, props.chartType]);

    // 6. Build Complete High-Performance ECharts Option
    const theme = useMemo(() => getThemeConfig(props.themePreset || "uberDark"), [props.themePreset]);

    const option = useMemo(() => {
        const chartType = props.chartType || "bar";
        const isCartesian = ["bar", "horizontalBar", "stackedBar", "line", "area", "stackedArea", "scatter"].includes(chartType);
        const isHorizontal = chartType === "horizontalBar";

        const legendPos = props.legendPosition || "top";
        const legendConfig = legendPos === "none" ? { show: false } : {
            show: true,
            orient: legendPos === "left" || legendPos === "right" ? "vertical" : "horizontal",
            top: legendPos === "top" ? 15 : undefined,
            bottom: legendPos === "bottom" ? 10 : undefined,
            left: legendPos === "left" ? 10 : undefined,
            right: legendPos === "right" ? 10 : undefined,
            textStyle: { color: theme.textColor, fontSize: 12 },
            type: "scroll"
        };

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

        // Dynamic subtitle reflecting active drill level
        const currentSubtitle = drillPath.length > 1
            ? `${props.subtitle || ""} [Level: ${activeNode.name}]`
            : props.subtitle || "";

        const baseOption: any = {
            backgroundColor: theme.background,
            color: theme.colorPalette,
            title: props.title ? {
                text: props.title,
                subtext: currentSubtitle,
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
                            const valStr = D3Formatters.formatSmartNumber(typeof p.value === "object" ? p.value?.value : p.value);
                            res += `<div style="display:flex;align-items:center;justify-content:space-between;gap:12px;">
                                <span>${p.marker} ${p.seriesName}</span>
                                <span style="font-weight:600;">${valStr}</span>
                            </div>`;
                        });
                        return res;
                    }
                    const rawVal = typeof params.value === "object" ? params.value?.value : params.value;
                    return `${params.name}: <b>${D3Formatters.formatSmartNumber(rawVal)}</b>`;
                }
            },
            legend: legendConfig,
            toolbox: toolboxConfig
        };

        // Map Choropleth & Geo Scatter
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

        // Radar
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

        // Non-Cartesian
        if (!isCartesian) {
            baseOption.series = transformed.series;
            return baseOption;
        }

        // Cartesian Grid layout & Mobile Zoom
        const hasTitle = Boolean(props.title);
        baseOption.grid = {
            left: "3%",
            right: "5%",
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
                    type: "inside"
                }
            ];
        }

        // Axes definition
        const categoryAxis = {
            type: "category",
            data: transformed.categories,
            axisLine: { lineStyle: { color: theme.axisColor } },
            axisLabel: {
                color: theme.subTextColor,
                fontSize: 11,
                interval: 0,
                rotate: transformed.categories.length > 8 && !isHorizontal ? 35 : 0
            }
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

        // Series definition & Benchmark Reference Line
        const isStacked = chartType === "stackedBar" || chartType === "stackedArea";
        const isArea = chartType === "area" || chartType === "stackedArea";
        const isLine = chartType === "line" || isArea;

        // Benchmark line setup
        const benchmarkNum = props.benchmarkValue?.value !== undefined ? Number(props.benchmarkValue.value) : undefined;
        const markLineConfig = (props.enableBenchmarkLine && benchmarkNum !== undefined) ? {
            silent: true,
            symbol: ["none", "none"],
            lineStyle: {
                type: "dashed",
                width: 2,
                color: "#f43f5e"
            },
            label: {
                show: true,
                position: isHorizontal ? "end" : "end",
                formatter: `${props.benchmarkLabel || "Benchmark"}: ${D3Formatters.formatSmartNumber(benchmarkNum)}`,
                color: theme.textColor,
                fontSize: 11,
                fontWeight: "bold"
            },
            data: [
                isHorizontal
                    ? { xAxis: benchmarkNum }
                    : { yAxis: benchmarkNum }
            ]
        } : undefined;

        baseOption.series = transformed.series.map((s, idx) => {
            const actualType = (chartType === "horizontalBar" || chartType === "stackedBar") ? "bar" : (isLine ? "line" : chartType);
            return {
                ...s,
                type: actualType,
                stack: isStacked ? "total" : undefined,
                smooth: isLine ? Boolean(props.smoothCurves) : false,
                areaStyle: isArea ? { opacity: 0.35 } : undefined,
                emphasis: { focus: "series" },
                barMaxWidth: 48,
                markLine: idx === 0 ? markLineConfig : undefined
            };
        });

        // Advanced custom JSON override deep merge
        if (props.customJsonOptions?.value) {
            try {
                const customObj = JSON.parse(props.customJsonOptions.value);
                return Object.assign({}, baseOption, customObj);
            } catch (e) {
                console.warn("OmniViz: Custom JSON Override parsing failed", e);
            }
        }

        return baseOption;
    }, [
        props.chartType,
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
        props.enableBenchmarkLine,
        props.benchmarkValue?.value,
        props.benchmarkLabel,
        transformed,
        theme,
        drillPath,
        activeNode.name,
        props.customJsonOptions?.value
    ]);

    // 7. Handle Data Point Click Event & Hierarchical Drill-Down
    const handlePointClick = useCallback((params: any) => {
        let clickedId: string | undefined;
        let clickedName: string | undefined;
        let matchedItem: any = null;

        const seriesObj = transformed.series?.[params.seriesIndex];
        if (seriesObj?.idMapping) {
            clickedId = seriesObj.idMapping[params.dataIndex];
            clickedName = seriesObj.nameMapping?.[params.dataIndex];
            matchedItem = seriesObj.itemMapping?.[params.dataIndex];
        } else if (transformed.geoData?.[params.dataIndex]) {
            const geoItem = transformed.geoData[params.dataIndex];
            clickedId = geoItem.id;
            clickedName = geoItem.name;
            matchedItem = geoItem.originalItem;
        }

        // Check if there are children under this clicked node
        if (clickedId) {
            const hasChildren = rawDataPoints.some(p => p.parentId === clickedId);
            if (hasChildren) {
                setDrillPath(prev => [
                    ...prev,
                    { id: clickedId!, name: String(clickedName || clickedId) }
                ]);
            }
        }

        // Bridge to Mendix Microflow / Nanoflow
        if (matchedItem && props.onClickAction && props.onClickAction.canExecute) {
            props.onClickAction.execute(matchedItem);
        }
    }, [props.onClickAction, transformed, rawDataPoints]);

    // Handle Breadcrumb navigation back up the hierarchy
    const handleBreadcrumbNavigate = useCallback((_node: BreadcrumbNode, index: number) => {
        setDrillPath(prev => prev.slice(0, index + 1));
    }, []);

    return (
        <div className="omni-viz-wrapper" style={{ width: "100%", position: "relative" }}>
            {props.enableBreadcrumb && (
                <BreadcrumbNav
                    trail={drillPath}
                    onNavigate={handleBreadcrumbNavigate}
                    textColor={theme.textColor}
                    subTextColor={theme.subTextColor}
                />
            )}
            <ResponsiveBox
                option={option}
                height={props.height || "440px"}
                onPointClick={handlePointClick}
            />
        </div>
    );
};

export default OmniViz;
