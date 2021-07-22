import { TileMapResource, LatLng, LatLngH, XY, XYZ } from '../generalTypes';
interface Private {
    tmp: null;
}
interface Radii {
    major: number;
    minor: number;
}
declare enum RadiusE {
    Major = "major",
    Minor = "minor"
}
export default class Projection {
    _: Private;
    baseRadius: number;
    radiusScale: number;
    radii: Radii;
    tileMapResource: TileMapResource;
    crs: any;
    trueTileResolution: number;
    res: any;
    e: number;
    ep: number;
    flatteningFactor: number;
    constructor(majorRadius?: number, minorRadius?: number, tileMapResource?: TileMapResource, trueTileResolution?: number);
    _reset(): void;
    setRadius: (radius: number, which?: RadiusE) => void;
    invertY: (y: number, z: number) => number;
    toBounds: (a: XY, b: XY) => {
        min: {
            x: any;
            y: any;
        };
        max: {
            x: any;
            y: any;
        };
    };
    tileXYZ2NwSe: (xyz: XYZ, tileResolution: number, asBounds?: boolean, stretchFactor?: number) => any;
    tileXYZ2LatLng: (x: number, y: number, z: number, flatXYZ?: XYZ) => LatLng;
    latLngZ2TileXYZ: (lat: number, lng: number, z: number, dontFloor?: boolean) => XYZ;
    vector3ToLatLng: (xyz: XYZ) => LatLngH;
    lonLatToVector3: (lon: number, lat: number, height: number) => XYZ;
    rotatePoint3D: (pt: XYZ, angle: XYZ, center?: XYZ) => XYZ;
    lon2tileUnfloored: (lon: number, zoom: number) => number;
    lat2tileUnfloored: (lat: number, zoom: number) => number;
    lngLatDistBetween: (lon1: number, lat1: number, lon2: number, lat2: number) => number;
}
export {};
