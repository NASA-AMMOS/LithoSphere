import { Corners } from '../generalTypes';
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
