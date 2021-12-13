import { TilesRenderer } from '3d-tiles-renderer'
import { Vector3, Object3D, Quaternion, MeshBasicMaterial } from 'three'

import Utils from '../utils'

export default class Tile3dLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj: any): void => {
        if (!this.p.p._.wasInitialized) return

        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            layerObj.hasOwnProperty('path') &&
            layerObj.hasOwnProperty('opacity') &&
            layerObj.hasOwnProperty('minZoom') &&
            layerObj.hasOwnProperty('maxZoom')
        ) {
            let alreadyExists = false
            for (let i = 0; i < this.p.tile3d.length; i++) {
                if (this.p.tile3d[i].hasOwnProperty('name')) {
                    if (this.p.tile3d[i].name == layerObj.name) {
                        this.p.tile3d[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                const tilesRenderer = this.generateTile3ds(layerObj)
                const tile3dLayer = new Object3D()
                // @ts-ignore
                tile3dLayer.material = new MeshBasicMaterial({
                    transparent: true,
                    opacity: 0.5,
                    color: 0xaaaaaa,
                })
                this.p.p.planet.add(tile3dLayer)
                const model = this.localizeTile3ds(layerObj, tilesRenderer)
                tile3dLayer.add(model)
                layerObj.meshes = model
                layerObj.renderer = tilesRenderer
                layerObj.tile3dLayer = tile3dLayer
                this.p.tile3d.push(layerObj)
                this.p.tile3d.sort((a, b) => b.order - a.order)
            }
        } else {
            console.warn(
                `Attempted to add an invalid tile3d layer: ${layerObj.name}`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        this.p.vector.forEach((layer) => {
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.meshes.visible = layer.on

                this.p.p._.events._attenuate()
                return true
            }
        })
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false
        opacity = Math.max(Math.min(opacity, 1), 0)

        this.p.tile3d.forEach((layer) => {
            if (name === layer.name) {
                layer.opacity = Math.max(Math.min(opacity, 1), 0)
                layer.meshes.children.forEach((mesh) => {
                    mesh.material.opacity = layer.opacity
                })
                return true
            }
        })
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.tile3d.length; i++) {
            if (this.p.tile3d[i].name === name) {
                this.p.p.planet.remove(this.p.tile3d[i].tile3dLayer)
                this.p.tile3d.splice(i, 1)
                return true
            }
        }
        return false
    }

    private generateTile3ds = (layerObj: any) => {
        const tilesRenderer = new TilesRenderer(layerObj.path)

        tilesRenderer.setCamera(this.p.p._.cameras.camera)
        tilesRenderer.setResolutionFromRenderer(
            this.p.p._.cameras.camera,
            this.p.p._.renderer
        )

        return tilesRenderer
    }

    private localizeTile3ds = (layerObj: any, tilesRenderer: any) => {
        const parentMesh = new Object3D()

        const lng = layerObj.position.longitude || layerObj.position.lng || 0
        const lat = layerObj.position.latitude || layerObj.position.lat || 0
        const elev =
            (layerObj.position.elevation || layerObj.position.elev || 0) *
            this.p.p.options.exaggeration
        const pos = this.p.p.projection.lonLatToVector3(lng, lat, elev)
        tilesRenderer.group.position.set(pos.x, pos.y, pos.z)

        const quaternion = new Quaternion()
        quaternion.setFromUnitVectors(
            new Vector3(0, 1, 0),
            new Vector3(pos.x, pos.y, pos.z).normalize()
        )
        tilesRenderer.group.applyQuaternion(quaternion)
        tilesRenderer.group.rotateY(-lng * (Math.PI / 180))

        if (layerObj.rotation) {
            let order = layerObj.rotation.order || 'YXZ'
            if (order.length != 3) {
                console.warn(
                    `Lithosphere: Warning - Model Layer "${layerObj.name}" has an invalid rotation.order. Defaulting back to 'YXZ'`
                )
                order = 'YXZ'
            }
            tilesRenderer.group.rotation.order = order
            order.split('').forEach((axis) => {
                switch (axis) {
                    case 'X':
                        tilesRenderer.group.rotateX(layerObj.rotation.x || 0)
                        break
                    case 'Y':
                        tilesRenderer.group.rotateY(layerObj.rotation.y || 0)
                        break
                    case 'Z':
                        tilesRenderer.group.rotateZ(layerObj.rotation.z || 0)
                        break
                    default:
                        console.warn(
                            `Lithosphere: Warning - Model Layer "${layerObj.name}" has an invalid rotation.order axis: ${axis}. Must be one of X, Y, Z`
                        )
                        break
                }
            })
        }
        if (layerObj.scale != null) {
            const s = layerObj.scale
            tilesRenderer.group.scale.set(s || 1, s || 1, s || 1)
        }

        if (layerObj.on == false) {
            tilesRenderer.group.visible = false
        }

        parentMesh.add(tilesRenderer.group)
        return parentMesh

        /*
        ///
        // position
        const v = this.p.p.projection.lonLatToVector3(
            layerObj.position.longitude || layerObj.position.lng || 0,
            layerObj.position.latitude || layerObj.position.lat || 0,
            (layerObj.position.elevation || layerObj.position.elev || 0) *
                this.p.p.options.exaggeration
        )
        tilesRenderer.group.position.set(v.x, v.y, v.z)

        // scale
        let scale = layerObj.scale
        if (scale == null) scale = 1
        tilesRenderer.group.scale.set(scale, scale, scale)

        // rotation
        const rotation = layerObj.rotation || {}

        // Adjust to y+ coords
        rotation.x = rotation.x || 0

        let order = rotation.order || 'XYZ'
        if (order.length != 3) {
            console.warn(
                `Lithosphere: Warning - Tile3d Layer "${layerObj.name}" has an invalid rotation.order. Defaulting back to 'XYZ'`
            )
            order = 'XYZ'
        }
        tilesRenderer.group.rotation.order = order
        order = order.toLowerCase()

        for (let a of order.split('')) {
            switch (a) {
                case 'x':
                    Utils.rotateAroundArbAxis(
                        tilesRenderer.group,
                        new Vector3(1, 0, 0),
                        rotation.x || 0
                    )
                    break
                case 'y':
                    Utils.rotateAroundArbAxis(
                        tilesRenderer.group,
                        new Vector3(0, 1, 0),
                        rotation.y || 0
                    )
                    break
                case 'z':
                    Utils.rotateAroundArbAxis(
                        tilesRenderer.group,
                        new Vector3(0, 0, 1),
                        rotation.z || 0
                    )
                    break
                default:
                    console.warn(
                        `Lithosphere: Warning - Tile3d Layer "${layerObj.name}" has an unknown rotation.order axis: ${a}`
                    )
                    break
            }
        }
        */
    }
}
