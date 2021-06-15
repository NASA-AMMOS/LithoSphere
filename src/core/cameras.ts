import { PerspectiveCamera, Vector2, Vector3, MOUSE } from 'three'
import OrbitControls from '../secondary/OrbitControls'
import PointerLockControls from '../secondary/PointerLockControls'

import Utils from '../utils'

interface Private {
    keepNear: boolean
    crosshair: HTMLElement
}

interface Orbit {
    camera: any
    controls: any
    near: number
    far: number
}
interface FirstPerson {
    camera: any
    controls: any
    lockControls: boolean
    height: 3 //m
}

export default class Camera {
    _: Private
    container: HTMLElement
    sceneContainer: HTMLElement
    camera: any
    controls: any
    orbit: Orbit
    firstPerson: FirstPerson
    isFirstPerson: boolean
    isShift: boolean
    moveForward?: boolean
    moveBackward?: boolean
    moveLeft?: boolean
    moveRight?: boolean
    canJump?: boolean
    prevTime?: number
    velocity?: Vector3

    constructor(
        container: HTMLElement,
        sceneContainer: HTMLElement,
        scene: any,
        projection: any
    ) {
        this.container = container
        this.sceneContainer = sceneContainer
        this.reset()
        this._init(scene, projection)
    }

    reset(): void {
        this.camera = null
        this.controls = null
        this.orbit = {
            camera: null,
            controls: null,
            near: 0.1,
            far: 15000000000,
        }
        this.firstPerson = {
            camera: null,
            controls: null,
            lockControls: false,
            height: 3, //m
        }
        this.isFirstPerson = false
        this._ = {
            keepNear: false,
            crosshair: null,
        }
        this.isShift = false
        this.moveForward = null
        this.moveBackward = null
        this.moveLeft = null
        this.moveRight = null
        this.canJump = null
        this.prevTime = performance.now()
        this.velocity = new Vector3()
    }

    _init(scene: any, projection: any): void {
        // Orbit Camera
        this.orbit.camera = new PerspectiveCamera(
            60,
            this.sceneContainer.offsetWidth / this.sceneContainer.offsetHeight,
            this.orbit.near,
            this.orbit.far
        )
        // Maybe fix: This upside down camera is a bug that works.
        this.orbit.camera.up = new Vector3(0, -1, 0)
        this.orbit.camera.position.set(0, -10000000 / projection.radiusScale, 0)

        // Orbit Controls
        this.orbit.controls = new OrbitControls(
            this.orbit.camera,
            this.sceneContainer
        )
        this.orbit.controls.enabled = true
        this.orbit.controls.enableDamping = true
        this.orbit.controls.dampingFactor = 0.2
        this.orbit.controls.target.y = 1
        this.orbit.controls.mouseButtons.ORBIT = MOUSE.RIGHT
        this.orbit.controls.mouseButtons.PAN = MOUSE.LEFT
        this.orbit.controls.maxDistance = projection.radii.major * 4
        this.orbit.controls.maxPolarAngle = Math.PI / 2
        this.orbit.controls.enablePan = false

        // First Person Camera
        this.firstPerson.camera = new PerspectiveCamera(
            60,
            this.sceneContainer.offsetWidth / this.sceneContainer.offsetHeight,
            0.1,
            150000000
        )

        // First Person Controls
        this.firstPerson.controls = new PointerLockControls(
            this.firstPerson.camera
        )
        this.firstPerson.controls.getObject().rotation.set(Math.PI, Math.PI, 0)
        this.firstPerson.controls
            .getObject()
            .position.set(0, 10000000 / projection.radiusScale, 0)
        scene.add(this.firstPerson.controls.getObject())

        if (this.isFirstPerson) {
            this.requestPointerLocking()
        } else {
            this.camera = this.orbit.camera
            this.controls = this.orbit.controls
        }

        this.updateSize()
        this.setupEvents()

        this.orbit.controls.update()
    }

