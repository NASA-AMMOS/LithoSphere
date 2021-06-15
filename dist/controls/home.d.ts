import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Home {
    _: Private;
    p: any;
    name: string;
    corner: Corners;
    constructor(parent: any, name: string);
    getControl: () => string;
    attachEvents: () => void;
}
export {};
