import Tile3dLayerer from './tile3d';
import TileLayerer from './tile';
import ClampedLayerer from './clamped';
import VectorLayerer from './vector';
import ModelLayerer from './model';
interface Private {
    layerers: {
        tile3d: Tile3dLayerer;
        tile: TileLayerer;
        clamped: ClampedLayerer;
        vector: VectorLayerer;
        model: ModelLayerer;
    };
}
export default class Layers {
    _: Private;
    p: any;
    baseStyle: any;
    tile3d: any;
    tile: any;
    clamped: any;
    vector: any;
    model: any;
    all: any;
    constructor(parent: any);
    _reset(): void;
    addLayer: (type: string, layerObj: any, callback?: Function, sI?: number) => void;
    removeLayer: (name: string) => boolean;
    toggleLayer: (name: string, on?: boolean) => boolean;
    setLayerOpacity: (name: string, opacity: number) => boolean;
    setLayerFilterEffect: (name: string, filter: string, value: number) => boolean;
    findHighestMaxZoom: () => number;
    findLowestMinZoom: () => number;
    private getFeatureStyleProp;
    getLayerByName: (layerName: string) => any;
    hasLayer: (layerName: string) => boolean;
    getFeatureStyle: (layer: any, feature: any, isStrokeless?: boolean) => any;
}
export {};
