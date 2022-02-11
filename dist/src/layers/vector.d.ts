export default class VectorLayerer {
    p: any;
    baseStyle: any;
    constructor(parent: any);
    add: (layerObj: any, callback?: Function) => void;
    toggle: (name: string, on?: boolean) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
    private generateVectors;
    private geomTo;
}
