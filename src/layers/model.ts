import { Object3D, Vector3, Quaternion } from 'three'
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js'
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js'
import { ColladaLoader } from 'three/examples/jsm/loaders/ColladaLoader.js'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js'
import Utils from '../utils'

const objLoader = new OBJLoader()
const mtlLoader = new MTLLoader()
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
                        model = this.localizeModel(layerObj, model)
                        this.p.p.planet.add(model)
                        layerObj.model = model
                        this.p.model.push(layerObj)
                        this.p.model.sort((a, b) => b.order - a.order)
                        this.setOpacity(layerObj.name, layerObj.opacity)
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

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        this.p.model.forEach((layer) => {
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                layer.model.visible = layer.on

                return true
            }
        })
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        if (opacity == null) opacity = 1

        for (let i = 0; i < this.p.model.length; i++) {
            const layer = this.p.model[i]
            if (name === layer.name) {
                layer.opacity = Math.max(Math.min(opacity, 1), 0)
                Utils.setAllMaterialOpacity(layer.model, layer.opacity)
                return true
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false
        for (let i = 0; i < this.p.model.length; i++) {
            if (this.p.model[i].name === name) {
                this.p.p.planet.remove(this.p.model[i].model)
                this.p.model.splice(i, 1)
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
        if (layerObj.mtlPath) {
            mtlLoader.load(layerObj.mtlPath, function (materials) {
                const objMtlLoader = new OBJLoader()
                objMtlLoader.setMaterials(materials)
                materials.preload()
                objMtlLoader.load(
                    layerObj.path,
                    function (mesh) {
                        //Done
                        callback(mesh)
                    },
                    function (xhr) {},
                    function (error) {
                        //Error
                        console.warn('Failed to load .obj at: ' + layerObj.path)
                        callback(false)
                    }
                )
            })
        } else {
            objLoader.load(
                layerObj.path,
                function (mesh) {
                    //Done
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
    }

    private daeToModel = (layerObj, callback: Function, options?: any) => {
        options = options || {}

        colladaLoader.load(
            layerObj.path,
            function (mesh) {
                //Done
                callback(mesh.scene)
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
        const parentMesh = new Object3D()

        const lng = layerObj.position.longitude || layerObj.position.lng || 0
        const lat = layerObj.position.latitude || layerObj.position.lat || 0
        const elev =
            (layerObj.position.elevation || layerObj.position.elev || 0) *
            this.p.p.options.exaggeration
        const pos = this.p.p.projection.lonLatToVector3(lng, lat, elev)
        model.position.set(pos.x, pos.y, pos.z)

        const quaternion = new Quaternion()
        quaternion.setFromUnitVectors(
            new Vector3(0, 1, 0),
            new Vector3(pos.x, pos.y, pos.z).normalize()
        )
        model.applyQuaternion(quaternion)
        model.rotateY(-lng * (Math.PI / 180))

        if (layerObj.rotation) {
            let order = layerObj.rotation.order || 'YXZ'
            if (order.length != 3) {
                console.warn(
                    `Lithosphere: Warning - Model Layer "${layerObj.name}" has an invalid rotation.order. Defaulting back to 'YXZ'`
                )
                order = 'YXZ'
            }
            model.rotation.order = order
            order.split('').forEach((axis) => {
                switch (axis) {
                    case 'X':
                        model.rotateX(layerObj.rotation.x || 0)
                        break
                    case 'Y':
                        model.rotateY(-layerObj.rotation.y || 0)
                        break
                    case 'Z':
                        model.rotateZ(layerObj.rotation.z || 0)
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
            model.scale.set(s || 1, s || 1, s || 1)
        }

        if (layerObj.on == false) {
            model.visible = false
        }

        parentMesh.add(model)
        return parentMesh
    }
}
