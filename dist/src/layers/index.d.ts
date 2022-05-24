import Tile3dLayerer from './tile3d';
import TileLayerer from './tile';
import ClampedLayerer from './clamped';
import VectorLayerer from './vector';
import CurtainLayerer from './curtain';
import ModelLayerer from './model';
interface Private {
    layerers: {
        tile3d: Tile3dLayerer;
        tile: TileLayerer;
        clamped: ClampedLayerer;
        vector: VectorLayerer;
        curtain: CurtainLayerer;
        model: ModelLayerer;
    };
}
export default class Layers {
    _: Private;
    p: any;
    tile3d: any;
    tile: any;
    clamped: any;
    vector: any;
    curtain: any;
    model: any;
    all: any;
    constructor(parent: any);
    _reset(): void;
    addLayer: (type: string, layerObj: any, callback?: Function, sI?: number) => void;
    removeLayer: (name: string) => boolean;
    toggleLayer: (name: string, on?: boolean) => boolean;
    orderLayers: (ordering: string[]) => boolean;
    private getDesiredOrder;
    setLayerOpacity: (name: string, opacity: number) => boolean;
    setLayerFilterEffect: (name: string, filter: string, value: number) => boolean;
    setLayerSpecificOptions: (name: string, options: any) => boolean;
    findHighestMaxZoom: () => number;
    findLowestMinZoom: () => number;
    getLayerByName: (layerName: string) => any;
    hasLayer: (layerName: string) => boolean;
    private getFeatureStyleProp;
    private getBaseStyle;
    getFeatureStyle: (layer: any, feature: any, isStrokeless?: boolean) => any;
    _onMouseMove: (intersectedLL: any, e: MouseEvent, obj: any, intersectionRaw: any, intersectionPoint: any) => void;
}
export {};
