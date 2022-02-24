import {
    Object3D,
    TextureLoader,
    Mesh,
    BufferGeometry,
    BufferAttribute,
    MeshBasicMaterial,
    MeshPhongMaterial,
    Vector2,
    Vector3,
    CanvasTexture,
    DoubleSide,
    NearestFilter,
} from 'three'
import Utils from '../utils'

const loader = new TextureLoader()

export default class CurtainLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj: any, callback?: Function): void => {
        if (!this.p.p._.wasInitialized) return

        let alreadyExists = false
        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            (layerObj.hasOwnProperty('geojson') ||
                layerObj.hasOwnProperty('lineGeometry'))
        ) {
            for (let i = 0; i < this.p.curtain.length; i++) {
                if (this.p.curtain[i].hasOwnProperty('name')) {
                    if (this.p.curtain[i].name == layerObj.name) {
                        this.p.curtain[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                this.generateCurtain(layerObj, (curtain) => {
                    if (curtain) {
                        layerObj.curtain = curtain
                        this.p.p.planet.add(layerObj.curtain)
                        this.p.curtain.push(layerObj)
                        this.p.curtain.sort((a, b) => b.order - a.order)
                        this.setOpacity(layerObj.name, layerObj.opacity)
                    }
                    if (typeof callback === 'function') callback()
                })
            } else if (typeof callback === 'function') callback()
        } else {
            console.warn(
                `Attempted to add an invalid model layer: ${layerObj.name}. Required props: name, on, geojson | lineGeometry`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.curtain.length; i++) {
            const layer = this.p.curtain[i]
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.curtain.visible = layer.on

                return true
            }
        }
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        if (opacity == null) opacity = 1

        for (let i = 0; i < this.p.curtain.length; i++) {
            const layer = this.p.curtain[i]
            if (name === layer.name) {
                layer.opacity = Math.max(Math.min(opacity, 1), 0)
                Utils.setAllMaterialOpacity(layer.curtain, layer.opacity)
                return true
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false
        for (let i = 0; i < this.p.curtain.length; i++) {
            if (this.p.curtain[i].name === name) {
                this.p.p.planet.remove(this.p.curtain[i].curtain)
                this.p.curtain.splice(i, 1)
                return true
            }
        }
        return false
    }

    setLayerSpecificOptions = (name: string, options: any): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.curtain.length; i++) {
            if (this.p.curtain[i].name === name) {
                this.p.curtain[i].options = {
                    ...(this.p.curtain[i].options || {}),
                    ...(options || {}),
                }
                // Refresh
                this.p.p.planet.remove(this.p.curtain[i].curtain)
                this.generateCurtain(this.p.curtain[i], (curtain) => {
                    this.p.curtain[i].curtain = curtain
                    this.p.p.planet.add(this.p.curtain[i].curtain)
                })

                return true
            }
        }
        return false
    }

    private generateCurtain = (layerObj: any, callback: Function) => {
        const group = new Object3D()

        const geometries = []
        if (layerObj.geojson) {
            layerObj.geojson.features.forEach((f) => {
                if (
                    ['LineString', 'MultiLineString', 'Polygon'].includes(
                        f.geometry.type
                    )
                )
                    geometries.push(f.geometry)
            })
        } else geometries.push(layerObj.lineGeometry)

        // If we're reusing a material
        if (layerObj._material != null) {
            geometries.forEach((g) => {
                group.add(this.getCurtainMesh(layerObj, g))
            })
            callback(group)
        }
        //Make radargram mesh
        else if (layerObj.imagePath) {
            loader.load(layerObj.imagePath, (texture) => {
                texture.magFilter = NearestFilter
                texture.minFilter = NearestFilter
                const material = new MeshBasicMaterial({
                    map: texture,
                    transparent: true,
                    side: DoubleSide,
                })
                layerObj._material = material
                geometries.forEach((g) => {
                    group.add(this.getCurtainMesh(layerObj, g))
                })
                callback(group)
            })
        } else if (Array.isArray(layerObj.imageColor)) {
            const size = 128

            // create canvas
            const canvas = document.createElement('canvas')
            canvas.width = size
            canvas.height = size

            // get context
            const context = canvas.getContext('2d')

            // draw gradient
            context.rect(0, 0, size, size)
            const gradient = context.createLinearGradient(0, 0, 0, size)
            layerObj.imageColor.forEach((color, idx) => {
                gradient.addColorStop(
                    idx / (layerObj.imageColor.length - 1),
                    color || '#FFFFFF'
                )
            })
            context.fillStyle = gradient
            context.fill()

            const material = new MeshBasicMaterial({
                map: new CanvasTexture(canvas),
                transparent: true,
                side: DoubleSide,
            })
            layerObj._material = material
            geometries.forEach((g) => {
                group.add(this.getCurtainMesh(layerObj, g))
            })
            callback(group)
        } else {
            const material = new MeshPhongMaterial({
                color: layerObj.imageColor || '#FFFFFF',
                transparent: true,
                side: DoubleSide,
            })
            layerObj._material = material
            geometries.forEach((g) => {
                group.add(this.getCurtainMesh(layerObj, g))
            })
            callback(group)
        }
    }

    private getCurtainMesh = (layerObj: any, featureGeometry: any) => {
        // Standardize geometry
        let g
        switch (featureGeometry.type) {
            case 'LineString':
                g = featureGeometry.coordinates
                break
            case 'MultiLineString':
                g = featureGeometry.coordinates[0]
                break
            case 'Polygon':
                g = featureGeometry.coordinates[0]
                break
            default:
                console.warn(
                    `Invalid Curtain layer "lineGeometry" type: ${featureGeometry.type}. Must be one of: ['LineString', 'MultiLineString']`
                )
                return
                break
        }

        const geometry = new BufferGeometry()

        const vertices = this.getCurtainVertices(g, layerObj)
        const positionNumComponents = 3
        const uvNumComponents = 2
        geometry.setAttribute(
            'position',
            new BufferAttribute(
                new Float32Array(vertices.positions),
                positionNumComponents
            )
        )
        geometry.setAttribute(
            'uv',
            new BufferAttribute(new Float32Array(vertices.uvs), uvNumComponents)
        )

        const mesh = new Mesh(geometry, layerObj._material)
        mesh.geometry.computeVertexNormals()
        mesh.position.set(
            vertices.firstPos.x,
            vertices.firstPos.y,
            vertices.firstPos.z
        )

        if (layerObj.on == false) {
            mesh.visible = false
        }

        // @ts-ignore
        mesh.layerType = 'curtain'
        return mesh
    }
    private getCurtainVertices = (g: any, layerObj: any) => {
        // Make sure relevant options are set or defaulted
        const options = layerObj.options || {}
        options.verticalExaggeration =
            options.verticalExaggeration != null
                ? options.verticalExaggeration
                : 1
        options.verticalOffset =
            options.verticalOffset != null ? options.verticalOffset : 0

        // First get the length of each line segment (if any), as well as the total length
        const lengthArray = [0]
        let totalLength = 0
        for (let i = 0; i < g.length; i++) {
            let i0 = 0
            let i1 = 1
            if (layerObj.swapLL) {
                i0 = 1
                i1 = 0
            }
            if (i > 0) {
                const len = this.p.p.projection.lngLatDistBetween(
                    g[i - 1][i0],
                    g[i - 1][i1],
                    g[i][i0],
                    g[i][i1]
                )
                lengthArray.push(len)
                totalLength += len
            }
        }

        const depth = layerObj.depth || 100 //m

        const vertices = {
            positions: [],
            uvs: [],
            firstPos: null,
        }
        let currentLength = 0
        /* Built in triangles like so:
            ---------
            |/|/|/|/|
            ---------
            2 triangle per coord (|)
            (except first (hence i = 1)) 
         */
        for (let i = 1; i < g.length; i++) {
            // These just enable swapping lat lng order representation
            let i0 = 0
            let i1 = 1
            if (layerObj.swapLL) {
                i0 = 1
                i1 = 0
            }

            // Vertical Surface xyz
            const vSurface = this.p.p.projection.lonLatToVector3(
                g[i][i0],
                g[i][i1],
                g[i][2] + options.verticalOffset
            )
            // Vertical Depth xyz
            const vDepth = this.p.p.projection.lonLatToVector3(
                g[i][i0],
                g[i][i1],
                g[i][2] -
                    depth * options.verticalExaggeration +
                    options.verticalOffset
            )
            // Previous Vertical Surface xyz
            const vSurfacePrev = this.p.p.projection.lonLatToVector3(
                g[i - 1][i0],
                g[i - 1][i1],
                g[i - 1][2] + options.verticalOffset
            )
            // Previous Vertical Depth xyz
            const vDepthPrev = this.p.p.projection.lonLatToVector3(
                g[i - 1][i0],
                g[i - 1][i1],
                g[i - 1][2] -
                    depth * options.verticalExaggeration +
                    options.verticalOffset
            )

            // firstPos hack to recenter coordinates on parent's (not planet's) center
            // to reduce floating point rounding jitter
            if (i == 1) {
                vertices.firstPos = new Vector3(
                    vSurfacePrev.x,
                    vSurfacePrev.y,
                    vSurfacePrev.z
                )
            }

            // Now build the positions and uvs
            let uv
            // L-shaped triangle (lower-left)
            // Prev Top
            vertices.positions.push(
                ...[
                    vSurfacePrev.x - vertices.firstPos.x,
                    vSurfacePrev.y - vertices.firstPos.y,
                    vSurfacePrev.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2(currentLength / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])
            // Prev Bottom
            vertices.positions.push(
                ...[
                    vDepthPrev.x - vertices.firstPos.x,
                    vDepthPrev.y - vertices.firstPos.y,
                    vDepthPrev.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2(currentLength / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])

            // Current Top
            vertices.positions.push(
                ...[
                    vSurface.x - vertices.firstPos.x,
                    vSurface.y - vertices.firstPos.y,
                    vSurface.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])

            // 7-shaped triangle (upper-right)
            // Current Bottom
            vertices.positions.push(
                ...[
                    vDepth.x - vertices.firstPos.x,
                    vDepth.y - vertices.firstPos.y,
                    vDepth.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])
            // Current Top
            vertices.positions.push(
                ...[
                    vSurface.x - vertices.firstPos.x,
                    vSurface.y - vertices.firstPos.y,
                    vSurface.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])
            // Prev Bottom
            vertices.positions.push(
                ...[
                    vDepthPrev.x - vertices.firstPos.x,
                    vDepthPrev.y - vertices.firstPos.y,
                    vDepthPrev.z - vertices.firstPos.z,
                ]
            )
            uv = new Vector2(currentLength / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])

            // Lastly update current length for the next run
            currentLength += lengthArray[i]
        }

        return vertices
    }
}
