import { TileMapResource, LatLng, LatLngH, XYZ } from '../generalTypes.d.ts';
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
    e: number;
    ep: number;
    flatteningFactor: number;
    constructor(majorRadius?: number, minorRadius?: number, tileMapResource?: TileMapResource);
    _reset(): void;
    setRadius: (radius: number, which?: RadiusE) => void;
    invertY: (y: number, z: number) => number;
    tileXYZ2LatLng: (x: number, y: number, z: number, flatXYZ: XYZ) => LatLng;
    latLngZ2TileXYZ: (lat: number, lng: number, z: number, dontFloor?: boolean) => XYZ;
    vector3ToLatLng: (xyz: XYZ) => LatLngH;
    lonLatToVector3: (lon: number, lat: number, height: number) => XYZ;
    rotatePoint3D: (pt: XYZ, angle: XYZ, center?: XYZ) => XYZ;
    lon2tileUnfloored: (lon: number, zoom: number) => number;
    lat2tileUnfloored: (lat: number, zoom: number) => number;
}
export {};
