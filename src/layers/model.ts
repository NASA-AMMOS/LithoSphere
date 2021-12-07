import { Object3D, Vector3 } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Utils from '../utils'

const objLoader = new OBJLoader()
const colladaLoader = new ColladaLoader()
const gltfLoader = new GLTFLoader()

export default class ModelLayerer {
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
            layerObj.hasOwnProperty('path')
        ) {
            for (let i = 0; i < this.p.model.length; i++) {
                if (this.p.model[i].hasOwnProperty('name')) {
                    if (this.p.model[i].name == layerObj.name) {
                        this.p.model[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                this.generateModel(layerObj, (model) => {
                    if (model) {
                        this.p.p.planet.add(model)
                        this.localizeModel(layerObj, model)
                        layerObj.model = model
                        this.p.model.push(layerObj)
                        this.p.mode.sort((a, b) => b.order - a.order)
                    }
                    if (typeof callback === 'function') callback()
                })
            } else if (typeof callback === 'function') callback()
        } else {
            console.warn(
                `Attempted to add an invalid model layer: ${layerObj.name}. Required props: name, on, path`
            )
        }
    }

    // TODO
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

    // TODO
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

    // TODO
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

    private generateModel = (layerObj: any, callback: Function) => {
        const modelType = Utils.getExtension(layerObj.path).toLowerCase()

        switch (modelType) {
            case 'obj':
                this.objToModel(layerObj, callback)
                break
            case 'dae':
                this.daeToModel(layerObj, callback)
                break
            case 'glb':
            case 'gltf':
                this.gltfToModel(layerObj, callback)
                break
            default:
                console.warn(
                    `WARNING - Unsupported model file type: ${modelType} in layer ${layerObj.name}. Must be one of: obj, dae, glb`
                )
                callback(false)
        }
    }

    private objToModel = async (layerObj, callback: Function) => {
        objLoader.load(
            layerObj.path,
            function (mesh) {
                //Done
                console.log(mesh)
                callback(mesh)
            },
            function (xhr) {},
            function (error) {
                //Error
                console.warn('Failed to load .obj at: ' + layerObj.path)
                callback(false)
            }
        )
    }

    private daeToModel = (layerObj, callback: Function, options?: any) => {
        options = options || {}

        colladaLoader.load(
            layerObj.path,
            function (mesh) {
                //Done
                //care alphatest
                /*
                if (
                    !isNaN(options.opacity) &&
                    options.opacity >= 0 &&
                    options.opacity <= 1
                ) {
                    for (let c = 0; c < mesh.scene.children.length; c++) {
                        mesh.scene.children[c].material.opacity =
                            options.opacity
                        mesh.scene.children[c].material.transparent = true
                        for (let i in mesh.scene.children[c].material) {
                            if (mesh.scene.children[c].material[i]) {
                                mesh.scene.children[c].material[i].opacity =
                                    options.opacity
                                mesh.scene.children[c].material[
                                    i
                                ].transparent = true
                            }
                        }
                    }
                }
                */
                if (options.inAParent) {
                    const dae = new Object3D()
                    dae.add(mesh.scene)
                    callback(dae)
                } else {
                    callback(mesh.scene)
                }
            },
            function (xhr) {},
            function (error) {
                //Error
                console.warn('Failed to load .dae at: ' + layerObj.path)
                callback(false)
            }
        )
    }

    private gltfToModel = async (layerObj, callback: Function) => {
        gltfLoader.load(
            layerObj.path,
            function (mesh) {
                //Done
                console.log('mesh', mesh)
                callback(mesh.scene)
            },
            function (xhr) {
                //Progress
                /*
                if (xhr.total > 0)
                    console.log(
                        `${layerObj.path}: (xhr.loaded / xhr.total) * 100 + '% loaded!`
                    )
                */
            },
            function (error) {
                //Error
                console.warn('Failed to load gltf at: ' + layerObj.path)
                callback(false)
            }
        )
    }

    // Sets model position, scale, rotation, &c.
    private localizeModel = (layerObj, model) => {
        // scale
        let scale = layerObj.scale
        if (scale == null) scale = 1
        model.scale.set(scale, scale, scale)

        // position
        const v = this.p.p.projection.lonLatToVector3(
            layerObj.position.longitude || layerObj.position.lng || 0,
            layerObj.position.latitude || layerObj.position.lat || 0,
            (layerObj.position.elevation || layerObj.position.elev || 0) *
                this.p.p.options.exaggeration
        )
        model.position.set(v.x, v.y, v.z)

        // rotation
        const rotation = layerObj.rotation || {}

        // Adjust to y+ coords
        rotation.x = rotation.x || 0

        let order = rotation.order || 'XYZ'
        if (order.length != 3) {
            console.warn(
                `Lithosphere: Warning - Model Layer "${layerObj.name}" has an invalid rotation.order. Defaulting back to 'XYZ'`
            )
            order = 'XYZ'
        }
        model.rotation.order = order
        order = order.toLowerCase()
        for (let a of order.split('')) {
            switch (a) {
                case 'x':
                    Utils.rotateAroundArbAxis(
                        model,
                        new Vector3(1, 0, 0),
                        rotation.x || 0
                    )
                    break
                case 'y':
                    Utils.rotateAroundArbAxis(
                        model,
                        new Vector3(0, 1, 0),
                        rotation.y || 0
                    )
                    break
                case 'z':
                    Utils.rotateAroundArbAxis(
                        model,
                        new Vector3(0, 0, 1),
                        rotation.z || 0
                    )
                    break
                default:
                    console.warn(
                        `Lithosphere: Warning - Model Layer "${layerObj.name}" has an unknown rotation.order axis: ${a}`
                    )
                    break
            }
        }
    }
}