    swap(lockControls, skipLock): void {
        this.isFirstPerson = !this.isFirstPerson
        if (this.isFirstPerson) {
            this.firstPerson.lockControls = lockControls || false
            if (!skipLock) this.requestPointerLocking()
            this.inToFirstPerson()
        } else {
            this.outFromFirstPerson()
            this.camera = this.orbit.camera
            this.controls = this.orbit.controls
        }
    }

    private inToFirstPerson(): void {
        this.isFirstPerson = true
        this.toggleCrosshair(true)
        this.camera = this.firstPerson.camera
        this.firstPerson.controls.enabled = !this.firstPerson.lockControls
        this.controls = this.firstPerson.controls
        this.orbit.controls.resetPosition()
    }
    private outFromFirstPerson(): void {
        this.isFirstPerson = false
        this.toggleCrosshair(false)
        this.firstPerson.controls.enabled = false
        this.camera = this.orbit.camera
        this.controls = this.orbit.controls
    }

    private toggleCrosshair(on: boolean): void {
        // Make it if it's unmade
        // TODO:
        if (this._.crosshair == null) {
            this._.crosshair = document.createElement('div')
            this._.crosshair.id = '_lithosphere_crosshair'
            // @ts-ignore
            this._.crosshair.style = [
                'position: absolute',
                'left: calc(50% - 10px)',
                'top: calc(50% - 10px)',
                'width: 18px',
                'height: 18px',
                'border-radius: 15px',
                'border: 3px solid lime',
            ].join(';')
            this.container.appendChild(this._.crosshair)
        }
        if (on) this._.crosshair.style.display = 'inherit'
        else this._.crosshair.style.display = 'none'
    }

    private requestPointerLocking(): void {
        const havePointerLock = 'pointerLockElement' in document

        if (havePointerLock) {
            const element = document.body
            const pointerlockchange = () => {
                if (document.pointerLockElement === element) {
                    this.inToFirstPerson()
                } else {
                    this.outFromFirstPerson()
                }
            }
            const pointerlockerror = function (e) {
                alert('Pointer Lock Error')
            }

            // Hook pointer lock state change events
            document.addEventListener(
                'pointerlockchange',
                pointerlockchange,
                false
            )
            document.addEventListener(
                'mozpointerlockchange',
                pointerlockchange,
                false
            )
            document.addEventListener(
                'webkitpointerlockchange',
                pointerlockchange,
                false
            )

            document.addEventListener(
                'pointerlockerror',
                pointerlockerror,
                false
            )
            document.addEventListener(
                'mozpointerlockerror',
                pointerlockerror,
                false
            )
            document.addEventListener(
                'webkitpointerlockerror',
                pointerlockerror,
                false
            )

            // Ask the browser to lock the pointer
            element.requestPointerLock = element.requestPointerLock

            if (/Firefox/i.test(navigator.userAgent)) {
                const fullscreenchange = function () {
                    if (document.fullscreenElement === element) {
                        document.removeEventListener(
                            'fullscreenchange',
                            fullscreenchange
                        )
                        document.removeEventListener(
                            'mozfullscreenchange',
                            fullscreenchange
                        )

                        element.requestPointerLock()
                    }
                }
                document.addEventListener(
                    'fullscreenchange',
                    fullscreenchange,
                    false
                )
                document.addEventListener(
                    'mozfullscreenchange',
                    fullscreenchange,
                    false
                )

                element.requestFullscreen()
            } else {
                element.requestPointerLock()
            }
        } else {
            this.isFirstPerson = false
            alert('This browser does not support Pointer Locking.')
        }
    }

    setupEvents(): void {
        document.addEventListener('keydown', this.onKeyDown, false)
        document.addEventListener('keyup', this.onKeyUp, false)

        window.addEventListener('resize', this.updateSize, false)
    }

