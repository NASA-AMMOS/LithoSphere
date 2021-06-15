import { Vector3 } from 'three';
interface Private {
    keepNear: boolean;
    crosshair: HTMLElement;
}
interface Orbit {
    camera: any;
    controls: any;
    near: number;
    far: number;
}
interface FirstPerson {
    camera: any;
    controls: any;
    lockControls: boolean;
    height: 3;
}
export default class Camera {
    _: Private;
    container: HTMLElement;
    camera: any;
    controls: any;
    orbit: Orbit;
    firstPerson: FirstPerson;
    isFirstPerson: boolean;
    isShift: boolean;
    moveForward?: boolean;
    moveBackward?: boolean;
    moveLeft?: boolean;
    moveRight?: boolean;
    canJump?: boolean;
    prevTime?: number;
    velocity?: Vector3;
    constructor(container: HTMLElement, scene: any, projection: any);
    reset(): void;
    _init(scene: any, projection: any): void;
    requestPointerLocking(): void;
    setupEvents(): void;
    onKeyDown: (event: KeyboardEvent) => void;
    onKeyUp: (event: KeyboardEvent) => void;
    updateSize: () => void;
    setNearFarPlane: (farther: any, near: any, far: any, keepNear: any) => void;
}
export {};
