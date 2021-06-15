import { TextureLoader } from 'three';
import { XYZ, XYZLOD } from '../generalTypes.d.ts';
interface Private {
    firstLoad: boolean;
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
    findTileDrawnBasedOnXYZLOD(xyz: XYZLOD): any;
    updateRastersForTile(xyz: XYZLOD): void;
    updateAllRasters(): void;
    removeTile(i: number): void;
    removeAllTiles(): void;
    outdateAllTiles(): void;
    removeAllOutdatedTiles(): void;
    removeTileXYZ(xyz: XYZ): void;
    killDrawingTiles(): void;
    fadeInTiles(): void;
}
export {};
