import { Vector3, Matrix4, Sprite } from 'three'
import circle from '@turf/circle'
import booleanIntersects from '@turf/boolean-intersects'

import Utils from '../utils'

interface Private {
    mouseXY: { x: number; y: number }
    prevMouseXY: { x: number; y: number }
    oldPrevMouseXY: { x: number; y: number }
    containerXY: { x: number; y: number }
    lastZoomDelta: number
    desiredZoom: number
    // These are so that if someone zooms in a lot, only the tiles at the zoom they
    // end on are loaded and not all of those in between
    // Counter of frames since last zoom movement
    zoomedSince: number
    // Frames to wait between zoomend and zoom tile generation
    zoomWait: number
    highlightTimeout: any
    rotationDampingInterval: any
    panned: boolean
}

export default class Events {
    _: Private
    // parent
    p: any
    activeFeature: any
    hoveredFeature: any
    hoverInfo: HTMLElement

    constructor(parent: any) {
        this.p = parent
        this.activeFeature = null
        this.hoveredFeature = null
        this.hoverInfo = null

        this._ = {
            mouseXY: { x: null, y: null },
            prevMouseXY: { x: null, y: null },
            oldPrevMouseXY: { x: null, y: null },
            containerXY: { x: null, y: null },
            lastZoomDelta: 1,
            desiredZoom: null,
            zoomedSince: 0,
            zoomWait: 30,
            highlightTimeout: null,
            rotationDampingInterval: null,
            panned: false,
        }

        this._init()
    }

    _init(): void {
        this._matchPlanetsLODToPlanet()

        //Event Listeners
        this.p._.sceneContainer.addEventListener(
            'mousewheel',
            this._onZoom,
            false
        )
        this.p._.sceneContainer.addEventListener(
            'DOMMouseScroll',
            this._onZoom,
            false
        )
        this.p._.sceneContainer.addEventListener('wheel', this._onZoom, false)
        this.p._.sceneContainer.addEventListener(
            'mouseleave',
            this.p.controls._onMouseOut,
            false
        )
        this.p._.sceneContainer.addEventListener('touchend', this._onTouchZoom)
        this.p._.sceneContainer.addEventListener(
            'mousedown',
            this._rotateGlobe_MouseDown,
            false
        )

        //container.addEventListener('touchstart', _rotateGlobe_MouseDown, false)
        this.p._.sceneContainer.addEventListener(
            'mousemove',
            this._onMouseMove,
            false
        )
        this.p._.sceneContainer.addEventListener('click', this._onClick, false)

        this.p._.sceneContainer.addEventListener(
            'mouseenter',
            () => {
                this.p._.mouseIsInScene = true
            },
            false
        )
        this.p._.sceneContainer.addEventListener(
            'mouseleave',
            () => {
                this.p._.mouseIsInScene = false
            },
            false
        )

        window.addEventListener('keydown', this._onKeyDown, false)
        //container.addEventListener('click', onGlobeClick, false)
        //document.addEventListener('click', onGlobeClickPointerLock, false)

        //window.addEventListener('resize', updateGlobeCenterPos, false)
    }

