import {
    TextureLoader,
    Mesh,
    BufferGeometry,
    BufferAttribute,
    MeshBasicMaterial,
    Vector2,
    Object3D,
    DoubleSide,
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
            layerObj.hasOwnProperty('imagePath') &&
            layerObj.hasOwnProperty('lineGeometry')
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
                        this.p.p.planet.add(curtain)
                        layerObj.curtain = curtain
                        this.p.curtain.push(layerObj)
                        this.p.curtain.sort((a, b) => b.order - a.order)
                        this.setOpacity(layerObj.name, layerObj.opacity)
                    }
                    if (typeof callback === 'function') callback()
                })
            } else if (typeof callback === 'function') callback()
        } else {
            console.warn(
                `Attempted to add an invalid model layer: ${layerObj.name}. Required props: name, on, imagePath, lineGeometry`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        this.p.curtain.forEach((layer) => {
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.curtain.visible = layer.on

                return true
            }
        })
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

    private generateCurtain = (layerObj: any, callback: Function) => {
        // Standardize geometry
        let g
        if (layerObj.lineGeometry.type === 'LineString') {
            g = layerObj.lineGeometry.coordinates
        } else if (layerObj.lineGeometry.type === 'MultiLineString') {
            g = layerObj.lineGeometry.coordinates[0]
        } else {
            console.warn(
                `Invalid Curtain layer "lineGeometry" type: ${layerObj.lineGeometry.type}. Must be one of: ['LineString', 'MultiLineString']`
            )
            callback()
            return
        }

        //Make radargram mesh
        loader.load(layerObj.imagePath, (texture) => {
            const geometry = new BufferGeometry()
            const material = new MeshBasicMaterial({
                map: texture,
                side: DoubleSide,
            })

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
                new BufferAttribute(
                    new Float32Array(vertices.uvs),
                    uvNumComponents
                )
            )

            const mesh = new Mesh(geometry, material)

            mesh.geometry.computeVertexNormals()

            const parentMesh = new Object3D()
            parentMesh.add(mesh)

            if (layerObj.on == false) {
                parentMesh.visible = false
            }
            callback(parentMesh)
        })
    }
    private getCurtainVertices = (g: any, layerObj: any) => {
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
            let vSurface = this.p.p.projection.lonLatToVector3(
                g[i][i0],
                g[i][i1],
                g[i][2]
            )
            vSurface = [vSurface.x, vSurface.y, vSurface.z]
            // Vertical Depth xyz
            let vDepth = this.p.p.projection.lonLatToVector3(
                g[i][i0],
                g[i][i1],
                g[i][2] - depth
            )
            vDepth = [vDepth.x, vDepth.y, vDepth.z]
            // Previous Vertical Surface xyz
            let vSurfacePrev = this.p.p.projection.lonLatToVector3(
                g[i - 1][i0],
                g[i - 1][i1],
                g[i - 1][2]
            )
            vSurfacePrev = [vSurfacePrev.x, vSurfacePrev.y, vSurfacePrev.z]
            // Previous Vertical Depth xyz
            let vDepthPrev = this.p.p.projection.lonLatToVector3(
                g[i - 1][i0],
                g[i - 1][i1],
                g[i - 1][2] - depth
            )
            vDepthPrev = [vDepthPrev.x, vDepthPrev.y, vDepthPrev.z]

            let uv
            // L-shaped triangle (lower-left)
            // Prev Top
            vertices.positions.push(...vSurfacePrev)
            uv = new Vector2(currentLength / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])
            // Prev Bottom
            vertices.positions.push(...vDepthPrev)
            uv = new Vector2(currentLength / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])

            // Current Top
            vertices.positions.push(...vSurface)
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])

            // 7-shaped triangle (upper-right)
            // Current Bottom
            vertices.positions.push(...vDepth)
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])
            // Current Top
            vertices.positions.push(...vSurface)
            uv = new Vector2((currentLength + lengthArray[i]) / totalLength, 1)
            vertices.uvs.push(...[uv.x, uv.y])
            // Prev Bottom
            vertices.positions.push(...vDepthPrev)
            uv = new Vector2(currentLength / totalLength, 0)
            vertices.uvs.push(...[uv.x, uv.y])

            // Lastly update current length for the next run
            currentLength += lengthArray[i]
        }

        return vertices
    }
}
