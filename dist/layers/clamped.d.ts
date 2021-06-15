import { XYZ } from '../generalTypes.d.ts';
export default class ClampedLayerer {
    p: any;
    constructor(parent: any);
    add: (layerObj: any) => void;
    toggle: (name: string, on?: boolean) => void;
    setOpacity: (name: string, opacity: number) => void;
    remove: (name: string) => void;
    getClampedTexture: (i: number, xyz: XYZ) => string;
}
