export default class TileLayerer {
    p: any;
    constructor(parent: any);
    add: (layerObj: any) => void;
    toggle: (name: string, on?: boolean) => boolean;
    setOpacity: (name: string, opacity: number) => boolean;
    remove: (name: string) => boolean;
}
