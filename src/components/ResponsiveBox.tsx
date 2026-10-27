import { createElement, FC, useEffect, useRef } from "react";
import * as echarts from "echarts";

export interface ResponsiveBoxProps {
    option: any;
    height: string;
    onPointClick?: (params: any) => void;
    className?: string;
    style?: React.CSSProperties;
}

export const ResponsiveBox: FC<ResponsiveBoxProps> = ({
    option,
    height,
    onPointClick,
    className,
    style
}) => {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const chartInstanceRef = useRef<echarts.ECharts | null>(null);
    const resizeObserverRef = useRef<ResizeObserver | null>(null);
    const clickHandlerRef = useRef(onPointClick);

    // Keep the click handler ref up to date
    useEffect(() => {
        clickHandlerRef.current = onPointClick;
    }, [onPointClick]);

    useEffect(() => {
        if (!containerRef.current) return;

        // Initialize ECharts instance
        const chart = echarts.init(containerRef.current, undefined, {
            renderer: "canvas"
        });
        chartInstanceRef.current = chart;

        // Click listener
        chart.on("click", (params: any) => {
            if (clickHandlerRef.current) {
                clickHandlerRef.current(params);
            }
        });

        // Debounced resize observer for mobile & desktop window/layout changes
        let resizeTimeout: any = null;
        resizeObserverRef.current = new ResizeObserver(() => {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                if (chartInstanceRef.current && !chartInstanceRef.current.isDisposed()) {
                    chartInstanceRef.current.resize({
                        animation: { duration: 250, easing: "cubicOut" }
                    });
                }
            }, 80);
        });

        resizeObserverRef.current.observe(containerRef.current);

        return () => {
            if (resizeObserverRef.current) {
                resizeObserverRef.current.disconnect();
            }
            if (chartInstanceRef.current) {
                chartInstanceRef.current.dispose();
                chartInstanceRef.current = null;
            }
        };
    }, []);

    // Update chart option whenever it changes
    useEffect(() => {
        if (chartInstanceRef.current && option) {
            chartInstanceRef.current.setOption(option, true);
        }
    }, [option]);

    return (
        <div
            className={`fast-viz-container ${className || ""}`}
            style={{
                width: "100%",
                height: height || "420px",
                position: "relative",
                touchAction: "pan-y",
                ...style
            }}
            ref={containerRef}
        />
    );
};
