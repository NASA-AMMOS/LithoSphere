import { Corners } from '../generalTypes.d.ts';
interface Private {
}
interface Params {
    existingDivId?: string;
    hideElement?: boolean;
    onChange?: Function;
}
export default class Coordinates {
    _: Private;
    p: any;
    name: string;
    params: Params;
    corner: Corners;
    constructor(parent: any, name: string, params?: object);
    getControl: () => string;
    attachEvents: () => void;
    onUpdate: () => void;
    private updateMouseCoords;
}
export {};
