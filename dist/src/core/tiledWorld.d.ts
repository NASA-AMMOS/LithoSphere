import { TextureLoader } from 'three';
import { XYZ, XYZLOD } from '../generalTypes';
interface Private {
    loader: TextureLoader;
    tileDimension: number;
}
export default class TiledWorld {
    _: Private;
    tilesDrawn: any;
    tilesWanted: any;
    tilesToBeDrawn: any;
    tilesBeingDrawn: any;
    p: any;
    constructor(parent: any);
    _reset(): void;
    refreshTiles(): void;
    updateDesiredTiles(): void;
    addTile(xyz: XYZLOD, failCallback?: any): Promise<any>;
    findTileDrawnBasedOnUUID(uuid: string): any;
    findTileDrawnBasedOnXYZLOD(xyz: XYZLOD): any;
    updateRastersForTile(xyz: XYZLOD): void;
    updateClampedRasterForTile(tD: any, layerName: any): void;
    updateAllRasters(): void;
    removeTile(i: number, shouldFadeOut?: boolean): void;
    removeAllTiles(): void;
    outdateAllTiles(): void;
    removeAllOutdatedTiles(): void;
    removeTileXYZ(xyz: XYZ): void;
    killDrawingTiles(): void;
    filterEffects(): void;
    fadeInTiles(): void;
    fadeOutTiles(): void;
}
export {};
