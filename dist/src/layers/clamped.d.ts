import { XYZ } from '../generalTypes.d.ts';
export default class ClampedLayerer {
    p: any;
    constructor(parent: any);
    add: (layerObj: any, callback?: Function) => void;
    toggle: (name: string, on?: boolean) => boolean;
    orderLayers: (ordering: string[]) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
    getClampedTexture: (i: number, xyz: XYZ) => any;
}
