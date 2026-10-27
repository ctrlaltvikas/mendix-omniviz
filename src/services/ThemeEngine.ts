import * as d3 from "d3";

export interface ThemeConfig {
    name: string;
    background: string;
    textColor: string;
    subTextColor: string;
    axisColor: string;
    splitLineColor: string;
    tooltipBg: string;
    tooltipBorder: string;
    colorPalette: string[];
    visualMapColors: string[];
}

// Uber-inspired dark theme
const uberDarkTheme: ThemeConfig = {
    name: "uberDark",
    background: "#0d0f12",
    textColor: "#e0e6ed",
    subTextColor: "#8b949e",
    axisColor: "#30363d",
    splitLineColor: "#21262d",
    tooltipBg: "rgba(22, 27, 34, 0.95)",
    tooltipBorder: "#30363d",
    colorPalette: [
        "#00D2D3", // Electric Teal
        "#54a0ff", // Bright Blue
        "#ff6b6b", // Coral
        "#feca57", // Warm Amber
        "#1dd1a1", // Mint
        "#5f27cd", // Royal Purple
        "#ff9ff3", // Pink
        "#48dbfb"  // Sky
    ],
    visualMapColors: ["#ff4757", "#ffa502", "#2ed573", "#1e90ff"]
};

// Clean Enterprise Light theme
const cleanModernTheme: ThemeConfig = {
    name: "cleanModern",
    background: "#ffffff",
    textColor: "#2d3748",
    subTextColor: "#718096",
    axisColor: "#e2e8f0",
    splitLineColor: "#edf2f7",
    tooltipBg: "rgba(255, 255, 255, 0.96)",
    tooltipBorder: "#cbd5e1",
    colorPalette: [
        "#2563eb", // Primary Blue
        "#0d9488", // Teal
        "#f59e0b", // Amber
        "#ef4444", // Rose
        "#8b5cf6", // Violet
        "#06b6d4", // Cyan
        "#10b981"  // Emerald
    ],
    visualMapColors: ["#dbeafe", "#60a5fa", "#2563eb", "#1e40af"]
};

// Cyberpunk Neon theme
const cyberNeonTheme: ThemeConfig = {
    name: "cyberNeon",
    background: "#05070e",
    textColor: "#f8fafc",
    subTextColor: "#94a3b8",
    axisColor: "#1e293b",
    splitLineColor: "#111827",
    tooltipBg: "rgba(15, 23, 42, 0.95)",
    tooltipBorder: "#38bdf8",
    colorPalette: [
        "#38bdf8", // Sky Neon
        "#f43f5e", // Rose Neon
        "#a855f7", // Violet Neon
        "#22c55e", // Green Neon
        "#eab308", // Yellow Neon
        "#ec4899"  // Hot Pink
    ],
    visualMapColors: ["#091e3a", "#0284c7", "#38bdf8", "#ec4899"]
};

// D3 Viridis Palette
const d3ViridisTheme: ThemeConfig = {
    name: "d3Viridis",
    background: "#121418",
    textColor: "#e5e7eb",
    subTextColor: "#9ca3af",
    axisColor: "#374151",
    splitLineColor: "#1f2937",
    tooltipBg: "rgba(17, 24, 39, 0.95)",
    tooltipBorder: "#4b5563",
    colorPalette: d3.range(0, 1.05, 0.15).map(t => d3.interpolateViridis(t)),
    visualMapColors: ["#fde725", "#35b779", "#31688e", "#440154"]
};

// D3 Turbo Palette
const d3TurboTheme: ThemeConfig = {
    name: "d3Turbo",
    background: "#0f172a",
    textColor: "#f1f5f9",
    subTextColor: "#94a3b8",
    axisColor: "#334155",
    splitLineColor: "#1e293b",
    tooltipBg: "rgba(30, 41, 59, 0.95)",
    tooltipBorder: "#475569",
    colorPalette: d3.range(0.1, 0.95, 0.12).map(t => d3.interpolateTurbo(t)),
    visualMapColors: ["#900c3f", "#c70039", "#ff5733", "#ffc300"]
};

// Pastel Minimal theme
const pastelTheme: ThemeConfig = {
    name: "pastel",
    background: "#fafaf9",
    textColor: "#44403c",
    subTextColor: "#78716c",
    axisColor: "#e7e5e4",
    splitLineColor: "#f5f5f4",
    tooltipBg: "rgba(255, 255, 255, 0.96)",
    tooltipBorder: "#d6d3d1",
    colorPalette: [
        "#93c5fd", // Soft Blue
        "#86efac", // Soft Green
        "#fca5a5", // Soft Red
        "#fde047", // Soft Yellow
        "#d8b4fe", // Soft Purple
        "#fdba74"  // Soft Peach
    ],
    visualMapColors: ["#fed7aa", "#fca5a5", "#93c5fd", "#86efac"]
};

export function getThemeConfig(themeName: string): ThemeConfig {
    switch (themeName) {
        case "cleanModern":
            return cleanModernTheme;
        case "cyberNeon":
            return cyberNeonTheme;
        case "d3Viridis":
            return d3ViridisTheme;
        case "d3Turbo":
            return d3TurboTheme;
        case "pastel":
            return pastelTheme;
        case "uberDark":
        default:
            return uberDarkTheme;
    }
}
