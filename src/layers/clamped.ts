import Utils from '../utils'

import { XYZ } from '../generalTypes.d.ts'

let opacityTimeout = null

export default class ClampedLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj: any, callback?: Function): void => {
        if (!this.p.p._.wasInitialized) return

        let alreadyExists = false

        const finallyAdd = () => {
            for (let i = 0; i < this.p.clamped.length; i++) {
                if (this.p.clamped[i].hasOwnProperty('name')) {
                    if (this.p.clamped[i].name == layerObj.name) {
                        this.p.clamped[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                this.p.clamped.push(layerObj)
                this.p.clamped.sort((a, b) => a.order - b.order)
            }
            //Refresh all tile rasters
            if (
                this.p.p.zoom >= layerObj.minZoom &&
                this.p.p.zoom <= layerObj.maxZoom
            ) {
                this.p.p._.tiledWorld.updateAllRasters()
            }
            if (typeof callback === 'function') callback()
        }

        this.p.p._.tiledWorld.killDrawingTiles()

        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            ((layerObj.preDrawn === true && layerObj.hasOwnProperty('data')) ||
                ((layerObj.hasOwnProperty('geojsonPath') ||
                    layerObj.hasOwnProperty('geojson')) &&
                    layerObj.hasOwnProperty('minZoom') &&
                    layerObj.hasOwnProperty('maxZoom')))
        ) {
            if (
                layerObj.hasOwnProperty('geojsonPath') &&
                !layerObj.hasOwnProperty('geojson')
            ) {
                if (!layerObj.hasOwnProperty('opacity')) layerObj.opacity = 1

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
                            `Failed to fetch geojson data for clamped layer: ${layerObj.name}`
                        )
                    }
                }

                xhr.send()
            } else {
                finallyAdd()
            }
        } else {
            console.warn(
                `Attempted to add an invalid clamped layer: ${layerObj.name}`
            )
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        let foundMatch = false
        this.p.clamped.forEach((layer) => {
            if (name === layer.name) {
                layer.on = on != null ? on : !layer.on
                foundMatch = true
            }
        })

        if (foundMatch) {
            this.p.p._.tiledWorld.updateAllRasters()
            return true
        }
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.clamped.length; i++) {
            const layer = this.p.clamped[i]
            if (name === layer.name) {
                // Since this operation is expensive
                clearTimeout(opacityTimeout)
                opacityTimeout = setTimeout(() => {
                    layer.opacity = Math.max(Math.min(opacity, 1), 0)
                    if (
                        this.p.p.zoom >= layer.minZoom &&
                        this.p.p.zoom <= layer.maxZoom
                    ) {
                        this.p.p._.tiledWorld.killDrawingTiles()
                        this.p.p._.tiledWorld.updateAllRasters()
                    }
                }, 250)
                return true
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.clamped.length; i++) {
            if (this.p.clamped[i].hasOwnProperty('name')) {
                if (this.p.clamped[i].name == name) {
                    const minZoom = this.p.clamped[i].minZoom
                    const maxZoom = this.p.clamped[i].maxZoom
                    if (this.p.p.zoom >= minZoom && this.p.p.zoom <= maxZoom) {
                        this.p.p._.tiledWorld.killDrawingTiles()
                        this.p.p._.tiledWorld.updateAllRasters()
                    }
                    this.p.clamped.splice(i, 1)
                    return true
                }
            }
        }
        return false
    }

    // Returns a canvas data url of the clamped layer's texture for the tile
    // as well as overlapping features
    getClampedTexture = (i: number, xyz: XYZ): any => {
        let scaleFactor = 0.5

        const c = this.p.clamped[i]
        const canvas = document.createElement('canvas')
        canvas.id = 'vectorsastile'
        canvas.width = 256 / scaleFactor

        //Now reduce this in the case the tile is an LOD tile
        scaleFactor = scaleFactor * Math.pow(2, this.p.p.zoom - xyz.z)

        canvas.height = canvas.width
        const ctx = canvas.getContext('2d')
        //var imgData = ctx.getImageData(0, 0, canvas.width, canvas.height)
        let x
        let y

        let overlappedFeatures = []

        //If the scaleFactor's too great, then we can skip drawing
        // because if would start getting into subpixels
        if (scaleFactor < 128) {
            // It's dRawn not dawn >.<
            // This isn't used directly by lithosphere but the parent application
            // of this library uses this. With it, you can bypass the default
            // drawing method and generate your own tiles how ever you want

            if (c.preDrawn) {
                ctx.imageSmoothingEnabled = false
                if (
                    c.data &&
                    c.data[xyz.z] &&
                    c.data[xyz.z][xyz.x] &&
                    c.data[xyz.z][xyz.x][xyz.y] != null
                ) {
                    ctx.drawImage(
                        c.data[xyz.z][xyz.x][xyz.y],
                        0,
                        0,
                        canvas.width,
                        canvas.height
                    )
                }
            } else {
                for (const f of c.geojson.features) {
                    const style = this.p.getFeatureStyle(c, f)

                    let doesFeatureOverlapTile = false
                    if (
                        style.fillColor.substring(0, 3).toLowerCase() != 'rgb'
                    ) {
                        const col = Utils.hexToRGB(style.fillColor)
                        if (col) {
                            style.fillColor =
                                'rgba(' +
                                col.r +
                                ',' +
                                col.g +
                                ',' +
                                col.b +
                                ',' +
                                style.fillOpacity +
                                ')'
                        }
                    } else {
                        //is rgb so add a
                        const rgb = style.fillColor
                            .substring(4, style.fillColor.length - 1)
                            .replace(/ /g, '')
                            .split(',')
                        style.fillColor =
                            'rgba(' +
                            rgb[0] +
                            ',' +
                            rgb[1] +
                            ',' +
                            rgb[2] +
                            ',' +
                            style.fillOpacity +
                            ')'
                    }

                    ctx.fillStyle = style.fillColor
                    ctx.strokeStyle = style.color
                    ctx.lineWidth = style.weight * ((1 / scaleFactor) * 1)
                    ctx.globalAlpha = c.opacity
                    ctx.lineCap = 'round'
                    style.radius *= (1 / scaleFactor) * 1 || 10

                    if (
                        (f.geometry.type == 'Polygon' ||
                            f.geometry.type == 'MultiPolygon') &&
                        f.geometry.coordinates[0]
                    ) {
                        for (
                            let p = 0;
                            p < f.geometry.coordinates.length;
                            p++
                        ) {
                            if (
                                typeof f.geometry.coordinates[p][0][0] ===
                                'number'
                            ) {
                                for (
                                    let i = 0;
                                    i < f.geometry.coordinates[p].length;
                                    i++
                                ) {
                                    x = this.p.p.projection.lon2tileUnfloored(
                                        f.geometry.coordinates[p][i][0],
                                        xyz.z
                                    )
                                    y = this.p.p.projection.lat2tileUnfloored(
                                        f.geometry.coordinates[p][i][1],
                                        xyz.z
                                    )
                                    // prettier-ignore
                                    // @ts-ignore
                                    const canvasX = parseInt((x - xyz.x) * canvas.width)
                                    // prettier-ignore
                                    // @ts-ignore
                                    const canvasY = parseInt((y - xyz.y) * canvas.height)

                                    if (i == 0) {
                                        ctx.beginPath()
                                        ctx.moveTo(canvasX, canvasY)
                                    } else {
                                        ctx.lineTo(canvasX, canvasY)
                                    }
                                    if (
                                        canvasX >= 0 &&
                                        canvasX < canvas.width &&
                                        canvasY >= 0 &&
                                        canvasY < canvas.height
                                    )
                                        doesFeatureOverlapTile = true
                                }
                            } else if (
                                typeof f.geometry.coordinates[p][0][0][0] ===
                                'number'
                            ) {
                                for (
                                    let i = 0;
                                    i < f.geometry.coordinates[p].length;
                                    i++
                                ) {
                                    for (
                                        let j = 0;
                                        j < f.geometry.coordinates[p][i].length;
                                        j++
                                    ) {
                                        x = this.p.p.projection.lon2tileUnfloored(
                                            f.geometry.coordinates[p][i][j][0],
                                            xyz.z
                                        )
                                        y = this.p.p.projection.lat2tileUnfloored(
                                            f.geometry.coordinates[p][i][j][1],
                                            xyz.z
                                        )
                                        // prettier-ignore
                                        // @ts-ignore
                                        const canvasX = parseInt((x - xyz.x) * canvas.width)
                                        // prettier-ignore
                                        // @ts-ignore
                                        const canvasY = parseInt((y - xyz.y) * canvas.height)

                                        if (j == 0) {
                                            ctx.beginPath()
                                            ctx.moveTo(canvasX, canvasY)
                                        } else {
                                            ctx.lineTo(canvasX, canvasY)
                                        }
                                        if (
                                            canvasX >= 0 &&
                                            canvasX < canvas.width &&
                                            canvasY >= 0 &&
                                            canvasY < canvas.height
                                        )
                                            doesFeatureOverlapTile = true
                                    }
                                }
                            }
                            ctx.stroke()
                            ctx.closePath()
                            ctx.fill()
                        }
                    } else if (
                        f.geometry.type == 'LineString' ||
                        f.geometry.type == 'MultiLineString'
                    ) {
                        if (typeof f.geometry.coordinates[0][0] === 'number') {
                            for (
                                let p = 0;
                                p < f.geometry.coordinates.length;
                                p++
                            ) {
                                x = this.p.p.projection.lon2tileUnfloored(
                                    f.geometry.coordinates[p][0],
                                    xyz.z
                                )
                                y = this.p.p.projection.lat2tileUnfloored(
                                    f.geometry.coordinates[p][1],
                                    xyz.z
                                )
                                // prettier-ignore
                                // @ts-ignore
                                const canvasX = parseInt((x - xyz.x) * canvas.width)
                                // prettier-ignore
                                // @ts-ignore
                                const canvasY = parseInt((y - xyz.y) * canvas.height)

                                if (p == 0) {
                                    ctx.beginPath()
                                    ctx.moveTo(canvasX, canvasY)
                                } else {
                                    ctx.lineTo(canvasX, canvasY)
                                }
                                if (
                                    canvasX >= 0 &&
                                    canvasX < canvas.width &&
                                    canvasY >= 0 &&
                                    canvasY < canvas.height
                                )
                                    doesFeatureOverlapTile = true
                            }
                            ctx.stroke()
                        } else if (
                            typeof f.geometry.coordinates[0][0][0] === 'number'
                        ) {
                            for (
                                let p = 0;
                                p < f.geometry.coordinates.length;
                                p++
                            ) {
                                for (
                                    let i = 0;
                                    i < f.geometry.coordinates[p].length;
                                    i++
                                ) {
                                    x = this.p.p.projection.lon2tileUnfloored(
                                        f.geometry.coordinates[p][i][0],
                                        xyz.z
                                    )
                                    y = this.p.p.projection.lat2tileUnfloored(
                                        f.geometry.coordinates[p][i][1],
                                        xyz.z
                                    )
                                    // prettier-ignore
                                    // @ts-ignore
                                    const canvasX = parseInt((x - xyz.x) * canvas.width)
                                    // prettier-ignore
                                    // @ts-ignore
                                    const canvasY = parseInt((y - xyz.y) * canvas.height)

                                    if (i == 0) {
                                        ctx.beginPath()
                                        ctx.moveTo(canvasX, canvasY)
                                    } else {
                                        ctx.lineTo(canvasX, canvasY)
                                    }
                                    if (
                                        canvasX >= 0 &&
                                        canvasX < canvas.width &&
                                        canvasY >= 0 &&
                                        canvasY < canvas.height
                                    )
                                        doesFeatureOverlapTile = true
                                }
                                ctx.stroke()
                            }
                        }
                    } else if (f.geometry.type.toLowerCase() === 'point') {
                        let radiusInMeters = 0
                        let lnglat = {
                            lng: 0,
                            lat: 0,
                        }
                        if (typeof f.geometry.coordinates[0] === 'number') {
                            x = this.p.p.projection.lon2tileUnfloored(
                                f.geometry.coordinates[0],
                                xyz.z
                            )
                            y = this.p.p.projection.lat2tileUnfloored(
                                f.geometry.coordinates[1],
                                xyz.z
                            )
                            lnglat = {
                                lng: f.geometry.coordinates[0],
                                lat: f.geometry.coordinates[1],
                            }
                        } else {
                            x = this.p.p.projection.lon2tileUnfloored(
                                f.geometry.coordinates[0][0],
                                xyz.z
                            )
                            y = this.p.p.projection.lat2tileUnfloored(
                                f.geometry.coordinates[0][1],
                                xyz.z
                            )
                            lnglat = {
                                lng: f.geometry.coordinates[0][0],
                                lat: f.geometry.coordinates[0][1],
                            }
                        }

                        // Compute radius in meters
                        const lnglatRadiusAway = this.p.p.projection.tileXYZ2LatLng(
                            x + style.radius / canvas.width,
                            y,
                            this.p.p.zoom
                        )
                        f._radiusInMeters = this.p.p.projection.lngLatDistBetween(
                            lnglat.lng,
                            lnglat.lat,
                            lnglatRadiusAway.lng,
                            lnglatRadiusAway.lat
                        )

                        // @ts-ignore
                        const canvasX = parseInt((x - xyz.x) * canvas.width)
                        // @ts-ignore
                        const canvasY = parseInt((y - xyz.y) * canvas.height)

                        ctx.beginPath()
                        ctx.arc(
                            canvasX,
                            canvasY,
                            style.radius,
                            0,
                            2 * Math.PI,
                            false
                        )
                        ctx.fill()
                        ctx.stroke()
                        if (
                            canvasX >= 0 &&
                            canvasX < canvas.width &&
                            canvasY >= 0 &&
                            canvasY < canvas.height
                        )
                            doesFeatureOverlapTile = true
                    }

                    if (doesFeatureOverlapTile) {
                        f._highlighted = f._highlighted || false
                        overlappedFeatures.push(f)
                    }
                }
            }
        }

        return {
            canvas: canvas,
            features: overlappedFeatures,
        }
    }
}
