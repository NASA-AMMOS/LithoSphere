export default class PNG {
    static load(url: any, options: any, callback: any, failureCallback: any): void;
    constructor(data1: any);
    read(bytes: any): any[];
    readUInt32(): number;
    readUInt16(): number;
    decodePixels(data: any): Uint8Array;
    decodePalette(): Uint8Array;
    copyToImageData(imageData: any, pixels: any): void;
    decode(): Uint8Array;
    decodeFrames(ctx: any): void;
    renderFrame(ctx: any, number: any): any;
    animate(ctx: any): void;
    stopAnimation(): void;
    render(canvas: any): any;
}
