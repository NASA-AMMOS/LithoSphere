import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Exaggerate {
    _: Private;
    id: string;
    p: any;
    name: string;
    corner: Corners;
    exaggeration: number;
    constructor(parent: any, name: string);
    getControl: () => string;
    attachEvents: () => void;
    private getInactiveContent;
    private getActiveContent;
    setExaggeration: (multiplier: number) => void;
}
export {};
