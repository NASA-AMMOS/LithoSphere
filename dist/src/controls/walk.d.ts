import { Corners } from '../generalTypes.d.ts';
interface Private {
}
export default class Walk {
    _: Private;
    p: any;
    name: string;
    helpDiv: HTMLElement;
    corner: Corners;
    constructor(parent: any, name: string);
    getControl: () => string;
    attachEvents: () => void;
    private setCamera;
    private leaveWalking;
}
export {};
