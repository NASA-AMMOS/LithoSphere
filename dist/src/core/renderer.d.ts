export default class Renderer {
    renderer: any;
    container: HTMLElement;
    constructor(container: HTMLElement);
    _init(): void;
    updateSize: () => void;
    remove(): void;
}