    _rotateGlobe = (e: any, prevXY?, fromDamping?: boolean): void => {
        if (prevXY) {
            this._.prevMouseXY.x = prevXY.x
            this._.prevMouseXY.y = prevXY.y
        } else if (!fromDamping) {
            this._.panned = true
        }

        if (!e) return
        if (!e.pageX && e.touches)
            e.pageX = Utils.arrayAverage(e.touches, 'pageX')
        if (!e.pageY && e.touches)
            e.pageY = Utils.arrayAverage(e.touches, 'pageY')

        if (
            e.hasOwnProperty('x') &&
            e.hasOwnProperty('y') &&
            this.p._.cameras.isFirstPerson
        ) {
            this._.prevMouseXY.x = 0
            this._.prevMouseXY.y = 0
            e.pageX = e.x
            e.pageY = e.y
        }

        //rotation speed (radians per event call)
        const rotSpeed =
            Utils.getRadiansPerPixel(this.p.trueZoom) *
            0.5 *
            (3396190 / this.p.projection.radii.major)
        let pixelDif = 0

        //Find vectors perpendicular to Cameras.camera forward vector
        //Y is 0 because we're projecting the vector on a flat x,z plane because how
        // high our Cameras.camera is doesn't matter
        const cpX = new Vector3(
            this.p._.cameras.orbit.camera.position.x,
            0,
            this.p._.cameras.orbit.camera.position.z
        )
        //rotate vector around y axis 90deg
        cpX.applyAxisAngle(new Vector3(0, 1, 0), Math.PI / 2)

        const cpY = new Vector3(
            this.p._.cameras.orbit.camera.position.x,
            0,
            this.p._.cameras.orbit.camera.position.z
        )

        if (e.pageY < this._.prevMouseXY.y) {
            //down
            pixelDif = Math.abs(e.pageY - this._.prevMouseXY.y)
            //TODO: Don't rotate passed South pole
            this._rotateAroundArbAxis(cpX, rotSpeed * pixelDif)
        } else if (e.pageY > this._.prevMouseXY.y) {
            //up
            pixelDif = Math.abs(e.pageY - this._.prevMouseXY.y)
            //TODO: Don't rotate past North pole
            this._rotateAroundArbAxis(cpX, -rotSpeed * pixelDif)
        }

        if (e.pageX > this._.prevMouseXY.x) {
            //left
            pixelDif = Math.abs(e.pageX - this._.prevMouseXY.x)
            this._rotateAroundArbAxis(cpY, -rotSpeed * pixelDif)
        } else if (e.pageX < this._.prevMouseXY.x) {
            //right
            pixelDif = Math.abs(e.pageX - this._.prevMouseXY.x)
            this._rotateAroundArbAxis(cpY, rotSpeed * pixelDif)
        }

        //Update oldPrevMouseXY
        this._.oldPrevMouseXY.x = this._.prevMouseXY.x
        this._.oldPrevMouseXY.y = this._.prevMouseXY.y

        //Update prevMouseXY
        this._.prevMouseXY.x = e.pageX
        this._.prevMouseXY.y = e.pageY

        //Snap Cameras.camera lookat to Globe_
        if (this.p.zoom <= this.p._.zCutOff) {
            this.p._.cameras.orbit.controls.target.x = 0
            this.p._.cameras.orbit.controls.target.y = -this.p.planetCenter.y
            this.p._.cameras.orbit.controls.target.z = 0
            this.p._.cameras.orbit.controls.update()
        } else {
            const elevRaw = this.p.getCenterElevationRaw()
            if (elevRaw != null) {
                const newLookAtY = -(elevRaw + this.p.planetCenter.y)
                if (newLookAtY != 0 && newLookAtY != -10000)
                    this.p._.cameras.orbit.controls.target.y =
                        newLookAtY - this.p.options.targetYOffset
            }

            // Call control onMoves
            const center = this.p.getCenter()
            this.p.controls._onMove(center.lng, center.lat, center.height)
        }
    }

    // Rotate the globe around an axis in world space (the axis passes through the object's position)
    private _rotateAroundArbAxis(axis, radians, noPremultiply?: boolean): void {
        const rotationMatrix = new Matrix4()
        rotationMatrix.makeRotationAxis(axis.normalize(), radians)
        if (noPremultiply !== true)
            rotationMatrix.multiply(this.p.planet.matrix) // pre-multiply
        this.p.planet.matrix = rotationMatrix
        this.p.planet.rotation.setFromRotationMatrix(this.p.planet.matrix)
        this._matchPlanetsLODToPlanet()
        this._refreshFrontGroupRotation()
    }

