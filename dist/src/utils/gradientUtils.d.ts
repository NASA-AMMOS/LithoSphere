export declare function interpolateColor(color1: string, color2: string, factor: number): string;
export declare function interpolateMultipleColors(colorStops: {
    position: number;
    color: string;
}[], value: number, minValue: number, maxValue: number): string | null;
export declare function buildColorStops(colorRamp: string[]): {
    position: number;
    color: string;
}[];
export declare function hexToRgb(hex: string): {
    r: number;
    g: number;
    b: number;
} | null;
export declare function parseRgb(color: string): {
    r: number;
    g: number;
    b: number;
} | null;
export declare function closestPointOnSegment(px: number, py: number, ax: number, ay: number, bx: number, by: number): {
    t: number;
    dist: number;
};
