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

## 💡 Quick Examples & Developer Recipes

### Example 1: The 30-Second Simple Bar Chart (Monthly Disbursement)

A simple trend chart showing loan disbursements across months.

#### A. In Mendix Domain Model:
Create an entity **`MonthlyDisbursement`**:
- `MonthName` *(String)*: `"Jan"`, `"Feb"`, `"Mar"`, `"Apr"`
- `AmountInCr` *(Decimal)*: `12.5`, `18.2`, `14.0`, `22.8`

#### B. Equivalent JSON (if using REST API Route):
```json
[
  { "x": "Jan", "y": 12.5 },
  { "x": "Feb", "y": 18.2 },
  { "x": "Mar", "y": 14.0 },
  { "x": "Apr", "y": 22.8 }
]
```

#### C. In Mendix Studio Pro:
- **X-Axis Attribute**: `MonthName`
- **Y-Axis Attribute**: `AmountInCr`
- **Chart Type**: `Bar` or `Line`

---

### Example 2: NABARD Hierarchy Drill-Down (State ➔ District) with Red/Green Outliers

An executive starts at the **State level**, clicks **Maharashtra**, drills down into **Districts**, and instantly spots underperforming red-flag districts.

#### A. In Mendix Domain Model:
Create an entity **`RegionPerformance`**:
- `RegionCode` *(String)*: Unique ID (`"MH"`, `"UP"`, `"DIST-PUNE"`, `"DIST-SATARA"`)
- `ParentCode` *(String)*: Parent ID linking child to parent (`"MH"` for Pune)
- `RegionName` *(String)*: Label (`"Maharashtra"`, `"Pune"`, `"Satara"`)
- `AchievementRate` *(Decimal)*: Metric value in % (`82.0`, `54.0`, `94.0`, `52.0`)

#### B. Equivalent JSON Payload:
```json
[
  /* --- LEVEL 1: STATES (No parentId) --- */
  { "id": "MH", "x": "Maharashtra",   "y": 82.0, "level": "State" },
  { "id": "UP", "x": "Uttar Pradesh", "y": 54.0, "level": "State" },

  /* --- LEVEL 2: DISTRICTS OF MAHARASHTRA (parentId = "MH") --- */
  { "id": "PUN", "parentId": "MH", "x": "Pune District",   "y": 94.0, "level": "District" },
  { "id": "SAT", "parentId": "MH", "x": "Satara District", "y": 52.0, "level": "District" }
]
```

#### C. In Mendix Studio Pro:
1. **X-Axis Attribute**: `RegionName`
2. **Y-Axis Attribute**: `AchievementRate`
3. **Region ID Attribute**: `RegionCode`
4. **Parent Region ID Attribute**: `ParentCode`
5. Under **Benchmark & Analytics**:
   - **Enable RAG Coloring**: `true`
   - **Red Threshold**: `60` *(below 60% turns RED 🔴)*
   - **Green Threshold**: `90` *(above 90% turns GREEN 🟢)*
   - **Enable Benchmark Line**: `true` with value `75` *(State Target 75%)*
   - **Enable Breadcrumbs**: `true`

---

### Example 3: Multi-Series Comparison (Target vs. Achieved by Sector)

Comparing **Target vs. Actual Disbursement** across priority sectors.

#### A. In Mendix Domain Model:
Create an entity **`SectorComparison`**:
- `Sector` *(String)*: `"Agriculture"`, `"MSME"`, `"Rural Housing"`
- `DisbursementType` *(String)*: `"Target"` or `"Achieved"`
- `Amount` *(Decimal)*: The numerical value

#### B. Equivalent JSON Payload:
```json
[
  { "x": "Agriculture",   "series": "Target",   "y": 150 },
  { "x": "Agriculture",   "series": "Achieved", "y": 138 },
  { "x": "MSME",          "series": "Target",   "y": 90  },
  { "x": "MSME",          "series": "Achieved", "y": 96  },
  { "x": "Rural Housing", "series": "Target",   "y": 60  },
  { "x": "Rural Housing", "series": "Achieved", "y": 41  }
]
```

#### C. In Mendix Studio Pro:
- **X-Axis Attribute**: `Sector`
- **Y-Axis Attribute**: `Amount`
- **Series / Group By**: `DisbursementType`
- **Chart Type**: `Bar` (or `Horizontal Bar (Leaderboard)`)

---

### 3-Step Cheat Sheet for Developers

| Step | Action in Studio Pro |
| :---: | :--- |
| **1** | Drag **OmniViz** onto your page. |
| **2** | Point **Datasource** to your entity list (e.g. `//MyEntity`). |
| **3** | Select `X-Axis` (Label) and `Y-Axis` (Number). Done! |

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

## 🛠️ Configuration & Ingestion Details

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
