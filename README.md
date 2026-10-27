# FastViz: Modern High-Performance Visualization & Maps Widget for Mendix

**FastViz** is an enterprise-grade, mobile-responsive visualization widget for Mendix. It wraps the performance of **Apache ECharts** (Canvas & WebGL rendering) with the mathematical precision of **D3.js** and high-contrast design patterns inspired by **Uber Vis** and **deck.gl**.

---

## ⚡ Highlights

- **Blazing Fast Canvas & WebGL Engine**: Easily renders 10,000 to 100,000+ data points at 60 FPS without DOM lag.
- **Dual Data Ingestion Routes**:
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
  - `Enterprise Clean` (Crisp light mode)
  - `Cyber Neon` (Vibrant tech aesthetic)
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
| **Hierarchical & Flow** | `Treemap`, `Sunburst`, `Radar / Spider`, `Funnel` | Multi-level categories, competency profiles, sales funnels |
| **Status & Single-Value** | `Gauge / Speedometer` | Performance metrics, speed, completion percentages |
| **Geospatial & Maps** | `Geo Map (Choropleth)`, `Geo Scatter / Bubble Map` | Regional sales, fleet locations, supply chain distribution |

---

## 🚀 Quick Start: Installation in Mendix Studio Pro

1. Run the build script in this repository:
   ```bash
   npm run build
   ```
2. Copy the generated `.mpk` package:
   ```text
   dist/FastViz.mpk
   ```
3. Paste `FastViz.mpk` into your Mendix application's `widgets/` folder:
   ```text
   <Your-Mendix-App>/widgets/FastViz.mpk
   ```
4. In Mendix Studio Pro, press **F4** (Synchronize Project Directory).
5. Open any Page, search for **FastViz Modern Charts & Maps** in the Toolbox, and drag it onto your layout.

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
Under the **Map & Geospatial** tab, set **Custom GeoJSON URL** to any public or internal GeoJSON URL (e.g., GeoJSON for US States, European Countries, or City Boundaries). FastViz will automatically download, cache, and render the custom boundary geometry!

---

### 4. Advanced: Custom ECharts JSON Override

For power users who want 100% custom styling or niche ECharts extensions:
In the **Advanced Options** tab, pass a JSON string to **Custom ECharts JSON Override**. FastViz will deep-merge your configuration directly with the chart options before rendering:

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
