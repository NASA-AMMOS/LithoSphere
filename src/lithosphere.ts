import {
    Renderer,
    Projection,
    Cameras,
    Shaders,
    TiledWorld,
    Events,
} from './core'
import {
    Scene,
    Object3D,
    AmbientLight,
    Vector3,
    SphereBufferGeometry,
    Mesh,
    MeshBasicMaterial,
    TextureLoader,
    Raycaster,
    BufferGeometry,
    LineBasicMaterial,
    Line,
} from 'three'

//import Utils from './utils'

import Layers from './layers'
import Controls from './controls'
import LoadingScreen from './secondary/loadingScreen'

import { Options, XYZ, LatLng, LatLngElev, LatLngZ } from './generalTypes'

interface Private {
    containerId: string
    container: HTMLElement
    sceneContainer: HTMLElement
    wasInitialized: boolean
    rendererWrapper: any
    renderer: any
    cameras: any
    cameraPositionTarget: number[]
    tiledWorld: TiledWorld
    events: Events
    maxZoom: number
    minNativeZoom: number
    loader: TextureLoader
    raycaster: Raycaster
    updateEveryNthRender: number
    counters: {
        update: number
        frame: number
    }
    lastCameraWasFirst: boolean
    firstUpdate: boolean
    firstLoad: boolean
    loadingScreen: any
    // Whether the container is open and has a > 0 area
    renderOnlyWhenOpen: boolean
    //The zoom level at which to behave differently
    zCutOff: number
    firstViewOverride: any
    mouseIsInScene: boolean
    // Was developed for Mars initially and sometimes we scale against it for other bodies
    // (for stuff like pan speed)
    marsRadius: number
}

export default class LithoSphere {
    _: Private
    options: Options
    projection: Projection
    layers: Layers
    controls: Controls
    addLayer: Function
    removeLayer: Function
    toggleLayer: Function
    setLayerOpacity: Function
    setLayerFilterEffect: Function
    setLayerSpecificOptions: Function
    getLayerByName: Function
    hasLayer: Function
    addControl: Function
    removeControl: Function
    scene: Scene
    scenesLOD: Scene[]
    sceneBack: Scene
    sceneFront: Scene
    planetCenter: Vector3
    planet: Object3D
    planetsLOD: Object3D[]
    starsphere: Mesh //starry skysphere
    atmosphere: Mesh
    zoom: number
    trueZoom: number
    mouse: LatLngElev
    exaggeration: number
    frontGroup: Object3D

    constructor(containerId: string, options: Options) {
        // Add a sub container specifically for the scene
        const sceneContainer = document
            .getElementById(containerId)
            .appendChild(document.createElement('div'))
        sceneContainer.id = '_lithosphere_scene'
        sceneContainer.style.width = '100%'
        sceneContainer.style.height = '100%'

        this._ = {
            containerId: containerId,
            container: document.getElementById(containerId),
            sceneContainer: sceneContainer,
            wasInitialized: false,
            rendererWrapper: null,
            renderer: null,
            cameras: null,
            cameraPositionTarget: null,
            tiledWorld: null,
            events: null,
            maxZoom: 0,
            minNativeZoom: 0,
            loader: new TextureLoader(),
            raycaster: new Raycaster(),
            updateEveryNthRender: 1,
            counters: {
                update: 0,
                frame: 0,
            },
            lastCameraWasFirst: false,
            firstUpdate: true,
            firstLoad: false,
            loadingScreen: null,
            renderOnlyWhenOpen: true,
            zCutOff: 3,
            firstViewOverride: null,
            mouseIsInScene: false,
            marsRadius: 3396190,
        }

        this._.container.style.position = 'relative'

        this.scene = new Scene()
        this.scenesLOD = [new Scene(), new Scene(), new Scene()]
        this.sceneBack = new Scene()
        this.sceneFront = new Scene()
        this.planet = new Object3D()
        this.planetsLOD = [new Object3D(), new Object3D(), new Object3D()]
        this.frontGroup = new Object3D()

        const defaultOptions: Options = {
            loadingScreen: true,
            tileMapResource: null,
            customParsers: {},
            radiusOfTiles: 4,
            useLOD: true,
            LOD: [
                { radiusOfTiles: 4, zoomsUp: 3 },
                { radiusOfTiles: 2, zoomsUp: 7 },
                { radiusOfTiles: 2, zoomsUp: 11 },
            ],
            tileResolution: 32,
            trueTileResolution: 256,
            showAxes: false,
            wireframeMode: false,
            exaggeration: 1,
            renderOnlyWhenOpen: true,
            targetYOffset: 0,
            highlightColor: 'yellow',
            activeColor: 'red',
        }
        options = options || {}
        this.options = { ...defaultOptions, ...options }

        this._init()
    }

