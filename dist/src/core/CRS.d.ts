export default class CRS {
    options: any;
    transformation: any;
    projection: any;
    _scales: number[];
    R: number;
    constructor(code: string, proj: string, options: any, radius: number);
    project(latlng: any, zoom: any, ll2p: any): any;
    unproject(point: any, zoom: any, p2ll: any): any;
    latLngToPoint(latlng: any, zoom: any): any;
    pointToLatLng(point: any, zoom: any): any;
    scale(zoom: number): number;
}