    onKeyDown = (event: KeyboardEvent): void => {
        if (this.firstPerson.lockControls) return

        this.isShift = event.shiftKey
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = true
                break
            case 37: // left
            case 65: // a
                this.moveLeft = true
                break
            case 40: // down
            case 83: // s
                this.moveBackward = true
                break
            case 39: // right
            case 68: // d
                this.moveRight = true
                break
            case 32: // space
                if (this.canJump === true) this.velocity.y += 350
                this.canJump = false
                break
        }
    }

    onKeyUp = (event: KeyboardEvent): void => {
        if (this.firstPerson.lockControls) return

        this.isShift = event.shiftKey
        switch (event.keyCode) {
            case 38: // up
            case 87: // w
                this.moveForward = false
                break
            case 37: // left
            case 65: // a
                this.moveLeft = false
                break
            case 40: // down
            case 83: // s
                this.moveBackward = false
                break
            case 39: // right
            case 68: // d
                this.moveRight = false
                break
        }
    }

    updateSize = (): void => {
        this.orbit.camera.aspect =
            this.sceneContainer.offsetWidth / this.sceneContainer.offsetHeight
        this.orbit.camera.updateProjectionMatrix()
        this.firstPerson.camera.aspect =
            this.sceneContainer.offsetWidth / this.sceneContainer.offsetHeight
        this.firstPerson.camera.updateProjectionMatrix()
    }

    setNearFarPlane = (farther, near, far, keepNear): void => {
        if (keepNear === true) this._.keepNear = true
        if (keepNear === false) this._.keepNear = false

        if (farther) {
            if (!this._.keepNear)
                this.orbit.camera.near = this.orbit.near * 10000
            //Cameras.orbit.camera.far = Cameras.orbit.far / 100
        } else {
            if (!this._.keepNear) this.orbit.camera.near = this.orbit.near
            this.orbit.camera.far = this.orbit.far
        }
        if (near != null) this.orbit.camera.near = near
        if (far != null) this.orbit.camera.far = far

        this.orbit.camera.updateProjectionMatrix()
    }

    setFirstPersonHeight = (height): void => {
        this.firstPerson.height = height || 3
    }

    getFirstPersonFocalLength = (): number => {
        return this.firstPerson.camera.getFocalLength()
    }
    setFirstPersonFocalLength = (focalLength): void => {
        this.firstPerson.camera.setFocalLength(focalLength)
    }

    getFirstPersonFOV = (): number => {
        return this.firstPerson.camera.fov
    }
    setFirstPersonFOV = (fov): void => {
        this.firstPerson.camera.fov = fov
        this.firstPerson.camera.updateProjectionMatrix()
    }

    getFirstPersonAspect = (): number => {
        return this.firstPerson.camera.aspect
    }
    setFirstPersonAspect = (aspect): void => {
        this.firstPerson.camera.aspect = aspect
        this.firstPerson.camera.updateProjectionMatrix()
    }

    // In degrees
    setCameraAzimuthElevation = (az, el, cameraIsFirstPerson): void => {
        this.firstPerson.controls.getObject().rotation.y =
            (-az + 180) * (Math.PI / 180)
        this.firstPerson.controls.getPitchObject().rotation.x =
            el * (Math.PI / 180)
    }

    update = (): Vector2 => {
        if (this.isFirstPerson) {
            const time = performance.now()
            const delta = (time - this.prevTime) / 1000
            this.prevTime = time

            this.velocity.x -= this.velocity.x * 10.0 * delta
            this.velocity.z -= this.velocity.z * 10.0 * delta

            this.velocity.y -= 9.8 * 100.0 * delta // 100.0 = mass

            if (this.moveForward) this.velocity.z -= 400.0 * delta
            if (this.moveBackward) this.velocity.z += 400.0 * delta

            if (this.moveLeft) this.velocity.x -= 400.0 * delta
            if (this.moveRight) this.velocity.x += 400.0 * delta
            const rp = Utils.rotatePoint(
                { x: this.velocity.x * delta, y: this.velocity.z * delta },
                [0, 0],
                -this.firstPerson.controls.getObject().rotation.y
            )
            if (this.isShift) {
                rp.x *= 3
                rp.y *= 3
            }
            return new Vector2(rp.x, rp.y)
        }
        return null
    }
}