    _init(): boolean {
        // Create the renderer
        this._.rendererWrapper = new Renderer(this._.sceneContainer)
        this._.renderer = this._.rendererWrapper.renderer

        // Make sure it was made and set to initialized
        if (this._.renderer) {
            this._.wasInitialized = true
        } else return false

        // Initialize projection
        this.projection = new Projection(
            this.options.majorRadius,
            this.options.minorRadius,
            this.options.tileMapResource,
            this.options.trueTileResolution
        )

        // Camera(s)
        this._.cameras = new Cameras(
            this._.container,
            this._.sceneContainer,
            this.scene,
            this.projection
        )

        // Layers
        this.layers = new Layers(this)
        // Expose these function at the top level of the api for convenience
        this.addLayer = this.layers.addLayer
        this.removeLayer = this.layers.removeLayer
        this.toggleLayer = this.layers.toggleLayer
        this.setLayerOpacity = this.layers.setLayerOpacity
        this.setLayerFilterEffect = this.layers.setLayerFilterEffect
        this.setLayerSpecificOptions = this.layers.setLayerSpecificOptions
        this.getLayerByName = this.layers.getLayerByName
        this.hasLayer = this.layers.hasLayer

        // Initialize Tiled World
        this._.tiledWorld = new TiledWorld(this)

        this.zoom = 10
        this.trueZoom = this.zoom
        this.mouse = {
            lat: null,
            lng: null,
            elev: null,
        }

        // planet
        this.planetCenter = new Vector3(
            0,
            -(this.projection.radii.major / this.projection.radiusScale),
            0
        )
        this.planet.position.set(
            this.planetCenter.x,
            -this.planetCenter.y,
            this.planetCenter.z
        )
        this.scene.add(this.planet)

        // scenesLOD
        this.scenesLOD[0].add(this.planetsLOD[0])
        this.scenesLOD[1].add(this.planetsLOD[1])
        this.scenesLOD[2].add(this.planetsLOD[2])

        // frontGroup
        this.frontGroup.position.set(
            this.planetCenter.x,
            -this.planetCenter.y,
            this.planetCenter.z
        )
        this.sceneFront.add(this.frontGroup)

        // Lights
        this.scene.add(new AmbientLight(0xfefefe))

        //Make the starsphere
        if (this.options.starsphere) {
            const starsphereGeometry = new SphereBufferGeometry(
                this.planetCenter.y * 1000,
                64,
                64
            )
            const starsphereMaterial = new MeshBasicMaterial({
                color: this.options.starsphere.color || 0xaaaaaa,
            })
            if (this.options.starsphere.url)
                starsphereMaterial.map = this._.loader.load(
                    this.options.starsphere.url
                )
            starsphereMaterial.opacity = 1
            this.starsphere = new Mesh(starsphereGeometry, starsphereMaterial)
            this.sceneBack.add(this.starsphere)
        }

        //Basic atmospheric sphere behind everything
        if (this.options.atmosphere) {
            this.atmosphere = new Mesh(
                new SphereBufferGeometry(this.planetCenter.y * 1.5, 128, 128),
                Shaders.atmosphere(this.options.atmosphere.color)
            )
            this.sceneBack.add(this.atmosphere)
        }

        //AXES
        if (this.options.showAxes === true) {
            const materialx = new LineBasicMaterial({ color: 0xff0000 })
            const geometryx = new BufferGeometry().setFromPoints([
                new Vector3(0 * 2, 0, 0),
                new Vector3(this.planetCenter.y * 2, 0, 0),
            ])
            const linex = new Line(geometryx, materialx)
            this.scene.add(linex)
            const materialy = new LineBasicMaterial({ color: 0x00ff00 })
            const geometryy = new BufferGeometry().setFromPoints([
                new Vector3(0, 0, 0),
                new Vector3(0, this.planetCenter.y * 2, 0),
            ])
            const liney = new Line(geometryy, materialy)
            this.scene.add(liney)

            const materialz = new LineBasicMaterial({ color: 0x0000ff })
            const geometryz = new BufferGeometry().setFromPoints([
                new Vector3(0, 0, 0),
                new Vector3(0, 0, this.planetCenter.y * 2),
            ])
            const linez = new Line(geometryz, materialz)
            this.scene.add(linez)
        }
        //END AXES

        // UI Control elements
        this.controls = new Controls(this)
        // Expose these function at the top level of the api for convenience
        this.addControl = this.controls.addControl
        this.removeControl = this.controls.removeControl

        if (this.options.renderOnlyWhenOpen === false) {
            this._.renderOnlyWhenOpen = false
        }

        this._.loadingScreen = new LoadingScreen(this)

        // Finally add events (should be last new Constructed class)
        this._.events = new Events(this)

        //Set default view
        this.setCenter(this.options.initialView)

        // Action!
        this._animate()

        return true
    }