    private _rotateGlobe_MouseDown = (e): void => {
        clearInterval(this._.rotationDampingInterval)
        //if (e.which === 3 || e.button === 2) { //Right click
        if (e.which === 1 || e.button === 0) {
            //Left click
            this._.prevMouseXY.x = e.pageX
            this._.prevMouseXY.y = e.pageY
            this.p._.sceneContainer.addEventListener(
                'mousemove',
                // @ts-ignore: No overload matches this call
                this._rotateGlobe,
                false
            )
            this.p._.sceneContainer.addEventListener(
                'mouseup',
                this._rotateGlobe_MouseUp,
                false
            )
            this.p._.sceneContainer.addEventListener(
                'mouseleave',
                this._rotateGlobe_MouseUp,
                false
            )
        } else if (e.touches && e.touches.length > 2) {
            //Multi touch
            this._.prevMouseXY.x = Utils.arrayAverage(e.touches, 'pageX')
            this._.prevMouseXY.y = Utils.arrayAverage(e.touches, 'pageY')
            this.p._.sceneContainer.addEventListener(
                'touchmove',
                // @ts-ignore: No overload matches this call
                this._rotateGlobe,
                false
            )
            this.p._.sceneContainer.addEventListener(
                'touchend',
                this._rotateGlobe_MouseUp,
                false
            )
        }
    }
    private _rotateGlobe_MouseUp = (e): void => {
        this.p._.sceneContainer.removeEventListener(
            'mousemove',
            // @ts-ignore: No overload matches this call
            this._rotateGlobe
        )
        this.p._.sceneContainer.removeEventListener(
            'mouseup',
            this._rotateGlobe_MouseUp
        )
        this.p._.sceneContainer.removeEventListener(
            'mouseleave',
            this._rotateGlobe_MouseUp
        )
        this.p._.sceneContainer.removeEventListener(
            'touchmove',
            // @ts-ignore: No overload matches this call
            this._rotateGlobe
        )
        this.p._.sceneContainer.removeEventListener(
            'touchend',
            this._rotateGlobe_MouseUp
        )

        if (this._.panned) {
            // Basic damping
            clearInterval(this._.rotationDampingInterval)
            const dif = {
                x: this._.oldPrevMouseXY.x - this._.prevMouseXY.x,
                y: this._.oldPrevMouseXY.y - this._.prevMouseXY.y,
            }
            let difs = []
            while (dif.x > 2 || dif.x < -2 || dif.y > 2 || dif.y < -2) {
                const xSize = dif.x / 3
                const ySize = dif.y / 3
                dif.x -= xSize
                dif.y -= ySize
                difs.push({
                    x: dif.x,
                    y: dif.y,
                })
            }
            difs.reverse()
            this._.rotationDampingInterval = setInterval(() => {
                if (difs.length > 0)
                    this._rotateGlobe({ pageX: 0, pageY: 0 }, difs.pop(), true)
                else clearInterval(this._.rotationDampingInterval)
            }, 50)
        }
        this._.panned = false
    }

    //This sets the zoom to the desired zoom if zoomedSince is high enough
    _checkDesiredZoom(): void {
        this._.zoomedSince++
        if (this._.desiredZoom != null) {
            this.p._.cameras.setNearFarPlane(
                this.p.projection.radiusScale,
                this._.desiredZoom < 14
            )
            if (this._.zoomedSince > this._.zoomWait) {
                if (this._.desiredZoom >= this.p._.minNativeZoom)
                    this._setZoom(this._.desiredZoom)
                this._.desiredZoom = null
            }
        }
    }

    private _setZoom(newZoom): void {
        const zoomSave = this.p.zoom
        this.p.zoom = newZoom
        this.p.trueZoom = Math.max(0, newZoom)
        if (this.p.zoom < 0) this.p.zoom = 0
        if (this.p.zoom < this.p._.minNativeZoom)
            this.p.zoom = this.p._.minNativeZoom
        if (this.p.zoom > this.p._.maxZoom) this.p.zoom = this.p._.maxZoom

        this._.lastZoomDelta = Math.abs(this.p.zoom - zoomSave)

        // TODO this._updateZoomDependents()
    }

