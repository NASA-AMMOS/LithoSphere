export default class CurtainLayerer {
    p: any;
    constructor(parent: any);
    add: (layerObj: any, callback?: Function) => void;
    toggle: (name: string, on?: boolean) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
    setLayerSpecificOptions: (name: string, options: any) => boolean;
    private generateCurtain;
    private getCurtainMesh;
    private getCurtainVertices;
}
