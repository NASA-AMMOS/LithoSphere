export default class GradientLayerer {
    p: any;
    constructor(parent: any);
    add: (layerObj: any, callback?: Function) => void;
    toggle: (name: string, on?: boolean) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
    private generateGradientLines;
}