    _onZoom = (e?): void => {
        //2000 to 1000 units away from surface is zoom level 1
        //1000 to 500 is 2
        //500 to 250 is 3 and so on
        //We zoomed so reset the zoom counter
        this._.zoomedSince = 0

        const zoomDist = this.p._.cameras.orbit.camera.position.distanceTo(
            this.p._.cameras.orbit.controls.target
        )
        //Calculate what the zoom should be
        //Inverse of ( 4000 / Math.pow( 2, Globe_.zoom + 1) ) //4000/ 2^(z+1)
        // (thanks wolfram alpha inverse function calculator)

        const nf =
            8 - (parseInt(this.p.projection.radiusScale).toString().length - 1)
        let rf =
            Math.max(parseInt(this.p.planetCenter.y).toString().length - 7, 0) +
            (this.p.options.zoomLevelShift || 0)
        // Hacky way since zoom per radius functions aren't perfect
        if (Math.abs(this.p.planetCenter.y) > 30000000) rf += 1

        const dZoom =
            Math.ceil(
                (nf * Math.log(2) - Math.log(zoomDist / Math.pow(5, nf - 1))) /
                    Math.log(2)
            ) + rf

        this._.desiredZoom = dZoom

        this._attenuate()
    }

    _onTouchZoom = (e) => {
        if (e.touches && e.touches.length == 1) this._onZoom(e)
    }

    _matchPlanetsLODToPlanet(): void {
        for (let i = 0; i < this.p.planetsLOD.length; i++) {
            this.p.planetsLOD[i].matrix = this.p.planet.matrix
            this.p.planetsLOD[i].position.set(
                this.p.planet.position.x,
                this.p.planet.position.y,
                this.p.planet.position.z
            )
            this.p.planetsLOD[i].rotation.set(
                this.p.planet.rotation.x,
                this.p.planet.rotation.y,
                this.p.planet.rotation.z
            )
        }

        //And the atmosphere too
        if (this.p.atmosphere) {
            this.p.atmosphere.matrix = this.p.planet.matrix
            this.p.atmosphere.position.set(
                this.p.planet.position.x,
                this.p.planet.position.y,
                this.p.planet.position.z
            )
            this.p.atmosphere.rotation.set(
                this.p.planet.rotation.x,
                this.p.planet.rotation.y,
                this.p.planet.rotation.z
            )
        }
    }

    _refreshFrontGroupRotation(): void {
        this.p.frontGroup.rotation.set(
            this.p.planet.rotation.x,
            this.p.planet.rotation.y,
            this.p.planet.rotation.z
        )
    }

    private _onClick = (e?): void => {
        if (this.hoveredFeature && this.hoverInfo) {
            const layer = this.p.layers.getLayerByName(
                this.hoveredFeature.layerName
            )

            if (layer) {
                this.setActiveFeature({
                    layerName: this.hoveredFeature.layerName,
                    type: this.hoveredFeature.type,
                    obj: this.hoveredFeature.obj,
                    feature:
                        this.hoveredFeature.feature ||
                        this.hoveredFeature.obj.feature,
                    lnglat: {
                        lng: this.hoveredFeature.lnglat.lng,
                        lat: this.hoveredFeature.lnglat.lat,
                    },
                })

                if (typeof layer.onClick === 'function') {
                    layer.onClick(
                        JSON.parse(JSON.stringify(this.hoveredFeature.feature)),
                        JSON.parse(JSON.stringify(this.hoveredFeature.lnglat)),
                        layer
                    )
                }
            }
        }
    }

