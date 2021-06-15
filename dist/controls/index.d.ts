import { Corners } from '../generalTypes.d.ts';
export default class Controls {
    p: any;
    controlsContainer: HTMLElement;
    corners: {
        TopLeft: HTMLElement;
        TopRight: HTMLElement;
        BottomLeft: HTMLElement;
        BottomRight: HTMLElement;
    };
    activeControls: any;
    compass: any;
    coordinates: any;
    home: any;
    layers: any;
    exaggerate: any;
    constructor(parent: any);
    addControl: (name: string, control: any, corner?: Corners) => void;
    removeControl: (name: any) => void;
    _onUpdateEvent: () => void;
}
