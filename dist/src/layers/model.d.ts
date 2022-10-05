export default class ModelLayerer {
    p: any;
    modelCache: any;
    constructor(parent: any);
    add: (layerObj: any, callback?: Function) => void;
    toggle: (name: string, on?: boolean) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
    private generateModels;
    private objToModel;
    private daeToModel;
    private gltfToModel;
    private localizeModels;
}
