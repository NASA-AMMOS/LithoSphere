import { Vector2, Vector3 } from 'three';
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
    sceneContainer: HTMLElement;
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
    constructor(container: HTMLElement, sceneContainer: HTMLElement, scene: any, projection: any);
    reset(): void;
    _init(scene: any, projection: any): void;
    swap(lockControls: any, skipLock: any): void;
    private inToFirstPerson;
    private outFromFirstPerson;
    private toggleCrosshair;
    private requestPointerLocking;
    setupEvents(): void;
    onKeyDown: (event: KeyboardEvent) => void;
    onKeyUp: (event: KeyboardEvent) => void;
    updateSize: () => void;
    setNearFarPlane: (farther: any, near: any, far: any, keepNear: any) => void;
    setFirstPersonHeight: (height: any) => void;
    getFirstPersonFocalLength: () => number;
    setFirstPersonFocalLength: (focalLength: any) => void;
    getFirstPersonFOV: () => number;
    setFirstPersonFOV: (fov: any) => void;
    getFirstPersonAspect: () => number;
    setFirstPersonAspect: (aspect: any) => void;
    setCameraAzimuthElevation: (az: any, el: any, cameraIsFirstPerson: any) => void;
    update: () => Vector2;
}
export {};
