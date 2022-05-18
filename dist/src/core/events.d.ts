interface Private {
    mouseXY: {
        x: number;
        y: number;
    };
    prevMouseXY: {
        x: number;
        y: number;
    };
    oldPrevMouseXY: {
        x: number;
        y: number;
    };
    containerXY: {
        x: number;
        y: number;
    };
    lastZoomDelta: number;
    desiredZoom: number;
    zoomedSince: number;
    zoomWait: number;
    highlightTimeout: any;
    rotationDampingInterval: any;
    panned: boolean;
}
export default class Events {
    _: Private;
    p: any;
    activeFeature: any;
    hoveredFeature: any;
    hoverInfo: HTMLElement;
    constructor(parent: any);
    _init(): void;
    _rotateGlobe: (e: any, prevXY?: any, fromDamping?: boolean) => void;
    private _rotateAroundArbAxis;
    private _rotateGlobe_MouseDown;
    private _rotateGlobe_MouseUp;
    _checkDesiredZoom(): void;
    private _setZoom;
    _onZoom: (e?: any) => void;
    _onTouchZoom: (e: any) => void;
    _matchPlanetsLODToPlanet(): void;
    _refreshFrontGroupRotation(): void;
    private _onClick;
    private _onKeyDown;
    _onMouseMove: (e?: any) => void;
    private _updateMouseCoords;
    private updateHoverInfoPosition;
    private _highlightFeature;
    private _unhighlightHoveredFeature;
    private setHoveredFeature;
    private clearHoveredFeature;
    private setActiveFeature;
    private clearActiveFeature;
    _attenuate(): void;
}
export {};