    //MAIN RENDER LOOP
    _animate = (): void => {
        window.requestAnimationFrame(this._animate)
        this._render()
    }

    _render(): void {
        this._.renderer.clear()

        if (this._.renderOnlyWhenOpen) {
            const containerRect = this._.container.getBoundingClientRect()
            if (containerRect.width <= 0 || containerRect.height <= 0) return
        }

        this._.counters.update =
            (this._.counters.update + 1) % this._.updateEveryNthRender
        if (this._.counters.update === 0) this._update()
        if (!this._.cameras.isFirstPerson)
            this._.cameras.orbit.controls.update()

        this.layers.tile3d.forEach((tile3d) => {
            tile3d.renderer.update()
        })

        this._.renderer.render(this.sceneBack, this._.cameras.camera)
        this._.renderer.clearDepth()
        this._.renderer.render(this.scenesLOD[2], this._.cameras.camera)
        this._.renderer.clearDepth()
        this._.renderer.render(this.scenesLOD[1], this._.cameras.camera)
        this._.renderer.clearDepth()
        this._.renderer.render(this.scenesLOD[0], this._.cameras.camera)
        this._.renderer.clearDepth()
        this._.renderer.render(this.scene, this._.cameras.camera)
        this._.renderer.clearDepth()
        this._.renderer.render(this.sceneFront, this._.cameras.camera)
    }

    _update(): void {
        if (!this._.wasInitialized) return
        if (this._.renderOnlyWhenOpen) {
            const containerRect = this._.container.getBoundingClientRect()
            if (containerRect.width <= 0 || containerRect.height <= 0) return
        }

        this._.counters.frame = (this._.counters.frame + 1) % 4

        this.scene.rotation.x = 0
        this.scene.position.y = 0

        if (!this._.firstUpdate) {
            this._.tiledWorld.refreshTiles()
        }

        this._.events._checkDesiredZoom()
        this.controls._onUpdateEvent()

        if (this._.cameras.isFirstPerson) {
            this._.lastCameraWasFirst = true
            this._.cameras.firstPerson.controls.getObject().position.y =
                this._.cameras.orbit.controls.target.y -
                this._.cameras.firstPerson.height / this.projection.radiusScale
            const v2 = this._.cameras.update()
            this._.events._rotateGlobe(v2)
            this._.events._onMouseMove()
            this.controls._onFirstPersonUpdate()
        } else if (this._.lastCameraWasFirst) {
            this._.lastCameraWasFirst = false
            this.controls._onOrbitalUpdate()
        }

        /*
        //Globe_.updateTileShaderVars();
        THREE.VRController.update()

        //set default camera from url if there is one
        if (L_.FUTURES.globeCamera != null) {
            var c = L_.FUTURES.globeCamera
            Cameras.orbit.camera.position.set(c[0], c[1], c[2])
            Cameras.orbit.controls.target.x = c[3]
            Cameras.orbit.controls.target.y = c[4]
            Cameras.orbit.controls.target.z = c[5]
            Cameras.orbit.controls.update()
            L_.FUTURES.globeCamera = null
        }
*/
        if (this._.firstUpdate) {
            //Set default view
            if (this._.firstViewOverride != null)
                this.setCenter(this._.firstViewOverride)
            else this.setCenter(this.options.initialView, true)

            const o = this._.cameras.orbit
            const cam = o.camera
            const con = o.controls
            const pos = cam.position
            const tar = con.target
            this._.cameraPositionTarget = [
                pos.x,
                pos.y,
                pos.z,
                tar.x,
                tar.y,
                tar.z,
            ]

            this._.firstUpdate = false
        }
    }

