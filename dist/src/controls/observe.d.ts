import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Observe {
    _: Private;
    p: any;
    name: string;
    id: string;
    helpDiv: HTMLElement;
    corner: Corners;
    constructor(parent: any, name: string);
    getControl: () => string;
    private getInactiveContent;
    private getActiveContent;
    attachEvents: () => void;
    private setCamera;
    private leaveObserver;
    private getObserverValues;
    private keydownObserverSettings;
    private toggleFOVOverlay;
    private updateFOVOverlayBounds;
}
export {};
