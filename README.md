# 🌌 OmniViz: Universal Data Visualization & Geospatial Maps for Mendix

[![License: Apache-2.0](https://img.shields.io/badge/License-Apache%202.0-blue.svg)](https://opensource.org/licenses/Apache-2.0)
[![Built with: ECharts](https://img.shields.io/badge/Render%20Engine-Apache%20ECharts-red.svg)](https://echarts.apache.org/)
[![D3 Math: v7](https://img.shields.io/badge/Math%20%26%20Scales-D3.js-orange.svg)](https://d3js.org/)
[![Mendix: 9.x & 10.x](https://img.shields.io/badge/Mendix-9.x%20%2F%2010.x-004B87.svg)](https://marketplace.mendix.com/)

**OmniViz** is an all-in-one, hardware-accelerated visualization and mapping engine built as a Mendix Pluggable Widget. It combines the raw 60 FPS performance of **Apache ECharts** (Canvas & WebGL) with the precision of **D3.js** math and the high-contrast aesthetic of **Uber’s visualization design system** (`react-vis`, `deck.gl`).

---

## ⚡ Key Highlights

- **Blazing Fast Canvas & WebGL Engine**: Renders 10,000 to 100,000+ data points at 60 FPS without crashing or slowing down mobile DOMs.
- **Dual Data Ingestion Modes**:
  - **Route A (Mendix Datasource)**: Low-code plug & play via XPath, Microflow, Nanoflow, Database, or Association.
  - **Route B (REST API / Dynamic JSON)**: Direct API endpoint fetching with optional auto-refresh polling intervals for live IoT / operational dashboards.
- **Geospatial & Map Support**:
  - **Choropleth Maps**: Color gradient regions by value (built-in world map or custom GeoJSON).
  - **Geo Scatter / Bubble Maps**: Pinpoint GPS coordinates (`latitude`, `longitude`, magnitude).
- **Mobile-First & Touch Ready**:
  - Native pinch-to-zoom and drag on mobile devices.
  - Swipeable `dataZoom` slider for dense time-series and large category sets.
  - Touch crosshair tooltips and auto-scrolling mobile legends.
- **Uber-Inspired Themes**:
  - `Uber Dark` (Signature high-contrast dark mode)
  - `Enterprise Clean Light` (Crisp daylight portal)
  - `Cyber Neon` (Glowing cyberpunk aesthetic)
  - `D3 Viridis` & `D3 Turbo` (Perceptually uniform color ramps)
  - `Pastel Minimal`
- **Low-Code Event Bridge**:
  - Clicking any bar, point, pie slice, or map pin triggers a Mendix **Microflow / Nanoflow** with the clicked Mendix entity passed as a parameter.
- **100% Extensible**: Advanced JSON override property allows developers to merge custom ECharts/D3 options for bespoke visualizations.

---

## 📊 Supported Chart Types

| Family | Chart Types | Key Use Cases |
| :--- | :--- | :--- |
| **Standard 2D** | `Bar`, `Horizontal Bar`, `Stacked Bar`, `Line`, `Area`, `Stacked Area`, `Scatter / Bubble` | Financial trends, KPI comparisons, distributions, time-series |
| **Categorical & Circular** | `Pie / Donut`, `Nightingale Rose` | Budget breakdowns, market share, cyclical metrics |
| **Hierarchical & Flow** | `Treemap`, `Sunburst`, `Radar / Spider`, `Funnel`, `Heatmap Matrix`, `Sankey` | Multi-level categories, competency profiles, sales funnels |
| **Status & Single-Value** | `Gauge / Speedometer` | Performance metrics, speed, completion percentages |
| **Financial** | `Candlestick (OHLC)` | Stock / commodity Open, High, Low, Close |
| **Geospatial & Maps** | `Geo Map (Choropleth)`, `Geo Scatter / Bubble Map` | Regional sales, fleet locations, supply chain distribution |

---

## 🚀 Quick Start: Installation in Mendix Studio Pro

1. Download or copy the prebuilt widget package:
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

## 🛠️ Configuration Guide

### 1. Route A: Plug & Play with Mendix Datasource (XPath)

1. Set **Data Ingestion Mode** to `Mendix Datasource`.
2. Select your **Mendix Datasource** (e.g. XPath: `//Sales.MonthlyRevenue[Year = 2026]`).
3. Map the attributes:
   - **X / Dimension**: Attribute representing the label or date (e.g. `MonthName`).
   - **Y / Measure**: Numerical value attribute (e.g. `Revenue`).
   - **Series / Group By (Optional)**: Attribute to split into multi-series (e.g. `Region` or `ProductCategory`).
   - **On Data Point Click Action (Optional)**: Select a Microflow (e.g. `ACT_MonthlyRevenue_DrillDown`) to receive the clicked record.

---

### 2. Route B: Direct REST API / JSON Route

For real-time operational telemetry or microservice data:

1. Set **Data Ingestion Mode** to `Direct REST API / JSON Route`.
2. Provide the **API Endpoint URL or JSON String**:
   - URL example: `'https://api.mycompany.com/v1/telemetry/live'`
   - Or a dynamic JSON string from a Microflow return value.
3. **Auto Refresh Interval**: Set to `5` to poll the API every 5 seconds for live streaming dashboards (or `0` to disable).
4. **JSON Path Root (Optional)**: If your API wraps data inside `{ "status": 200, "data": [...] }`, set this to `data`.

Expected JSON array shape:
```json
[
  { "x": "North America", "y": 850000, "series": "Software" },
  { "x": "Europe", "y": 620000, "series": "Software" },
  { "x": "Asia Pacific", "y": 910000, "series": "Software" }
]
```

---

### 3. Geospatial & Map Visualizations

#### A. Choropleth Map (Region / Country Heatmap)
1. Set **Chart Type** to `Geospatial Map (Choropleth)`.
2. In the Datasource, map:
   - **X / Dimension**: Country or region name (e.g. `United States`, `United Kingdom`, `Germany`, `India`, `Japan`).
   - **Y / Measure**: Numerical density or metric value (e.g. `UserCount`).
3. Set **Map Value Range Min** and **Map Value Range Max** (e.g. `0` to `50000`).

#### B. Geo Scatter / Bubble Map (Lat / Long Pins)
1. Set **Chart Type** to `Geospatial Scatter / Bubble Map`.
2. In the Datasource, map:
   - **Latitude**: Coordinate attribute (e.g. `Lat`).
   - **Longitude**: Coordinate attribute (e.g. `Lng`).
   - **Y / Measure**: Pin magnitude / bubble size.
   - **Custom Tooltip / Label**: Location name or details (e.g. `WarehouseName`).

#### C. Custom GeoJSON (States, Provinces, Custom Regions)
Under the **Map & Geospatial** tab, set **Custom GeoJSON URL** to any public or internal GeoJSON URL (e.g., GeoJSON for US States, European Countries, or City Boundaries). OmniViz will automatically download, cache, and render the custom boundary geometry!

---

### 4. Advanced: Custom ECharts JSON Override

For power users who want 100% custom styling or niche ECharts extensions:
In the **Advanced Options** tab, pass a JSON string to **Custom ECharts JSON Override**. OmniViz will deep-merge your configuration directly with the chart options before rendering:

```json
{
  "series": [
    {
      "itemStyle": {
        "borderRadius": [8, 8, 0, 0],
        "shadowBlur": 10,
        "shadowColor": "rgba(0, 210, 211, 0.5)"
      }
    }
  ]
}
```

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
