import * as echarts from "echarts";

// Default low-res world GeoJSON outline for instant out-of-the-box rendering
// without requiring external network downloads
const DEFAULT_WORLD_GEOJSON: any = {
    type: "FeatureCollection",
    features: [
        {
            type: "Feature",
            properties: { name: "United States" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-125, 48], [-124, 32], [-117, 32], [-114, 32], [-106, 31], [-97, 26], [-80, 25], [-75, 35], [-70, 43], [-67, 47], [-82, 42], [-95, 49], [-125, 48]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "United Kingdom" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-5, 50], [-0.5, 51], [1.7, 52.5], [-1.5, 58], [-5, 58], [-5, 50]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Germany" },
            geometry: {
                type: "Polygon",
                coordinates: [[[6, 50], [14, 50], [14, 54], [8, 54], [6, 50]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "France" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-4, 48], [8, 48], [7, 43], [-1.5, 43], [-4, 48]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "India" },
            geometry: {
                type: "Polygon",
                coordinates: [[[68, 24], [77, 8], [80, 13], [88, 22], [97, 28], [88, 27], [78, 35], [74, 33], [68, 24]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Japan" },
            geometry: {
                type: "Polygon",
                coordinates: [[[130, 31], [131, 34], [141, 43], [145, 43], [140, 36], [130, 31]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Australia" },
            geometry: {
                type: "Polygon",
                coordinates: [[[113, -22], [115, -34], [143, -38], [153, -28], [142, -11], [130, -12], [113, -22]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Canada" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-140, 69], [-130, 54], [-95, 49], [-60, 47], [-64, 62], [-85, 70], [-140, 69]]]
            }
        },
        {
            type: "Feature",
            properties: { name: "Brazil" },
            geometry: {
                type: "Polygon",
                coordinates: [[[-70, -4], [-51, 4], [-35, -5], [-40, -22], [-53, -33], [-58, -20], [-70, -4]]]
            }
        }
    ]
};

const registeredMaps = new Set<string>();

export class GeoMapService {
    /**
     * Ensure a base world map is registered
     */
    static initDefaultMap(): void {
        if (!registeredMaps.has("world")) {
            echarts.registerMap("world", DEFAULT_WORLD_GEOJSON);
            registeredMaps.add("world");
        }
    }

    /**
     * Dynamically loads a custom GeoJSON from an external URL or API endpoint
     */
    static async loadCustomGeoJson(mapName: string, url: string): Promise<boolean> {
        if (registeredMaps.has(mapName)) {
            return true;
        }

        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }
            const geoJson = await response.json();
            echarts.registerMap(mapName, geoJson);
            registeredMaps.add(mapName);
            return true;
        } catch (err) {
            console.warn(`FastViz: Could not load GeoJSON from ${url}, falling back to default map`, err);
            this.initDefaultMap();
            return false;
        }
    }

    static isMapRegistered(mapName: string): boolean {
        return registeredMaps.has(mapName);
    }
}
