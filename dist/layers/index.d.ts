import TileLayerer from './tile.ts';
import ClampedLayerer from './clamped.ts';
import VectorLayerer from './vector.ts';
interface Private {
    layerers: {
        tile: TileLayerer;
        clamped: ClampedLayerer;
        vector: VectorLayerer;
    };
}
export default class Layers {
    _: Private;
    p: any;
    baseStyle: any;
    tile: any;
    clamped: any;
    vector: any;
    all: any;
    constructor(parent: any);
    _reset(): void;
    addLayer: (type: string, layerObj: any, sI?: number) => void;
    removeLayer: (type: string, name: string) => void;
    toggleLayer: (type: string, name: string, on?: boolean) => void;
    setLayerOpacity: (type: string, name: string, opacity: number) => void;
    findHighestMaxZoom: () => number;
    findLowestMinZoom: () => number;
    private getFeatureStyleProp;
    getFeatureStyle: (layer: any, feature: any) => any;
}
export {};
