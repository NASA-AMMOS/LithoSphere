import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Layers {
    _: Private;
    id: string;
    p: any;
    name: string;
    corner: Corners;
    constructor(parent: any, name: string);
    getControl: () => string;
    attachEvents: () => void;
    private getInactiveContent;
    private getActiveContent;
}
export {};
