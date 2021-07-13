// A lot of functions in here are adapted from Leaflet and/or proj4Leaflet
import Utils from '../utils'
import proj4 from 'proj4'

export default class CRS {
    options: any
    transformation: any
    projection: any
    _scales: number[]
    R: number

    constructor(code: string, proj: string, options: any, radius: number) {
        this.options = options || {}
        this.options.bounds = options.bounds || []
        this.options.transformation = new Transformation(1, 0, -1, 0)
        if (this.options.origin) {
            this.transformation = new Transformation(
                1,
                -this.options.origin[0],
                -1,
                this.options.origin[1]
            )
        }

        this.projection = new CRSProjection(
            code,
            proj,
            bounds(options.bounds[0], options.bounds[1])
        )
        this.R = radius

        if (this.options.scales) {
            this._scales = this.options.scales
        } else if (this.options.resolutions) {
            this._scales = []
            for (let i = this.options.resolutions.length - 1; i >= 0; i--) {
                if (this.options.resolutions[i]) {
                    this._scales[i] = 1 / this.options.resolutions[i]
                }
            }
        }
    }

    project(latlng) {
        return this.projection.project(latlng)
    }

    unproject(point, zoom) {
        return this.projection.unproject(point)
    }

    pointToLatLng(point, zoom) {
        const scale = this.scale(zoom)
        const untransformedPoint = this.transformation.untransform(point, scale)
        return this.projection.unproject(untransformedPoint)
    }

    scale(zoom: number): number {
        const iZoom = Math.floor(zoom)
        let baseScale
        let nextScale
        let scaleDiff
        let zDiff

        if (zoom === iZoom) {
            return this._scales[zoom]
        } else {
            // Non-integer zoom, interpolate
            baseScale = this._scales[iZoom]
            nextScale = this._scales[iZoom + 1]
            scaleDiff = nextScale - baseScale
            zDiff = zoom - iZoom
            return baseScale + scaleDiff * zDiff
        }
    }
}

class CRSProjection {
    _proj: any
    bounds: number[]

    constructor(code, def, bounds) {
        const isP4 = _isProj4Obj(code)
        this._proj = isP4 ? code : this._projFromCodeDef(code, def)
        this.bounds = isP4 ? def : bounds
    }
    project(latlng) {
        const point = this._proj.forward([latlng.lng, latlng.lat])
        return { x: point[0], y: point[1] }
    }

    unproject(point) {
        const point2 = this._proj.inverse([point.x, point.y])
        return { lat: point2[1], lng: point2[0] }
    }

    _projFromCodeDef(code, def) {
        if (def) {
            proj4.defs(code, def)
        } else if (proj4.defs[code] === undefined) {
            const urn = code.split(':')
            if (urn.length > 3) {
                code = urn[urn.length - 3] + ':' + urn[urn.length - 1]
            }
            if (proj4.defs[code] === undefined) {
                throw 'No projection definition for code ' + code
            }
        }
        // @ts-ignore
        return proj4(code)
    }
}

class Transformation {
    _a: number
    _b: number
    _c: number
    _d: number

    constructor(a, b, c, d) {
        if (Utils.isArray(a)) {
            // use array properties
            this._a = a[0]
            this._b = a[1]
            this._c = a[2]
            this._d = a[3]
            return
        }
        this._a = a
        this._b = b
        this._c = c
        this._d = d
    }

    transform(point, scale) {
        return this._transform({ x: point.x, y: point.y }, scale)
    }

    _transform(point, scale) {
        scale = scale != null ? scale : 1
        point.x = scale * (this._a * point.x + this._b)
        point.y = scale * (this._c * point.y + this._d)
        return point
    }

    untransform(point, scale) {
        scale = scale != null ? scale : 1

        return {
            x: (point.x / scale - this._b) / this._a,
            y: (point.y / scale - this._d) / this._c,
        }
    }
}

function _isProj4Obj(a) {
    return typeof a.inverse !== 'undefined' && typeof a.forward !== 'undefined'
}

function bounds(a, b) {
    return {
        min: { x: a[0], y: a[1] },
        max: { x: b[0], y: b[1] },
    }
}
