import { Quaternion } from 'three'
import { XY, XYZ } from '../generalTypes'

const Utils = {
    /**
     * Traverses an object with an array of keys
     * @param {*} obj
     * @param {*} keyArray
     */
    getIn: function (obj: any, keyArray: any, notSetValue?: any): any {
        if (obj == null) return notSetValue != null ? notSetValue : null
        if (typeof keyArray === 'string') keyArray = keyArray.split('.')
        if (keyArray == null) return notSetValue != null ? notSetValue : null
        let object = Object.assign({}, obj)
        for (let i = 0; i < keyArray.length; i++) {
            if (object.hasOwnProperty(keyArray[i])) object = object[keyArray[i]]
            else return notSetValue != null ? notSetValue : null
        }
        return object
    },
    //a mod that works with negatives. A true modulo and not remainder
    mod: function (n: number, m: number): number {
        const remain = n % m
        return Math.floor(remain >= 0 ? remain : remain + m)
    },
    findHighestMaxZoom: function (tileLayers: any): number {
        let highest = 0
        for (const l in tileLayers) {
            if (tileLayers[l].name != 'Vectors As Tiles')
                if (tileLayers[l].maxZoom > highest) {
                    highest = tileLayers[l].maxZoom
                }
        }
        return highest
    },
    findLowestMinZoom: function (tileLayers: any): number {
        let lowest = Infinity
        for (const l in tileLayers) {
            if (tileLayers[l].path !== '_vectorsastile_') {
                if (tileLayers[l].minZoom < lowest) {
                    lowest = tileLayers[l].minZoom
                }
            }
        }
        return lowest
    },
    // Returns true if the tile at xyz in the bounding box bb
    // Checks to see if any corners of it fit inside
    isInExtent: function (xyz: XYZ, bb, projection): boolean {
        //return true;
        let inExtent = true
        if (bb) {
            let tx_ext = xyz.x + 0
            let ty_ext = xyz.y + 0
            let projectedLL = projection.tileXYZ2LatLng(tx_ext, ty_ext, xyz.z)
            let tlat_ext = projectedLL.lat
            let tlon_ext = projectedLL.lng

            inExtent =
                tlat_ext < bb[3] &&
                tlat_ext > bb[1] &&
                tlon_ext < bb[2] &&
                tlon_ext > bb[0]

            tx_ext = xyz.x + 1
            ty_ext = xyz.y + 0
            projectedLL = projection.tileXYZ2LatLng(tx_ext, ty_ext, xyz.z)
            tlat_ext = projectedLL.lat
            tlon_ext = projectedLL.lng

            inExtent =
                inExtent ||
                (tlat_ext < bb[3] &&
                    tlat_ext > bb[1] &&
                    tlon_ext < bb[2] &&
                    tlon_ext > bb[0])

            tx_ext = xyz.x + 1
            ty_ext = xyz.y + 1
            projectedLL = projection.tileXYZ2LatLng(tx_ext, ty_ext, xyz.z)
            tlat_ext = projectedLL.lat
            tlon_ext = projectedLL.lng

            inExtent =
                inExtent ||
                (tlat_ext < bb[3] &&
                    tlat_ext > bb[1] &&
                    tlon_ext < bb[2] &&
                    tlon_ext > bb[0])

            tx_ext = xyz.x + 0
            ty_ext = xyz.y + 1
            projectedLL = projection.tileXYZ2LatLng(tx_ext, ty_ext, xyz.z)
            tlat_ext = projectedLL.lat
            tlon_ext = projectedLL.lng

            inExtent =
                inExtent ||
                (tlat_ext < bb[3] &&
                    tlat_ext > bb[1] &&
                    tlon_ext < bb[2] &&
                    tlon_ext > bb[0])
        }
        return inExtent
    },
    //Return a clone of the object to avoid pass by reference issues
    clone: function (obj: any): any {
        let copy
        // Handle the 3 simple types, and null or undefined
        if (null == obj || 'object' != typeof obj) return obj

        // Handle Date
        if (obj instanceof Date) {
            copy = new Date()
            copy.setTime(obj.getTime())
            return copy
        }

        // Handle Array
        if (obj instanceof Array) {
            copy = []
            for (let i = 0, len = obj.length; i < len; i++) {
                copy[i] = Utils.clone(obj[i])
            }
            return copy
        }

        // Handle Object
        if (obj instanceof Object) {
            copy = {}
            for (const attr in obj) {
                if (obj.hasOwnProperty(attr))
                    copy[attr] = Utils.clone(obj[attr])
            }
            return copy
        }
        throw new Error("Unable to copy obj! Its type isn't supported.")
    },
    capitalizeFirstLetter: function (string: string) {
        return string.charAt(0).toUpperCase() + string.slice(1)
    },
    getExtension: function (string: string): string {
        return /(?:\.([^.]+))?$/.exec(string)[1] || ''
    },
    getRadiansPerPixel: function (zoom: number): number {
        return ((360 / Math.pow(2, zoom)) * (Math.PI / 180)) / 256
    },
    /**
     * Given an xyz and z, gets all tiles on zoom level z that are contained in xyz
     * @param {[x,y,z]} xyz - the tile to get the contents of
     * @param {number} z - the zoom level of tiles to get
     * @param {boolean} useLast - use lastTileContains
     * return arrays of [x,y,z]s contained
     */
    //For use with tileContains. Stores last three calls and results to speed up performance
    lastTileContains: [],
    tileContains: function (xyz: any, z: number, useLast?: boolean): any {
        if (useLast) {
            for (let i = 0; i < Utils.lastTileContains.length; i++) {
                const lastxyz = Utils.lastTileContains[i].call.xyz
                if (
                    lastxyz[0] == xyz[0] &&
                    lastxyz[1] == xyz[1] &&
                    lastxyz[2] == xyz[2] &&
                    Utils.lastTileContains[i].call.z == z
                ) {
                    return Utils.lastTileContains[i].result
                }
            }
        }
        const contained = []
        const zoomRatio = Math.pow(2, z) / Math.pow(2, xyz[2])
        const max = [(xyz[0] + 1) * zoomRatio - 1, (xyz[1] + 1) * zoomRatio - 1]
        const min = [max[0] - zoomRatio + 1, max[1] - zoomRatio + 1]
        for (let x = min[0]; x <= max[0]; x++) {
            for (let y = min[1]; y <= max[1]; y++) {
                contained.push([x, y, z])
            }
        }
        Utils.lastTileContains.unshift({
            call: { xyz: xyz, z: z },
            result: contained,
        })
        if (Utils.lastTileContains.length > 3) Utils.lastTileContains.pop()
        return contained
    },
    /**
     * Returns true if tile xyzContainer contains the tile xyzContained
     * @param {[x,y,z]} xyzContainer
     * @param {[x,y,z]} xyzContained
     * return bool
     */
    tileIsContained(
        xyzContainer: any,
        xyzContained: any,
        useLast?: boolean
    ): boolean {
        const contains = this.tileContains(
            xyzContainer,
            xyzContained[2],
            useLast
        )
        for (let i = 0; i < contains.length; i++) {
            if (
                contains[i][0] == xyzContained[0] &&
                contains[i][1] == xyzContained[1]
            )
                return true
        }
        return false
    },
    // if array is an array of objects,
    // the optional key can be set to say which key to average
    arrayAverage(array: any, key: string): number {
        let total = 0
        for (let i = 0; i < array.length; i++) {
            if (key != null) total += array[i][key]
            else total += array[i]
        }
        return total / array.length
    },
    //From: http://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb Tim Down
    hexToRGB(hex: string): any {
        // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
        const shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i
        hex = hex.replace(shorthandRegex, (m, r, g, b) => r + r + g + g + b + b)

        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
        return result
            ? {
                  r: parseInt(result[1], 16),
                  g: parseInt(result[2], 16),
                  b: parseInt(result[3], 16),
              }
            : null
    },
    // 2D rotate a point about another point a certain angle
    // pt is {x: ,y: }  center is [x,y]  angle in radians
    rotatePoint(pt, center, angle): XY {
        const cosAngle = Math.cos(angle)
        const sinAngle = Math.sin(angle)
        const dx = pt.x - center[0]
        const dy = pt.y - center[1]

        return {
            x: center[0] + dx * cosAngle - dy * sinAngle,
            y: center[1] + dx * sinAngle + dy * cosAngle,
        }
    },
    rotateAroundArbAxis(object, axis, radians, noPremultiply?: boolean): void {
        /*
        const rotationMatrix = new Matrix4()
        rotationMatrix.makeRotationAxis(axis.normalize(), radians)
        if (noPremultiply !== true) rotationMatrix.multiply(object.matrix) // pre-multiply
        object.matrix = rotationMatrix
        object.rotation.setFromRotationMatrix(object.matrix)
        */
        object.updateWorldMatrix(true)
        const invWorldRot = object.getWorldQuaternion(new Quaternion()).invert()
        axis.applyQuaternion(invWorldRot)

        const deltaLocalRot = new Quaternion()
        deltaLocalRot.setFromAxisAngle(axis, radians)
        object.quaternion.multiply(deltaLocalRot)
    },
    //
    getParamString(
        params: any,
        baseUrl: string,
        isUppercase?: boolean
    ): string {
        const str = []

        const urlParams = new URLSearchParams(baseUrl.toUpperCase())

        for (const o in params) {
            if (!urlParams.has(o.toUpperCase()))
                str.push(
                    encodeURIComponent(isUppercase ? o.toUpperCase() : o) +
                        '=' +
                        encodeURIComponent(params[o])
                )
        }

        return (
            (baseUrl && baseUrl.indexOf('?') !== -1 ? '&' : '?') + str.join('&')
        )
    },
    isArray(object: any): boolean {
        return Object.prototype.toString.call(object) === '[object Array]'
    },
    // Sets a model's direct children's opacities
    setChildrenMaterialOpacity(model, opacity: number, recurse?: Function) {
        model.children.forEach((mesh) => {
            if (mesh.material) {
                mesh.material.transparent = true
                mesh.material.opacity = opacity
            }
            if (
                typeof recurse === 'function' &&
                mesh.children &&
                mesh.children.length > 0
            ) {
                recurse(mesh)
            }
        })
    },
    // Traverses through all children and children's children, &c. and changes their material opacities
    setAllMaterialOpacity(model, opacity): void {
        if (model.material) {
            model.material.transparent = true
            model.material.opacity = opacity
        }
        Utils.setChildrenMaterialOpacity(model, opacity, (mesh) => {
            Utils.setAllMaterialOpacity(mesh, opacity)
        })
    },
}

export default Utils
