import { Corners } from '../generalTypes.d.ts';
import './navigation.css';
interface Private {
}
export default class Navigation {
    _: Private;
    p: any;
    name: string;
    corner: Corners;
    constructor(parent: any, name: string);
    getControl: () => string;
    attachEvents: () => void;
}
export {};
