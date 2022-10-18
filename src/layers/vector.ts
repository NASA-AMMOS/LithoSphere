import {
    Object3D,
    Vector3,
    CatmullRomCurve3,
    Line,
    LineBasicMaterial,
    BufferGeometry,
} from 'three'
import { LineGeometry } from 'three/examples/jsm/lines/LineGeometry'
import { LineMaterial } from 'three/examples/jsm/lines/LineMaterial'
import { Line2 } from 'three/examples/jsm/lines/Line2'

import Sprites from '../secondary/sprites'

export default class VectorLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj: any, callback?: Function): void => {
        if (!this.p.p._.wasInitialized) return

        let alreadyExists = false

        const finallyAdd = () => {
            for (let i = 0; i < this.p.vector.length; i++) {
                if (this.p.vector[i].hasOwnProperty('name')) {
                    if (this.p.vector[i].name == layerObj.name) {
                        this.p.vector[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                const meshes = this.generateVectors(layerObj)
                this.p.p.planet.add(meshes)
                layerObj.meshes = meshes
                this.p.vector.push(layerObj)
                this.p.vector.sort((a, b) => b.order - a.order)
            }
            this.p.p._.events._attenuate()
            if (typeof callback === 'function') callback()
        }

        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            (layerObj.hasOwnProperty('geojsonPath') ||
                layerObj.hasOwnProperty('geojson')) &&
            layerObj.hasOwnProperty('opacity')
        ) {
            if (
                layerObj.hasOwnProperty('geojsonPath') &&
                !layerObj.hasOwnProperty('geojson')
            ) {
                const xhr = new XMLHttpRequest()
                xhr.open('GET', layerObj.geojsonPath, true)
                xhr.responseType = 'json'
                xhr.withCredentials = layerObj.withCredentials === true || false
                xhr.onload = () => {
                    if (xhr.status !== 404 && xhr.response) {
                        layerObj.geojson = xhr.response
                        finallyAdd()
                    } else {
                        console.warn(
                            `Failed to fetch geojson data for vector layer: ${layerObj.name}`
                        )
                    }
                }

                xhr.send()
            } else {
                finallyAdd()
            }
        } else {
            console.warn(
                `Attempted to add an invalid vector layer: ${layerObj.name}`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.vector.length; i++) {
            const layer = this.p.vector[i]
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.meshes.visible = layer.on
                console.log(layer)

                this.p.p._.events._attenuate()
                return true
            }
        }
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.vector.length; i++) {
            const layer = this.p.vector[i]
            if (name === layer.name) {
                layer.opacity = Math.max(Math.min(opacity, 1), 0)
                layer.meshes.children.forEach((mesh) => {
                    mesh.material.opacity = layer.opacity
                })
                return true
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.vector.length; i++) {
            if (this.p.vector[i].name === name) {
                this.p.p.planet.remove(this.p.vector[i].meshes)
                this.p.vector.splice(i, 1)
                return true
            }
        }
        return false
    }

    private generateVectors = (layerObj: any) => {
        const vectorGroup = new Object3D()

        if (layerObj.geojson == null) {
            console.warn(`Vector layer: ${layerObj.name} has no geojson.`)
            return
        }
        const features = layerObj.geojson.features
        if (features == null) {
            console.warn(`Vector layer: ${layerObj.name} has invalid geojson.`)
            return
        }

        const pointType = layerObj.style ? layerObj.style.pointType : ''
        const lineType = layerObj.style ? layerObj.style.lineType : ''
        //const polygonType = layerObj.style ? layerObj.style.polygonType : ''

        for (const f of features) {
            const type = f.geometry.type
            let mesh = null

            switch (type.toLowerCase()) {
                case 'point':
                    switch (pointType) {
                        case 'sphere':
                            break
                        default:
                            mesh = this.geomTo.sprite(layerObj, f)
                    }
                    break
                case 'linestring':
                    switch (lineType) {
                        case 'thin':
                            mesh = this.geomTo.line(layerObj, f)
                            break
                        default:
                            mesh = this.geomTo.thickLine(layerObj, f)
                    }
                    break
                case 'polygon':
                    break
                default:
                    console.warn(
                        `Vector layer: ${layerObj.name} has an unsupported geojson geometry type: ${type}.`
                    )
                    break
            }

            mesh.feature = f

            vectorGroup.add(mesh)
        }

        if (layerObj.on == false) {
            vectorGroup.visible = false
        }

        return vectorGroup
    }

    // Helper
    private geomTo = {
        sprite: (layerObj: any, feature, forceNewMaterial?: boolean) => {
            let g = feature.geometry.coordinates
            const style = this.p.getFeatureStyle(layerObj, feature)

            const options: any = {}
            if (feature?.properties?.annotation === true) {
                options.annotation = true
                options.name = feature?.properties?.name
            }

            const sprite = Sprites.makeMarkerSprite(
                style,
                layerObj.name,
                options,
                forceNewMaterial
            )
            let i0 = 0
            let i1 = 1
            if (layerObj.swapLL) {
                i0 = 1
                i1 = 0
            }
            if (typeof g[0] == 'number') g = [g]
            const height =
                g[0][2] ||
                this.p.p.getElevationAtLngLat(g[0][i0], g[0][i1]) ||
                false
            const v = this.p.p.projection.lonLatToVector3(
                g[0][i0],
                g[0][i1],
                ((height || 0) + (style.elevOffset || 0)) *
                    this.p.p.options.exaggeration
            )

            if (height === false)
                // @ts-ignore
                sprite.noElevation = {
                    lng: g[0][i0],
                    lat: g[0][i1],
                    elevOffset: style.elevOffset,
                }

            sprite.position.set(v.x, v.y, v.z)
            sprite.renderOrder = layerObj.index
            if (layerObj.on == false) {
                sprite.visible = false
            }
            // @ts-ignore
            sprite.layerName = layerObj.name
            // @ts-ignore
            sprite.useKeyAsHoverName = layerObj.useKeyAsHoverName
            sprite.name = layerObj.name
            // @ts-ignore
            sprite.style = style

            // @ts-ignore
            sprite.restyle = () => {
                const newSprite = this.geomTo.sprite(
                    layerObj,
                    // @ts-ignore
                    sprite.feature,
                    // @ts-ignore
                    sprite.feature._highlighted || sprite.feature._active
                )
                // @ts-ignore
                sprite.style = newSprite.style
                sprite.material.dispose()
                sprite.material = newSprite.material
                sprite.material.map.needsUpdate = true
                sprite.material.needsUpdate = true
            }
            return sprite
        },
        line: (layerObj: any, feature) => {
            let g = feature.geometry.coordinates

            let i0 = 0
            let i1 = 1
            if (layerObj.swapLL) {
                i0 = 1
                i1 = 0
            }

            const vertices = []

            for (let i = 0; i < g.length; i++) {
                if (isNaN(g[i][i0])) g = g[0]
                const v = this.p.p.projection.lonLatToVector3(
                    g[i][i0],
                    g[i][i1],
                    (g[i][2] || 0) * this.p.p.options.exaggeration
                )
                vertices.push(new Vector3(v.x, v.y, v.z))
            }

            const style = this.p.getFeatureStyle(layerObj, feature, true)

            const geometry = new BufferGeometry().setFromPoints(vertices)
            const mesh = new Line(
                geometry,
                new LineBasicMaterial({
                    transparent: true,
                    color: style.color,
                })
            )
            // @ts-ignore
            mesh.layerName = layerObj.name
            // @ts-ignore
            mesh.strokeColor = style.color

            return mesh
        },
        thickLine: (layerObj: any, feature) => {
            let g = feature.geometry.coordinates

            const path = []
            let firstPos

            let i0 = 0
            let i1 = 1
            if (layerObj.swapLL) {
                i0 = 1
                i1 = 0
            }

            for (let i = 0; i < g.length; i++) {
                if (isNaN(g[i][i0])) g = g[0]
                const v = this.p.p.projection.lonLatToVector3(
                    g[i][i0],
                    g[i][i1],
                    (g[i][2] || 0) * this.p.p.options.exaggeration
                )
                if (i == 0) {
                    // firstPos hack to recenter coordinates on parent's (not planet's) center
                    // to reduce floating point rounding jitter
                    firstPos = new Vector3(v.x, v.y, v.z)
                }
                path.push(
                    new Vector3(
                        v.x - firstPos.x,
                        v.y - firstPos.y,
                        v.z - firstPos.z
                    )
                )
                if (i != 0 || i != g.length - 1)
                    path.push(path[path.length - 1])
            }

            const style = this.p.getFeatureStyle(layerObj, feature, true)

            const positions = []
            const spline = new CatmullRomCurve3(path)
            const divisions = Math.round(1 * path.length)
            for (let i = 0, l = divisions; i < l; i++) {
                const point = spline.getPoint(i / l)
                positions.push(point.x, point.y, point.z)
            }
            const geometry = new LineGeometry()
            geometry.setPositions(positions)

            const material = new LineMaterial({
                color: style.color,
                linewidth: 0.0005 * (style.weight || 1), // in pixels
            })

            const mesh = new Line2(geometry, material)
            mesh.computeLineDistances()
            mesh.position.set(firstPos.x, firstPos.y, firstPos.z)
            mesh.scale.set(1, 1, 1)
            // @ts-ignore
            mesh.layerName = layerObj.name
            // @ts-ignore
            mesh.strokeColor = style.color

            // @ts-ignore
            mesh.restyle = () => {
                const style = this.p.getFeatureStyle(
                    layerObj,
                    // @ts-ignore
                    mesh.feature,
                    true
                )
                mesh.material = new LineMaterial({
                    color: style.color,
                    linewidth: 0.0005 * (style.weight || 1), // in pixels
                }) // @ts-ignore
                mesh.strokeColor = style.color
            }

            return mesh
        },
    }

    /*
    private geometryToMeshLine = (g) => {
        const geometry = new THREE.Geometry()
        let i0 = 1
        let i1 = 0
        if (layerObj.swapLL) {
            i0 = 0
            i1 = 1
        }
        for (let i = 0; i < g.length; i++) {
            if (isNaN(g[i][i0])) g = g[0]
            let v = projection.lonLatToVector3(
                g[i][i0],
                g[i][i1],
                (g[i][2] + 0.4) * Globe_.exaggeration
            )
            geometry.vertices.push(v)
        }
        var lineGeometry = new MeshLine()
        lineGeometry.setGeometry(geometry)
        var material = new MeshLineMaterial({
            useMap: false,
            color: new THREE.Color(
                layerObj.style.color || layerObj.style.stroke
            ),
            opacity: 1,
            resolution: new THREE.Vector2(
                window.innerWidth,
                window.innerHeight
            ),
            sizeAttenuation: false,
            lineWidth: 20,
            near: Cameras.orbit.camera.near,
            far: Cameras.orbit.camera.far,
        })
        var mesh = new THREE.Mesh(lineGeometry.geometry, material)
        mesh.frustumCulled = false

        mesh.geometry.attributes.position.needsUpdate = true
        mesh.geometry.verticesNeedUpdate = true
        mesh.geometry.computeFaceNormals()
        mesh.geometry.computeVertexNormals()
        mesh.layerName = layerObj.layerName
        mesh.strokeColor = layerObj.style.color || layerObj.style.stroke
        if (layerObj.on == false) {
            mesh.visible = false
        }
        return mesh
    }
    */

    /*

    private geometryToSubbedSprite = (g) => {
        if (typeof g[0] == 'number') g = [g]
        if (!g[0][2] && g[0][2] != 0) return false
        var i0 = 1
        var i1 = 0
        if (layerObj.swapLL) {
            i0 = 0
            i1 = 1
        }
        var v = projection.lonLatToVector3(
            g[0][i0],
            g[0][i1],
            g[0][2] * Globe_.exaggeration + 1.3
        )
        var v2 = projection.lonLatToVector3(
            g[0][i0],
            g[0][i1] + 0.1,
            g[0][2] * Globe_.exaggeration + 1.3
        )

        var p = new THREE.Object3D()
        p.position.set(v.x, v.y, v.z)
        p.lookAt(new THREE.Vector3(v2.x, v2.y, v2.z))
        p.layerName = layerObj.layerName
        p.useKeyAsName = layerObj.useKeyAsName
        p.name = layerObj.name
        p.strokeColor = layerObj.style.color || layerObj.style.stroke
        p.fillColor = layerObj.style.fillColor || layerObj.style.fill

        var geometry = new THREE.CylinderBufferGeometry(0.15, 0.15, 2.6, 8)
        var mz = findHighestMaxZoom()
        var sf = 1

        lastPointTranslate = -2.6 * sf * 0.65
        geometry.translate(0, -1.7, 0)
        var material = new THREE.MeshPhongMaterial({
            color: layerObj.style.fillColor || layerObj.style.fill,
            opacity: 0.55,
            transparent: true,
        })
        var mesh = new THREE.Mesh(geometry, material)
        mesh.geometry.computeFaceNormals()
        mesh.geometry.computeVertexNormals()
        if (layerObj.on == false) {
            p.visible = false
        }
        p.add(mesh)
        var sprite = geometryToInnerSprite(g)
        sprite.layerName = layerObj.layerName
        sprite.useKeyAsName = layerObj.useKeyAsName
        sprite.name = layerObj.name
        sprite.strokeColor = layerObj.style.color || layerObj.style.stroke
        sprite.fillColor = layerObj.style.fillColor || layerObj.style.fill
        p.add(sprite)

        return p
    }

    private geometryToCylinder = (g) => {
        var i0 = 1
        var i1 = 0
        if (layerObj.swapLL) {
            i0 = 0
            i1 = 1
        }
        var v = projection.lonLatToVector3(
            g[0][i0],
            g[0][i1],
            (g[0][2] - 1) * Globe_.exaggeration
        )

        var geometry = new THREE.CylinderBufferGeometry(0.5, 0.5, 8, 8)
        var material = new THREE.MeshPhongMaterial({
            color: layerObj.style.fillColor || layerObj.style.fill,
        })
        var mesh = new THREE.Mesh(geometry, material)

        mesh.position.set(v.x, v.y, v.z)
        mesh.up.set(new THREE.Vector3(0, 1, 0)) //!
        mesh.geometry.computeFaceNormals()
        mesh.geometry.computeVertexNormals()
        if (layerObj.on == false) {
            mesh.visible = false
        }
        mesh.add(geometryToInnerSprite(g))
        return mesh
    }

    private geometryToInnerSprite = () => {
        var fillColor = layerObj.style.fillColor || layerObj.style.fill
        var strokeColor = layerObj.style.color || layerObj.style.stroke
        var sprite = Sprites.makeMarkerSprite(
            {
                radius: 64,
                fillColor: fillColor,
                strokeWeight: 12,
                strokeColor: strokeColor,
            },
            layerObj.layerName
        )
        sprite.scale.set(0.5, 0.5, 0.5)
        sprite.strokeColor = layerObj.style.color || layerObj.style.stroke
        sprite.fillColor = layerObj.style.fillColor || layerObj.style.fill
        return sprite
    }
    */
}