    private _onKeyDown = (e): void => {
        if (this.p._.cameras.isFirstPerson) return

        const speed = e.shiftKey ? 20 : 8

        switch (e.key) {
            case 'w':
            case 'ArrowUp':
                this._rotateGlobe({ pageX: 0, pageY: speed }, { x: 0, y: 0 })
                break
            case 'a':
            case 'ArrowLeft':
                this._rotateGlobe({ pageX: speed, pageY: 0 }, { x: 0, y: 0 })
                break
            case 's':
            case 'ArrowDown':
                this._rotateGlobe({ pageX: 0, pageY: -speed }, { x: 0, y: 0 })
                break
            case 'd':
            case 'ArrowRight':
                this._rotateGlobe({ pageX: -speed, pageY: 0 }, { x: 0, y: 0 })
                break
            case 'g':
            case 'PageDown':
                const lerpedDown = new Vector3().lerpVectors(
                    this.p._.cameras.orbit.camera.position,
                    this.p._.cameras.orbit.controls.target,
                    e.shiftKey ? -0.035 : -0.02
                )
                this.p._.cameras.orbit.camera.position.set(
                    lerpedDown.x,
                    lerpedDown.y,
                    lerpedDown.z
                )
                this._onZoom()
                break
            case 't':
            case 'PageUp':
                const lerpedUp = new Vector3().lerpVectors(
                    this.p._.cameras.orbit.camera.position,
                    this.p._.cameras.orbit.controls.target,
                    e.shiftKey ? 0.035 : 0.02
                )
                this.p._.cameras.orbit.camera.position.set(
                    lerpedUp.x,
                    lerpedUp.y,
                    lerpedUp.z
                )
                this._onZoom()
                break
            case 'q':
                this.p._.cameras.orbit.controls.rotateLeft(Math.PI / 64)
                break
            case 'e':
                this.p._.cameras.orbit.controls.rotateLeft(-Math.PI / 64)
                break
            case 'r':
                this.p._.cameras.orbit.controls.rotateUp(Math.PI / 64)
                break
            case 'f':
                this.p._.cameras.orbit.controls.rotateUp(-Math.PI / 64)
                break
        }
    }

