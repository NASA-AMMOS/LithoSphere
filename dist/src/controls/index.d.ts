import { Corners } from '../generalTypes';
export default class Controls {
    p: any;
    controlContainer: HTMLElement;
    corners: {
        TopLeft: HTMLElement;
        TopRight: HTMLElement;
        BottomLeft: HTMLElement;
        BottomRight: HTMLElement;
    };
    activeControls: any;
    compass: any;
    navigation: any;
    coordinates: any;
    home: any;
    layers: any;
    exaggerate: any;
    observe: any;
    walk: any;
    link: any;
    constructor(parent: any);
    addControl: (name: string, control: any, params?: object, corner?: Corners) => any;
    removeControl: (name: any) => void;
    _onUpdateEvent: () => void;
    _onMove: (lng: any, lat: any, height: any) => void;
    _onMouseMove: (lng: any, lat: any, height: any) => void;
    _onMouseOut: (e?: any) => void;
    _onFirstPersonUpdate: () => void;
    _onOrbitalUpdate: (e?: any) => void;
}
