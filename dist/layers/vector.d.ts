export default class VectorLayerer {
    p: any;
    baseStyle: any;
    constructor(parent: any);
    add: (layerObj: any) => void;
    toggle: (name: string, on?: boolean) => void;
    setOpacity: (name: string, opacity: number) => void;
    remove: (id: string, substringed?: boolean) => void;
    private generateVectors;
    private geometryToLine;
    private geometryToThickLine;
}