    _onMouseMove = (e?): void => {
        this.p._.mouseIsInScene = true

        // from x [-1, 1] to y [1, -1]
        if (this.p._.cameras.isFirstPerson) {
            this._.mouseXY.x = 0
            this._.mouseXY.y = 0
        } else {
            this._.mouseXY.x =
                ((e.clientX -
                    this.p._.renderer.domElement.getBoundingClientRect().left) /
                    this.p._.renderer.domElement.clientWidth) *
                    2 -
                1
            this._.mouseXY.y =
                -(
                    (e.clientY -
                        this.p._.renderer.domElement.getBoundingClientRect()
                            .top) /
                    this.p._.renderer.domElement.clientHeight
                ) *
                    2 +
                1
        }

        this._.containerXY = {
            x: e ? e.offsetX : null,
            y: e ? e.offsetY : null,
        }
        this.updateHoverInfoPosition()

        // Let's raytrace all the tiles to see where the mouse is
        this.p._.raycaster.setFromCamera(
            this._.mouseXY,
            this.p._.cameras.camera
        )

        const intersectArr = []
        // Look at all tiles
        for (let i = 0; i < this.p._.tiledWorld.tilesDrawn.length; i++) {
            if (!this.p._.tiledWorld.tilesDrawn[i].isLODTile)
                intersectArr.push(this.p._.tiledWorld.tilesDrawn[i].t)
        }
        // Look at all vectors
        for (let i = 0; i < this.p.layers.vector.length; i++) {
            if (
                this.p.layers.vector[i].meshes &&
                this.p.layers.vector[i].meshes.children
            )
                for (
                    let j = 0;
                    j < this.p.layers.vector[i].meshes.children.length;
                    j++
                )
                    intersectArr.push(
                        this.p.layers.vector[i].meshes.children[j]
                    )
        }
        // Look at all curtains
        for (let i = 0; i < this.p.layers.curtain.length; i++) {
            if (
                this.p.layers.curtain[i].curtain &&
                this.p.layers.curtain[i].curtain.children
            )
                for (
                    let j = 0;
                    j < this.p.layers.curtain[i].curtain.children.length;
                    j++
                )
                    intersectArr.push(
                        this.p.layers.curtain[i].curtain.children[j]
                    )
        }
        const intersects = this.p._.raycaster.intersectObjects(intersectArr)

        if (intersects.length > 0) {
            const type = intersects[0].object.type
            let obj = null
            switch (type) {
                case 'Sprite':
                    obj = intersects[0].object
                    break
                case 'Line2':
                    obj = intersects[0].object
                    break
                case 'Mesh':
                    obj = this.p._.tiledWorld.findTileDrawnBasedOnUUID(
                        intersects[0].object.uuid
                    )
                    if (obj == null) {
                        obj = intersects[0].object
                    }
                    break
                default:
                    return
                    break
            }
            const savedIntersectionPoint = intersects[0].point

            //Since we lowered the planet, we need to raise the intersection pt again for calculations
            intersects[0].point.y += this.p.planetCenter.y
            //Since the planet was rotated during pans, rotate the intersection back
            intersects[0].point = this.p.projection.rotatePoint3D(
                intersects[0].point,
                {
                    x: -this.p.planet.rotation.x,
                    y: 0,
                    z: 0,
                }
            )
            intersects[0].point = this.p.projection.rotatePoint3D(
                intersects[0].point,
                {
                    x: 0,
                    y: -this.p.planet.rotation.y,
                    z: 0,
                }
            )
            intersects[0].point = this.p.projection.rotatePoint3D(
                intersects[0].point,
                {
                    x: 0,
                    y: 0,
                    z: -this.p.planet.rotation.z,
                }
            )

            // LngLat of the cursor
            const intersectedLL = this.p.projection.vector3ToLatLng(
                intersects[0].point
            )
            //Find the elevation
            //Just distance to intersection from center of planet then rescaled then - radius
            intersectedLL.height =
                (savedIntersectionPoint.length() - this.p.planet.position.y) /
                this.p.projection.radiusScale

            this._updateMouseCoords(
                intersectedLL.lng,
                intersectedLL.lat,
                intersectedLL.height
            )

            clearTimeout(this._.highlightTimeout)
            this._.highlightTimeout = setTimeout(() => {
                this._highlightFeature(
                    intersectedLL.lng,
                    intersectedLL.lat,
                    type,
                    obj,
                    intersects[0],
                    savedIntersectionPoint
                )
            }, 10)

            // Call layers onMouseMoves
            this.p.layers._onMouseMove(
                intersectedLL,
                e,
                obj,
                intersects[0],
                savedIntersectionPoint
            )

            // Call control onMouseMoves
            this.p.controls._onMouseMove(
                intersectedLL.lng,
                intersectedLL.lat,
                intersectedLL.height,
                e
            )
        } else {
            this._updateMouseCoords(null, null, null)
            this._unhighlightHoveredFeature()

            this.p.controls._onMouseMove(null, null, null, e)
        }
    }

    private _updateMouseCoords(lng, lat, elev) {
        this.p.mouse.lng = lng
        this.p.mouse.lat = lat
        this.p.mouse.elev = elev
    }

    private updateHoverInfoPosition() {
        if (this.hoverInfo) {
            this.hoverInfo.style.left = `${this._.containerXY.x + 14}px`
            this.hoverInfo.style.top = `${this._.containerXY.y + 14}px`
        }
    }