    // The first time all content loads (called by tiledWorld)
    _onFirstLoad = (): void => {
        this._.firstLoad = true
        // Snaps to surface
        this._.events._rotateGlobe(
            { pageX: 0, pageY: 0 },
            { x: 0.0001, y: 0.0001 }
        )
        // Just in case canvas width and height messes up in some setups
        this._.rendererWrapper.updateSize()

        setTimeout(() => {
            // Repositions center
            this.setCenter(this.options.initialView, false, true)
            this._.events._onZoom()
            this._.loadingScreen.end()
        }, 100)
    }

    // Other

    // COORDS=============
    // Sets the center coordinate and zoom view of the scene
    setCenter = (
        latLngZoom: LatLngZ,
        ignoreZoom?: boolean,
        accountForHeight?: boolean
    ): boolean => {
        if (!this._.wasInitialized) return false

        //Rotate globe
        //lat is a rotation around x axis ( 90 - because top is 0 in world space)
        const rotLat = (90 - (latLngZoom.lat || 0)) * (Math.PI / 180)
        //lng is a rotation around y axis
        const rotLng = (latLngZoom.lng || 0) * (Math.PI / 180)
        //reset to 0, though its really only setting z to 0
        this.planet.rotation.set(rotLat, rotLng, 0)

        this._.events._matchPlanetsLODToPlanet()

        //Change zoom
        if (latLngZoom.zoom != null && ignoreZoom != true) {
            this.zoom = latLngZoom.zoom
            // Globe_.updateZoomDependents() //TODO

            const center = this.getCenter(true)

            //Zoom globe
            this._.cameras.orbit.camera.position.y = -(
                40000000 /
                this.projection.radiusScale /
                Math.pow(2, this.zoom)
            )
            if (accountForHeight)
                // @ts-ignore
                this._.cameras.orbit.camera.position.y -= center.height
            this._.cameras.firstPerson.controls.getObject().position.y = -(
                40000000 /
                this.projection.radiusScale /
                Math.pow(2, this.zoom)
            )
            if (accountForHeight)
                this._.cameras.firstPerson.controls.getObject().position.y -=
                    // @ts-ignore
                    center.height
        }

        this._.events._refreshFrontGroupRotation()
        return true
    }

    getCenterXYZ = (raycasted?: boolean): Vector3 => {
        if (raycasted) {
            //Between planet center and straight up
            this._.raycaster.set(
                new Vector3(0, this.planetCenter.y, 0),
                new Vector3(0, 1, 0)
            )

            const planeArr = []
            for (let i = 0; i < this._.tiledWorld.tilesDrawn.length; i++) {
                if (!this._.tiledWorld.tilesDrawn[i].isLODTile)
                    planeArr.push(this._.tiledWorld.tilesDrawn[i].t)
            }
            const intersects = this._.raycaster.intersectObjects(planeArr)
            if (intersects.length > 0) {
                //Since we lowered the planet, we need to raise the intersection pt again for calculations
                intersects[0].point.y += this.planetCenter.y
                return intersects[0].point
            }
            return new Vector3(0, 0, 0)
        } else {
            //Just rotate the vector from planet center to Cameras.camera lookat(0,0,0)
            let centerPoint = {
                x: this.planetCenter.x,
                y: this.planetCenter.y,
                z: this.planetCenter.z,
            }

            centerPoint = this.projection.rotatePoint3D(centerPoint, {
                x: -this.planet.rotation.x,
                y: 0,
                z: 0,
            })
            centerPoint = this.projection.rotatePoint3D(centerPoint, {
                x: 0,
                y: -this.planet.rotation.y,
                z: 0,
            })
            centerPoint = this.projection.rotatePoint3D(centerPoint, {
                x: 0,
                y: 0,
                z: -this.planet.rotation.z,
            })

            return new Vector3(centerPoint.x, centerPoint.y, centerPoint.z)
        }
    }

