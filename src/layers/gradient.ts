import {
    Object3D,
    Vector3,
    SphereGeometry,
    MeshBasicMaterial,
    Mesh,
} from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

import Utils from '../utils'
import {
    buildColorStops,
    interpolateMultipleColors,
    parseRgb,
    hexToRgb,
} from '../utils/gradientUtils'
import {
    coordinateDepthTraversal,
    getCoordProperties,
} from '../utils/coordProperties'

interface GradientVertex {
    lng: number
    lat: number
    elev: number
    value: number
    props: Record<string, any>
}

export default class GradientLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj: any, callback?: Function): void => {
        if (!this.p.p._.wasInitialized) return

        let alreadyExists = false

        const finallyAdd = () => {
            for (let i = 0; i < this.p.gradient.length; i++) {
                if (this.p.gradient[i].hasOwnProperty('name')) {
                    if (this.p.gradient[i].name == layerObj.name) {
                        this.p.gradient[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                // Create a placeholder group immediately so the layer is
                // registered synchronously, then build meshes async.
                const gradientGroup = new Object3D()
                this.p.p.planet.add(gradientGroup)
                layerObj.meshes = gradientGroup

                if (layerObj.on == false) {
                    gradientGroup.visible = false
                }

                this.p.gradient.push(layerObj)
                this.p.gradient.sort(
                    (a: any, b: any) => b.order - a.order
                )

                // Build geometry asynchronously with frame-budgeted yielding
                this.generateGradientLinesAsync(layerObj, gradientGroup)
            }
            this.p.p._.events._attenuate()
            if (typeof callback === 'function') callback()
        }

        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            layerObj.hasOwnProperty('opacity') &&
            layerObj.hasOwnProperty('gradientSettings')
        ) {
            if (
                layerObj.hasOwnProperty('geojsonPath') &&
                !layerObj.hasOwnProperty('geojson')
            ) {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', layerObj.geojsonPath, true)
                xhr.responseType = 'json'
                xhr.withCredentials =
                    layerObj.withCredentials === true || false
                xhr.onload = () => {
                    if (xhr.status !== 404 && xhr.response) {
                        layerObj.geojson = xhr.response
                        finallyAdd()
                    } else {
                        console.warn(
                            `Failed to fetch geojson data for gradient layer: ${layerObj.name}`
                        )
                    }
                }
                xhr.send()
            } else {
                finallyAdd()
            }
        } else {
            console.warn(
                `Attempted to add an invalid gradient layer: ${layerObj.name}`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.gradient.length; i++) {
            const layer = this.p.gradient[i]
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.meshes.visible = layer.on
                this.p.p._.events._attenuate()
                return true
            }
        }
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.gradient.length; i++) {
            const layer = this.p.gradient[i]
            if (name === layer.name) {
                layer.opacity = Math.max(Math.min(opacity, 1), 0)
                layer.meshes.children.forEach((mesh: any) => {
                    mesh.material.opacity = layer.opacity
                    mesh.material.transparent = true
                })
                return true
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.gradient.length; i++) {
            if (this.p.gradient[i].name === name) {
                this.p.p.planet.remove(this.p.gradient[i].meshes)
                this.p.gradient.splice(i, 1)
                return true
            }
        }
        return false
    }

    /**
     * Async builder for gradient polyline geometry.
     * Uses a per-frame time budget (FRAME_BUDGET_MS) so the UI is never
     * blocked regardless of dataset size. Checks performance.now() every
     * CHECK_INTERVAL iterations and yields via requestAnimationFrame
     * whenever the budget is exceeded.
     */
    private generateGradientLinesAsync = async (
        layerObj: any,
        gradientGroup: Object3D
    ): Promise<void> => {
        const FRAME_BUDGET_MS = 10
        const CHECK_INTERVAL = 50
        let frameDeadline = performance.now() + FRAME_BUDGET_MS

        const yieldIfNeeded = (): Promise<void> => {
            if (performance.now() < frameDeadline) return Promise.resolve()
            return new Promise((resolve) => {
                requestAnimationFrame(() => {
                    frameDeadline = performance.now() + FRAME_BUDGET_MS
                    resolve()
                })
            })
        }

        // Abort check — if the layer was removed during async build
        const isStale = (): boolean => {
            return !this.p.gradient.some(
                (l: any) =>
                    l.name === layerObj.name &&
                    l.meshes === gradientGroup
            )
        }

        if (layerObj.geojson == null) {
            console.warn(
                `Gradient layer: ${layerObj.name} has no geojson.`
            )
            return
        }
        const features = layerObj.geojson.features
        if (features == null) {
            console.warn(
                `Gradient layer: ${layerObj.name} has invalid geojson.`
            )
            return
        }

        const gradientSettings = layerObj.gradientSettings
        const colorWithProp = gradientSettings.colorWithProp
        const colorStops = buildColorStops(gradientSettings.colorRamp)
        const weight = gradientSettings.weight || 4
        const showDebugPoints = gradientSettings.debugPoints === true

        // Phase 1: Collect all vertices with property values
        const allPaths: GradientVertex[][] = []
        let min = Infinity
        let max = -Infinity

        let i0 = 0
        let i1 = 1
        if (layerObj.swapLL) {
            i0 = 1
            i1 = 0
        }

        if (gradientSettings.connectAllPoints) {
            const points: GradientVertex[] = []
            for (let fi = 0; fi < features.length; fi++) {
                if (fi % CHECK_INTERVAL === 0) {
                    await yieldIfNeeded()
                    if (isStale()) return
                }
                const feature = features[fi]
                if (
                    feature.geometry.type.toLowerCase() === 'point'
                ) {
                    const coords = feature.geometry.coordinates
                    const value = Utils.getIn(
                        feature.properties,
                        colorWithProp,
                        0
                    )
                    if (min > value) min = value
                    if (max < value) max = value
                    points.push({
                        lng: coords[i0],
                        lat: coords[i1],
                        elev: coords[2] || 0,
                        value,
                        props: feature.properties,
                    })
                }
            }
            if (points.length >= 2) allPaths.push(points)
        } else {
            for (let fi = 0; fi < features.length; fi++) {
                if (fi % CHECK_INTERVAL === 0) {
                    await yieldIfNeeded()
                    if (isStale()) return
                }
                const feature = features[fi]
                const paths: GradientVertex[][] = []
                let path: GradientVertex[] = []
                let prevParentIndex: string | null = null

                coordinateDepthTraversal(
                    feature.geometry.coordinates,
                    (array: any[], _path: string) => {
                        const splitPath = _path.split('.')
                        let parentIndex: string | null = null
                        if (splitPath.length >= 2) {
                            parentIndex =
                                splitPath[splitPath.length - 2]
                            if (
                                prevParentIndex != null &&
                                parentIndex != prevParentIndex
                            ) {
                                paths.push(path)
                                path = []
                            }
                        }
                        const props = getCoordProperties(
                            layerObj.geojson,
                            feature,
                            array
                        )
                        const value = Utils.getIn(
                            props,
                            colorWithProp,
                            0
                        )
                        if (min > value) min = value
                        if (max < value) max = value
                        path.push({
                            lng: array[i0],
                            lat: array[i1],
                            elev: array[2] || 0,
                            value,
                            props,
                        })
                        prevParentIndex = parentIndex
                    }
                )
                if (path.length > 0) paths.push(path)
                paths.forEach((p) => {
                    if (p.length >= 2) allPaths.push(p)
                })
            }
        }

        if (min === 0 && max === 0) max = 1
        if (isStale()) return

        // Phase 2: Build color lookup
        const colorCache = new Map<
            number,
            { r: number; g: number; b: number }
        >()
        const colorForValue = (
            v: number
        ): { r: number; g: number; b: number } => {
            if (colorCache.has(v)) return colorCache.get(v)!
            const c = interpolateMultipleColors(colorStops, v, min, max)
            let rgb = { r: 255, g: 255, b: 255 }
            if (c) {
                const parsed = parseRgb(c) || hexToRgb(c)
                if (parsed) rgb = parsed
            }
            colorCache.set(v, rgb)
            return rgb
        }

        // Phase 3: Build per-segment Line2 meshes using two-sub-segment
        // per vertex coloring strategy (matches MMGIS PR #31 approach).
        //
        // Each original segment P[i] → P[i+1] is split at its midpoint M
        // into two sub-segments:
        //   Sub-segment A: P[i] → M   — colored with P[i]'s value
        //   Sub-segment B: M → P[i+1] — colored with P[i+1]'s value
        //
        // This ensures each data point P[i] sits at the CENTER of its
        // colored region (which extends from mid(P[i-1],P[i]) to
        // mid(P[i],P[i+1])), with midpoints as color-transition boundaries.

        let iterCount = 0

        for (const pts of allPaths) {
            // Convert all vertices to 3D positions
            const worldPositions: Vector3[] = []
            for (let i = 0; i < pts.length; i++) {
                const p = pts[i]
                const v = this.p.p.projection.lonLatToVector3(
                    p.lng,
                    p.lat,
                    p.elev * this.p.p.options.exaggeration
                )
                worldPositions.push(new Vector3(v.x, v.y, v.z))
            }

            // Use firstPos centering to avoid floating-point jitter
            const firstPos = worldPositions[0].clone()

            // Add debug points at each data vertex if enabled
            if (showDebugPoints) {
                // Compute appropriate sphere radius from segment spacing
                let debugRadius = 3.0
                if (worldPositions.length >= 2) {
                    const d = worldPositions[0].distanceTo(
                        worldPositions[1]
                    )
                    // Radius = 30% of segment length, clamped
                    debugRadius = Math.max(0.5, Math.min(d * 0.3, 10))
                }
                for (let i = 0; i < pts.length; i++) {
                    const wp = worldPositions[i]
                    const rgb = colorForValue(pts[i].value)
                    const pointColor =
                        (rgb.r << 16) | (rgb.g << 8) | rgb.b
                    const sphereGeo = new SphereGeometry(
                        debugRadius,
                        12,
                        8
                    )
                    const sphereMat = new MeshBasicMaterial({
                        color: pointColor,
                        depthTest: false,
                    })
                    const sphere = new Mesh(sphereGeo, sphereMat)
                    sphere.position.set(wp.x, wp.y, wp.z)
                    sphere.renderOrder = 999
                    sphere.frustumCulled = false
                    gradientGroup.add(sphere)
                }
            }

            for (let i = 0; i < pts.length - 1; i++) {
                iterCount++
                if (iterCount % CHECK_INTERVAL === 0) {
                    await yieldIfNeeded()
                    if (isStale()) return
                }

                const p0 = worldPositions[i]
                const p1 = worldPositions[i + 1]

                // Compute midpoint between P[i] and P[i+1]
                const mid = new Vector3(
                    (p0.x + p1.x) / 2,
                    (p0.y + p1.y) / 2,
                    (p0.z + p1.z) / 2
                )

                const rgb0 = colorForValue(pts[i].value)
                const rgb1 = colorForValue(pts[i + 1].value)
                const color0 =
                    (rgb0.r << 16) | (rgb0.g << 8) | rgb0.b
                const color1 =
                    (rgb1.r << 16) | (rgb1.g << 8) | rgb1.b

                // Sub-segment A: P[i] → midpoint, colored with P[i]'s value
                const positionsA = [
                    p0.x - firstPos.x,
                    p0.y - firstPos.y,
                    p0.z - firstPos.z,
                    mid.x - firstPos.x,
                    mid.y - firstPos.y,
                    mid.z - firstPos.z,
                ]

                const geometryA = new LineGeometry()
                geometryA.setPositions(positionsA)

                const materialA = new LineMaterial({
                    color: color0,
                    linewidth: 0.0005 * weight,
                })

                const meshA = new Line2(geometryA, materialA)
                meshA.computeLineDistances()
                meshA.position.set(
                    firstPos.x,
                    firstPos.y,
                    firstPos.z
                )
                meshA.scale.set(1, 1, 1)

                // @ts-ignore
                meshA.layerName = layerObj.name
                // @ts-ignore
                meshA.strokeColor = color0
                // @ts-ignore
                meshA.feature = {
                    type: 'Feature',
                    properties: Object.assign({}, pts[i].props, {
                        _gradientSegmentIndex: i,
                        _gradientSubSegment: 'A',
                        _gradientValue: pts[i].value,
                    }),
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [pts[i].lng, pts[i].lat, pts[i].elev],
                            [
                                (pts[i].lng + pts[i + 1].lng) / 2,
                                (pts[i].lat + pts[i + 1].lat) / 2,
                                (pts[i].elev + pts[i + 1].elev) / 2,
                            ],
                        ],
                    },
                    _highlighted: false,
                    _active: false,
                }

                const defaultColorA = color0
                // @ts-ignore
                meshA.restyle = () => {
                    // @ts-ignore
                    const isHighlighted = meshA.feature._highlighted
                    // @ts-ignore
                    const isActive = meshA.feature._active
                    let c: any = defaultColorA
                    if (isActive) {
                        c = this.p.p.options.activeColor || 'red'
                    } else if (isHighlighted) {
                        c = this.p.p.options.highlightColor || 'yellow'
                    }
                    meshA.material = new LineMaterial({
                        color: c,
                        linewidth: 0.0005 * weight,
                    })
                    // @ts-ignore
                    meshA.strokeColor = c
                }

                gradientGroup.add(meshA)

                // Sub-segment B: midpoint → P[i+1], colored with P[i+1]'s value
                const positionsB = [
                    mid.x - firstPos.x,
                    mid.y - firstPos.y,
                    mid.z - firstPos.z,
                    p1.x - firstPos.x,
                    p1.y - firstPos.y,
                    p1.z - firstPos.z,
                ]

                const geometryB = new LineGeometry()
                geometryB.setPositions(positionsB)

                const materialB = new LineMaterial({
                    color: color1,
                    linewidth: 0.0005 * weight,
                })

                const meshB = new Line2(geometryB, materialB)
                meshB.computeLineDistances()
                meshB.position.set(
                    firstPos.x,
                    firstPos.y,
                    firstPos.z
                )
                meshB.scale.set(1, 1, 1)

                // @ts-ignore
                meshB.layerName = layerObj.name
                // @ts-ignore
                meshB.strokeColor = color1
                // @ts-ignore
                meshB.feature = {
                    type: 'Feature',
                    properties: Object.assign({}, pts[i + 1].props, {
                        _gradientSegmentIndex: i,
                        _gradientSubSegment: 'B',
                        _gradientValue: pts[i + 1].value,
                    }),
                    geometry: {
                        type: 'LineString',
                        coordinates: [
                            [
                                (pts[i].lng + pts[i + 1].lng) / 2,
                                (pts[i].lat + pts[i + 1].lat) / 2,
                                (pts[i].elev + pts[i + 1].elev) / 2,
                            ],
                            [
                                pts[i + 1].lng,
                                pts[i + 1].lat,
                                pts[i + 1].elev,
                            ],
                        ],
                    },
                    _highlighted: false,
                    _active: false,
                }

                const defaultColorB = color1
                // @ts-ignore
                meshB.restyle = () => {
                    // @ts-ignore
                    const isHighlighted = meshB.feature._highlighted
                    // @ts-ignore
                    const isActive = meshB.feature._active
                    let c: any = defaultColorB
                    if (isActive) {
                        c = this.p.p.options.activeColor || 'red'
                    } else if (isHighlighted) {
                        c = this.p.p.options.highlightColor || 'yellow'
                    }
                    meshB.material = new LineMaterial({
                        color: c,
                        linewidth: 0.0005 * weight,
                    })
                    // @ts-ignore
                    meshB.strokeColor = c
                }

                gradientGroup.add(meshB)
            }
        }

        // Trigger a render update now that geometry is complete
        this.p.p._.events._attenuate()
    }
}