    // Gets features from tile.features
    private _highlightFeature(
        lng,
        lat,
        type,
        obj,
        intersectionRaw,
        intersectionPoint
    ) {
        //const radiansPerPixel = Utils.getRadiansPerPixel(this.p.zoom)
        const cursor = { type: 'Point', coordinates: [lng, lat] }

        let highlighted = false

        switch (type) {
            case 'Sprite':
            case 'Line2':
                highlighted = true

                // Skip if still hovering over same feature
                if (obj.feature._highlighted == true) return

                this._unhighlightHoveredFeature()

                obj.feature._highlighted = true
                obj.restyle()
                this.setHoveredFeature({
                    layerName: obj.layerName,
                    type: type,
                    obj: obj,
                    feature: obj.feature,
                    lnglat: {
                        lng: lng,
                        lat: lat,
                    },
                })
                break
            case 'Mesh':
                if (obj.layerType === 'curtain') {
                } else if (obj.layerType === 'model') {
                } else if (obj.contains) {
                    // A tile
                    for (let layerName of Object.keys(obj.contains).reverse()) {
                        for (let f of obj.contains[layerName].reverse()) {
                            let feature = Object.assign({}, f)
                            if (
                                feature.geometry.type.toLowerCase() === 'point'
                            ) {
                                feature = circle(
                                    feature.geometry.coordinates,
                                    feature._radiusInMeters || 1,
                                    {
                                        steps: 12,
                                        units: 'meters',
                                        properties: feature.properties,
                                    }
                                )
                            }
                            if (booleanIntersects(feature, cursor)) {
                                highlighted = true
                                // Skip if still hovering over same feature
                                if (f._highlighted == true) return

                                this._unhighlightHoveredFeature()

                                f._highlighted = true
                                this.setHoveredFeature({
                                    layerName: layerName,
                                    type: type,
                                    obj: obj,
                                    feature: f,
                                    lnglat: {
                                        lng: lng,
                                        lat: lat,
                                    },
                                })
                                this.p._.tiledWorld.updateClampedRasterForTile(
                                    obj,
                                    layerName
                                )
                                break
                            }
                        }
                        if (highlighted) return
                    }
                }
                break
            default:
                break
        }

        // Looks like we found nothing to highlight then
        if (!highlighted) {
            this._unhighlightHoveredFeature()
        }
    }

    /**
     * Removes the cursor feature highlight
     * @return null
     */
    private _unhighlightHoveredFeature(): void {
        if (this.hoveredFeature) {
            this.hoveredFeature.feature._highlighted = false

            switch (this.hoveredFeature.type) {
                case 'Sprite':
                case 'Line2':
                    this.hoveredFeature.obj.restyle()
                    break
                case 'Mesh':
                    this.p._.tiledWorld.updateClampedRasterForTile(
                        this.hoveredFeature.obj,
                        this.hoveredFeature.layerName
                    )
                    break
                default:
                    break
            }
            this.clearHoveredFeature()
        }
    }

    private setHoveredFeature(hoveredFeature: any) {
        this.hoveredFeature = hoveredFeature

        // Make the hover info
        if (this.hoverInfo) {
            this.p._.container.removeChild(this.hoverInfo)
            this.hoverInfo = null
        }

        this.hoverInfo = document.createElement('div')
        this.hoverInfo.id = '_lithosphere_hover_info'

        const layer = this.p.layers.getLayerByName(
            this.hoveredFeature.layerName
        )
        if (layer && layer.useKeyAsHoverName) {
            const text = Utils.getIn(
                this.hoveredFeature.feature.properties,
                layer.useKeyAsHoverName.split('.')
            )
            if (text != null) {
                this.hoverInfo.innerHTML = Utils.capitalizeFirstLetter(
                    `${layer.useKeyAsHoverName}: ${text}`
                )
                this.hoverInfo.style.position = 'absolute'
                this.hoverInfo.style.background = '#1d1f20'
                this.hoverInfo.style.color = 'white'
                this.hoverInfo.style.fontSize = '16px'
                this.hoverInfo.style.fontFamily = 'sans-serif'
                this.hoverInfo.style.fontWeight = 'bold'
                this.hoverInfo.style.padding = '4px 8px'
                this.updateHoverInfoPosition()
            }
        }

        this.p._.container.appendChild(this.hoverInfo)
        this.p._.container.style.cursor = 'pointer'
    }

    private clearHoveredFeature() {
        this.hoveredFeature = null
        if (this.hoverInfo) {
            this.p._.container.removeChild(this.hoverInfo)
            this.hoverInfo = null
            this.p._.container.style.cursor = 'default'
        }
    }