    getCenter = (raycasted?: boolean): LatLng => {
        const centerXYZ = this.getCenterXYZ(raycasted)
        if (raycasted) {
            let center = JSON.parse(JSON.stringify(centerXYZ))

            //Since the planet was rotated during pans, rotate the intersection back
            center = this.projection.rotatePoint3D(center, {
                x: -this.planet.rotation.x,
                y: 0,
                z: 0,
            })
            center = this.projection.rotatePoint3D(center, {
                x: 0,
                y: -this.planet.rotation.y,
                z: 0,
            })
            center = this.projection.rotatePoint3D(center, {
                x: 0,
                y: 0,
                z: -this.planet.rotation.z,
            })
            center = this.projection.vector3ToLatLng(center)
            center.height =
                centerXYZ.length() * this.projection.radiusScale -
                this.projection.radii.major
            return center
        }
        return this.projection.vector3ToLatLng(centerXYZ)
    }

    getCenterElevation = (): number => {
        return (
            this.getCenterXYZ(true).length() * this.projection.radiusScale -
            this.projection.radii.major
        )
    }

    getCenterElevationRaw = (): number => {
        const elev = this.getCenterXYZ(true).length()
        //If the height data hasn't loaded yet, we'll get a 0
        if (elev <= 0.1 && elev >= -0.1) return //elev = projection.radiusOfPlanetMajor / projection.radiusScale;
        return elev
    }

    getElevationAtLngLat = (lng: number, lat: number): number => {
        const v = this.projection.lonLatToVector3(
            lng,
            lat,
            100000 * this.options.exaggeration
        )

        const tempObj = new Object3D()
        tempObj.position.set(0, -this.planetCenter.y, 0)
        tempObj.rotation.set(
            this.planet.rotation.x,
            this.planet.rotation.y,
            this.planet.rotation.z
        )

        const geometry = new SphereBufferGeometry(200, 32, 32)
        const material = new MeshBasicMaterial({ color: 0xffff00 })

        const tempObj2 = new Mesh(geometry, material)
        tempObj2.position.set(v.x, v.y, v.z)

        tempObj.add(tempObj2)
        tempObj.updateMatrixWorld()

        const vector = new Vector3()
        vector.setFromMatrixPosition(tempObj2.matrixWorld)

        this._.raycaster.set(
            vector,
            new Vector3(0, -this.planetCenter.y, 0).normalize()
        )

        const planeArr = []
        for (let i = 0; i < this._.tiledWorld.tilesDrawn.length; i++) {
            if (!this._.tiledWorld.tilesDrawn[i].isLODTile)
                planeArr.push(this._.tiledWorld.tilesDrawn[i].t)
        }
        const intersects = this._.raycaster.intersectObjects(planeArr)
        if (intersects.length > 0) {
            intersects[intersects.length - 1].point.y += this.planetCenter.y
            return (
                intersects[intersects.length - 1].point.length() *
                    this.projection.radiusScale -
                this.projection.radii.major
            )
        }
        return 0
    }

    //return x y z of current center tile
    getCenterTile = (): XYZ => {
        const centerll = this.getCenter()
        return this.projection.latLngZ2TileXYZ(
            centerll.lat,
            centerll.lng,
            this.zoom
        )
    }

    // Getter for cameras
    getCameras = () => {
        return {
            camera: this._.cameras.camera,
            isFirstPerson: this._.cameras.isFirstPerson,
            firstPerson: this._.cameras.firstPerson,
            orbit: this._.cameras.orbit,
        }
    }

    // Getter for container
    getContainer = () => {
        return this._.container
    }

    // Induces a container resize event manually
    // Useful when changing the size of LithoSphere's container without
    // changing the size of the window
    invalidateSize = (): void => {
        if (this._.wasInitialized) {
            this._.renderer.setSize(
                this._.sceneContainer.offsetWidth,
                this._.sceneContainer.offsetHeight
            )

            this._.cameras.updateSize()
        }
    }
}
