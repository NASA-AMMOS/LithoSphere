import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Coordinates {
    _: Private;
    p: any;
    name: string;
    params: object;
    corner: Corners;
    constructor(parent: any, name: string, params?: object);
    getControl: () => string;
    attachEvents: () => void;
    onUpdate: () => void;
    private updateMouseCoords;
}
export {};