    private setActiveFeature(activeFeature: any) {
        this.clearActiveFeature()

        this.activeFeature = activeFeature
        this.activeFeature.feature._active = true

        switch (this.activeFeature.type) {
            case 'Sprite':
            case 'Line2':
                this.activeFeature.obj.restyle()
                break
            case 'Mesh':
                this.p._.tiledWorld.updateClampedRasterForTile(
                    this.activeFeature.obj,
                    this.activeFeature.layerName
                )
                break
            default:
                break
        }
    }
    private clearActiveFeature() {
        if (this.activeFeature) {
            this.activeFeature.feature._active = false

            switch (this.activeFeature.type) {
                case 'Sprite':
                case 'Line2':
                    this.activeFeature.obj.restyle()
                    break
                case 'Mesh':
                    this.p._.tiledWorld.updateClampedRasterForTile(
                        this.activeFeature.obj,
                        this.activeFeature.layerName
                    )
                    break
                default:
                    break
            }
        }
        this.activeFeature = null
    }

    _setMissingElevation(mesh) {
        // @ts-ignore
        if (mesh.noElevation != null) {
            const height =
                this.p.getElevationAtLngLat(
                    mesh.noElevation.lng,
                    mesh.noElevation.lat
                ) || false

            if (height) {
                const v = this.p.projection.lonLatToVector3(
                    mesh.noElevation.lng,
                    mesh.noElevation.lat,
                    (height || 0) +
                        (mesh.noElevation.elevOffset || 0) *
                            this.p.options.exaggeration
                )

                mesh.position.set(v.x, v.y, v.z)
                // @ts-ignore
                delete mesh.noElevation
            }
        }

        if (
            Utils.isInZoomRange(
                mesh.style?.minZoom,
                mesh.style?.maxZoom,
                this.p.zoom
            )
        )
            mesh.visible = true
        else mesh.visible = false
    }

    // Changes certain vector sizes based on distance to camera
    _attenuate() {
        const zoomDist = this.p._.cameras.camera.position.distanceTo(
            this.p._.cameras.controls.target
        )

        const attenuationFactor = zoomDist / 256

        if (this.p.layers.vector) {
            this.p.layers.vector.forEach((vectorLayer) => {
                if (vectorLayer.meshes && vectorLayer.meshes.children) {
                    vectorLayer.meshes.children.forEach((mesh) => {
                        if (mesh instanceof Sprite) {
                            mesh.scale.set(
                                // @ts-ignore
                                attenuationFactor *
                                    // @ts-ignore
                                    (mesh.style.width || mesh.style.radius),
                                // @ts-ignore
                                attenuationFactor *
                                    // @ts-ignore
                                    (mesh.style.height || mesh.style.radius),
                                // @ts-ignore
                                attenuationFactor * mesh.style.radius
                            )

                            this._setMissingElevation(mesh)
                        }
                    })
                }
            })
        }

        if (this.p.frontGroup.children) {
            this.p.frontGroup.children.forEach((child) => {
                if (child.children && child.children.length > 0) {
                    child.children.forEach((mesh) => {
                        if (mesh instanceof Sprite) {
                            mesh.scale.set(
                                // @ts-ignore
                                attenuationFactor *
                                    // @ts-ignore
                                    (mesh.style.width || mesh.style.radius),
                                // @ts-ignore
                                attenuationFactor *
                                    // @ts-ignore
                                    (mesh.style.height || mesh.style.radius),
                                // @ts-ignore
                                attenuationFactor * mesh.style.radius
                            )

                            this._setMissingElevation(mesh)
                        }
                    })
                } else {
                    if (child instanceof Sprite) {
                        child.scale.set(
                            // @ts-ignore
                            attenuationFactor *
                                // @ts-ignore
                                (mesh.style.width || mesh.style.radius),
                            // @ts-ignore
                            attenuationFactor *
                                // @ts-ignore
                                (mesh.style.height || mesh.style.radius),
                            // @ts-ignore
                            attenuationFactor * mesh.style.radius
                        )

                        this._setMissingElevation(child)
                    }
                }
            })
        }
    }
}
