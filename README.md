# 🌌 OmniViz: Universal Data Visualization & Geospatial Maps for Mendix

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built with: ECharts](https://img.shields.io/badge/Render%20Engine-Apache%20ECharts-red.svg)](https://echarts.apache.org/)
[![D3 Math: v7](https://img.shields.io/badge/Math%20%26%20Scales-D3.js-orange.svg)](https://d3js.org/)
[![Mendix: 9.x & 10.x](https://img.shields.io/badge/Mendix-9.x%20%2F%2010.x-004B87.svg)](https://marketplace.mendix.com/)

**OmniViz** is an all-in-one, hardware-accelerated visualization, geospatial mapping, and hierarchical performance analytics engine built as a Mendix Pluggable Widget. It combines the 60 FPS performance of **Apache ECharts** (Canvas & WebGL) with the mathematical precision of **D3.js** and high-contrast design patterns inspired by **Uber’s visualization system** (`react-vis`, `deck.gl`).

---

## ⚡ Key Highlights

- **Blazing Fast Canvas & WebGL Engine**: Easily renders 10,000 to 100,000+ data points at 60 FPS without DOM lag or mobile memory bloat.
- **Hierarchical Drill-Down with Breadcrumbs**:
  - Seamlessly drill from **National ➔ State ➔ District ➔ Block / Village**.
  - Interactive breadcrumb bar (`National ❯ Maharashtra ❯ Pune`) with instant back navigation.
- **NABARD / Governance Performance Analytics**:
  - **Benchmark Reference Line (`markLine`)**: Compare districts or villages against the National or State average.
  - **Dynamic RAG Coloring (Red / Amber / Green)**: Highlights underperforming units needing intervention (< 60%) and star performers (> 90%).
  - **Top-N / Bottom-N Isolation Mode**: Instantly shows the 5 best and 5 worst performers side-by-side.
- **Dual Data Ingestion Modes**:
  - **Route A (Mendix Datasource)**: Low-code plug & play via XPath, Microflow, Nanoflow, Database, or Association.
  - **Route B (REST API / Dynamic JSON)**: Direct API endpoint fetching with optional auto-refresh polling intervals for real-time dashboards.
- **Geospatial & Map Support**:
  - **Choropleth Maps**: Color gradient regions by value (built-in world/country maps or custom GeoJSON URLs).
  - **Geo Scatter / Bubble Maps**: Pinpoint GPS coordinates (`latitude`, `longitude`, magnitude).
- **Mobile-First & Touch Ready**:
  - Native pinch-to-zoom and drag on mobile devices.
  - Swipeable `dataZoom` slider for dense time-series and large category sets.
  - Touch crosshair tooltips and auto-scrolling mobile legends.
- **Uber-Inspired Themes**:
  - `Uber Dark` (Signature high-contrast dark mode)
  - `Enterprise Clean Light` (Crisp daylight portal)
  - `Cyber Neon` (Glowing tech aesthetic)
  - `D3 Viridis` & `D3 Turbo` (Perceptually uniform color ramps)
  - `Pastel Minimal`

---

## 🏛️ Multi-Level Governance & NABARD Hierarchy Pattern

When building dashboards that go from **National ➔ State ➔ District ➔ Village**:

```
[National Level: India] ➔ Click "Maharashtra"
       │
       ▼
[State Level: Maharashtra Districts] ➔ Click "Pune"
       │
       ▼
[District Level: Pune Blocks & Villages] ➔ Identify Underperforming Gram Panchayats
```

### 1. How to Configure Hierarchical Drill-Down
In Mendix Studio Pro:
1. Map **Region ID / Code** (e.g. `DistrictCode` or `CensusCode`).
2. Map **Parent Region ID** (e.g. `StateCode`).
3. Set **Enable Drill-Down Breadcrumbs** to `true`.
4. When an executive clicks a State, OmniViz immediately filters to that State's districts and renders a breadcrumb trail (`National ❯ Maharashtra`) with smooth transitions!

---

## 🎯 Identifying Low vs. High Performers

### 1. Benchmark Reference Line
- Enable **Benchmark Reference Line**.
- Pass **Benchmark Value** (e.g., `$currentEntity/StateAverageDisbursement` or `75.0`).
- A prominent dashed target line is rendered across the chart, making it immediately visible which units exceed or fall behind the benchmark.

### 2. Dynamic RAG Coloring (Red / Amber / Green)
- Enable **RAG Performance Coloring**.
- Set **Red Threshold** (e.g. `60%`) — any district or village below this is highlighted in **Red** (`#ef4444`) to signal urgent field intervention.
- Set **Green Threshold** (e.g. `90%`) — any district above this is highlighted in **Green** (`#10b981`) to recognize top performers.
- Items between 60% and 90% appear in **Amber** (`#f59e0b`).

### 3. Performance Leaderboard & Top/Bottom N Isolation
Under **Performance Sorting / Leaderboard**:
- **Ranked: Top Performers First**: Sorts highest to lowest.
- **Ranked: Lowest Performers First**: Flags lowest achievement units first.
- **Isolate: Top N and Bottom N Extremes**: Trims middle noise to isolate the 5 best champions and 5 most critical underperformers.

---

## 📊 Supported Chart Types

| Family | Chart Types | Key Use Cases |
| :--- | :--- | :--- |
| **Standard 2D** | `Bar`, `Horizontal Bar (Leaderboard)`, `Stacked Bar`, `Line`, `Area`, `Stacked Area`, `Scatter / Performance Matrix` | Target vs Achievement, Priority Sector Lending trends, KPI rankings |
| **Categorical & Circular** | `Pie / Donut`, `Nightingale Rose` | Scheme breakdowns (KCC, PM-KISAN, SHG Bank Linkage), portfolio shares |
| **Hierarchical & Flow** | `Treemap`, `Sunburst`, `Radar / Spider`, `Funnel`, `Heatmap Matrix`, `Sankey` | Multi-level administrative hierarchies, loan approval funnels |
| **Status & Single-Value** | `Gauge / Speedometer` | Performance dials, target completion percentages |
| **Financial** | `Candlestick (OHLC)` | Commodity price tracking, mandi price fluctuations |
| **Geospatial & Maps** | `Geo Map (Choropleth)`, `Geo Scatter / Bubble Map` | District-level heatmaps, branch & ATM locations, credit distribution |

---

## 🚀 Quick Start: Installation in Mendix Studio Pro

1. Copy the prebuilt widget package:
   ```text
   dist/OmniViz.mpk
   ```
2. Paste `OmniViz.mpk` into your Mendix project's `widgets/` directory:
   ```text
   <Your-Mendix-App>/widgets/OmniViz.mpk
   ```
3. In Mendix Studio Pro, press **F4** (Synchronize Project Directory).
4. Open any Page, search for **OmniViz Universal Visualizations & Maps** in the Toolbox, and drag it onto your layout.

---

## 💻 Developer Scripts

```bash
# Install dependencies
npm install

# Type-check TypeScript
npm run typecheck

# Build production .mpk package
npm run build

# Watch mode for rapid widget development
npm run watch
```

---

## 📄 License
Apache-2.0
