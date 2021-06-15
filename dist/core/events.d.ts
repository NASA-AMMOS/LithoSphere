interface Private {
    mouseXY: {
        x: number;
        y: number;
    };
    prevMouseXY: {
        x: number;
        y: number;
    };
    lastZoomDelta: number;
    desiredZoom: number;
    zoomedSince: number;
    zoomWait: number;
}
export default class Events {
    _: Private;
    p: any;
    constructor(parent: any);
    _init(): void;
    _rotateGlobe: (e: any, prevXY: any) => void;
    private _rotateAroundArbAxis;
    private _rotateGlobe_MouseDown;
    private _rotateGlobe_MouseUp;
    _checkDesiredZoom(): void;
    private _setZoom;
    private _onZoom;
    _matchPlanetsLODToPlanet(): void;
    _refreshVectorRotation(): void;
    private _updateMouseCoords;
}
export {};
