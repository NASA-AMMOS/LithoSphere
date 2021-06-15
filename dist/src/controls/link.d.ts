import { Corners } from '../generalTypes';
import { Object3D } from 'three';
interface Private {
    linkPanned: boolean;
    linkPannedTimeout: any;
    targetPoint?: Object3D;
}
export default class Link {
    _: Private;
    p: any;
    name: string;
    params: any;
    corner: Corners;
    return: any;
    constructor(parent: any, name: string, params?: object);
    getControl: () => string;
    attachEvents: () => void;
    getReturn: () => any;
    onMove: (lng: any, lat: any, height: any) => void;
    onMouseMove: (lng: any, lat: any, height: any) => void;
    onMouseOut: () => void;
    onFirstPersonUpdate: () => void;
    onOrbitalUpdate: () => void;
    setLink: (latlng?: any, style?: any, spriteId?: string) => void;
    linkMove: (lng: number, lat: number) => void;
    linkMouseMove: (lng: number, lat: number) => void;
    linkMouseOut: () => void;
}
export {};
