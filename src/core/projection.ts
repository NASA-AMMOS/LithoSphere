import { TileMapResource, LatLng, LatLngH, XY, XYZ } from '../generalTypes'
import CRS from './CRS'

interface Private {
    tmp: null
}

interface Radii {
    major: number
    minor: number
}
enum RadiusE {
    Major = 'major',
    Minor = 'minor',
}

export default class Projection {
    _: Private
    baseRadius: number
    radiusScale: number
    radii: Radii
    tileMapResource: TileMapResource
    crs: any
    trueTileResolution: number
    res: any
    e: number
    ep: number // eprime
    flatteningFactor: number //perfect sphere

    constructor(
        majorRadius?: number,
        minorRadius?: number,
        tileMapResource?: TileMapResource,
        trueTileResolution?: number
    ) {
        this._reset()

        this.setRadius(majorRadius, RadiusE.Major)
        this.setRadius(minorRadius, RadiusE.Minor)
        this.tileMapResource = tileMapResource || {
            bounds: null,
            origin: null,
            crsCode: null,
            epsg: null,
            proj: null,
            resunitsperpixel: null,
            reszoomlevel: null,
        }
        this.tileMapResource.crsCode =
            this.tileMapResource.crsCode || 'EPSG:4326'

        this.trueTileResolution = trueTileResolution || 256

        // Populate Resolutions
        if (
            this.tileMapResource.resunitsperpixel != null &&
            this.tileMapResource.reszoomlevel != null
        ) {
            const baseRes =
                this.tileMapResource.resunitsperpixel *
                Math.pow(2, this.tileMapResource.reszoomlevel)
            const res = []
            for (let i = 0; i < 32; i++) {
                res.push(baseRes / Math.pow(2, i))
            }
            this.res = res
        }

        const tmr = this.tileMapResource
        this.crs = new CRS(
            Number.isFinite(parseInt(tmr.crsCode[0]))
                ? `EPSG:${tmr.epsg}`
                : tmr.crsCode,
            tmr.proj,
            tmr.origin != null
                ? {
                      origin: [
                          // @ts-ignore
                          parseFloat(tmr.origin[0]),
                          // @ts-ignore
                          parseFloat(tmr.origin[1]),
                      ],
                      resolutions: this.res,
                      bounds: [
                          [
                              // @ts-ignore
                              parseFloat(tmr.bounds[0]),
                              // @ts-ignore
                              parseFloat(tmr.bounds[1]),
                          ],
                          [
                              // @ts-ignore
                              parseFloat(tmr.bounds[2]),
                              // @ts-ignore
                              parseFloat(tmr.bounds[3]),
                          ],
                      ],
                  }
                : {
                      origin: [0, 0],
                      resolutions: this.res,
                      bounds: [0, 0, 0, 0],
                  },
            // @ts-ignore
            parseFloat(this.radii.major)
        )
    }

    _reset(): void {
        this.baseRadius = 6371000
        this.radiusScale = 1

        this.radii = {
            major: this.baseRadius,
            minor: this.baseRadius,
        }
        this.tileMapResource = {
            bounds: null,
            origin: null,
            crsCode: 'EPSG:4326',
            proj: null,
            resunitsperpixel: null,
            reszoomlevel: null,
        }
        this.e = 0
        this.ep = 0
        this.flatteningFactor = 0
    }

    setRadius = (radius: number, which: RadiusE = RadiusE.Major): void => {
        if (which.toLowerCase() == 'major')
            this.radii.major = radius || this.baseRadius
        else if (which.toLowerCase() == 'minor')
            this.radii.minor = radius || this.radii.major || this.baseRadius
    }

    invertY = (y: number, z: number): number => {
        const b = this.crs.projection.bounds
        if (this.tileMapResource.crsCode === 'EPSG:4326') {
            // Map uses default projection
            return Math.pow(2, z) - 1 - y
        }
        const s = this.crs.scale(z)
        const max = this.crs.transformation.transform(b.min, s)
        const yMax = Math.ceil(max.y / 256) - 1
        return yMax - y
    }

    toBounds = (a: XY, b: XY) => {
        const bounds = {
            min: { x: null, y: null },
            max: { x: null, y: null },
        }

        bounds.min.x = Math.min(a.x, b.x)
        bounds.max.x = Math.max(a.x, b.x)
        bounds.min.y = Math.min(a.y, b.y)
        bounds.max.y = Math.max(a.y, b.y)

        return bounds
    }

    // stretchSe is useful if we need to query a slightly bigger tile for seam corrections
    tileXYZ2NwSe = (
        xyz: XYZ,
        tileResolution: number,
        asBounds?: boolean,
        stretchFactor?: number
    ): any => {
        if (this.tileMapResource.proj == null) return null

        stretchFactor = Math.max(stretchFactor || 1, 1)

        const stretchAmount = (stretchFactor - 1) * tileResolution

        const nwPoint = {
            x: xyz.x * tileResolution - stretchAmount,
            y: xyz.y * tileResolution - stretchAmount,
        }
        const sePoint = {
            x: nwPoint.x + tileResolution + stretchAmount * 2,
            y: nwPoint.y + tileResolution + stretchAmount * 2,
        }
        const nw = this.crs.pointToLatLng(nwPoint, xyz.z)
        const se = this.crs.pointToLatLng(sePoint, xyz.z)

        if (asBounds)
            return this.toBounds(this.crs.project(nw), this.crs.project(se))

        return {
            nw,
            se,
        }
    }

    tileXYZ2LatLng = (
        x: number,
        y: number,
        z: number,
        flatXYZ?: XYZ
    ): LatLng => {
        if (this.tileMapResource.proj == null) {
            const lng = (x / Math.pow(2, z)) * 360 - 180
            const n = Math.PI - (2 * Math.PI * y) / Math.pow(2, z)
            const lat =
                (180 / Math.PI) * Math.atan(0.5 * (Math.exp(n) - Math.exp(-n)))
            return { lat: lat, lng: lng }
        } else {
            y = -y

            const easting =
                this.trueTileResolution * x * this.res[z] +
                this.tileMapResource.origin[0]
            const northing =
                this.trueTileResolution * y * this.res[z] +
                this.tileMapResource.origin[1]

            return this.crs.unproject({ x: easting, y: northing })
        }
    }

    latLngZ2TileXYZ = (
        lat: number,
        lng: number,
        z: number,
        dontFloor?: boolean
    ): XYZ => {
        if (this.tileMapResource.proj == null) {
            let x = ((lng + 180) / 360) * Math.pow(2, z)
            let y =
                ((1 -
                    Math.log(
                        Math.tan(lat * (Math.PI / 180)) +
                            1 / Math.cos(lat * (Math.PI / 180))
                    ) /
                        Math.PI) /
                    2) *
                Math.pow(2, z)
            if (dontFloor == null) {
                x = Math.floor(x)
                y = Math.floor(y)
            }

            return { x: x, y: y, z: z }
        } else {
            const p = this.crs.project({ lng: lng, lat: lat })

            const easting = p.x
            const northing = p.y

            const x =
                (easting - this.tileMapResource.origin[0]) /
                (this.trueTileResolution * this.res[z])
            let y =
                (northing - this.tileMapResource.origin[1]) /
                (this.trueTileResolution * this.res[z])

            y = -y

            return { x: x, y: y, z: z }
        }
    }

    vector3ToLatLng = (xyz: XYZ): LatLngH => {
        const y = xyz.y
        const z = xyz.z
        xyz.y = -z
        xyz.z = -y

        const rs = this.radii.major / this.radiusScale
        const rs2 = this.radii.minor / this.radiusScale
        const r = Math.sqrt(Math.pow(xyz.x, 2) + Math.pow(xyz.y, 2))
        const E2 = Math.pow(rs, 2) - Math.pow(rs2, 2)
        const F = 54 * Math.pow(rs, 2) * Math.pow(xyz.z, 2)
        const G =
            Math.pow(r, 2) +
            (1 - Math.pow(this.e, 2)) * Math.pow(xyz.z, 2) -
            Math.pow(this.e, 2) * E2
        const C = (Math.pow(this.e, 4) * F * Math.pow(r, 2)) / Math.pow(G, 3)
        const S = Math.cbrt(1 + C + Math.sqrt(Math.pow(C, 2) + 2 * C))
        const P = F / (3 * Math.pow(S + 1 / S + 1, 2) * Math.pow(G, 2))
        const Q = Math.sqrt(1 + 2 * Math.pow(this.e, 4) * P)
        const r0 =
            -(P * Math.pow(this.e, 2) * r) / (1 + Q) +
            Math.sqrt(
                0.5 * Math.pow(rs, 2) * (1 + 1 / Q) -
                    (P * (1 - Math.pow(this.e, 2)) * Math.pow(xyz.z, 2)) /
                        (Q * (1 + Q)) -
                    0.5 * P * Math.pow(r, 2)
            )
        const U = Math.sqrt(r - Math.pow(this.e, 2) * r0 + Math.pow(xyz.z, 2))
        const V = Math.sqrt(
            Math.pow(r - Math.pow(this.e, 2) * r0, 2) +
                (1 - Math.pow(this.e, 2)) * Math.pow(xyz.z, 2)
        )
        const Z0 = (Math.pow(rs2, 2) * xyz.z) / (rs * V)
        const h = U * (1 - Math.pow(rs2, 2) / (rs * V))
        const phi =
            Math.atan((xyz.z + Math.pow(this.ep, 2) * Z0) / r) * (180 / Math.PI)
        let lambda = -(Math.atan2(xyz.y, xyz.x) * (180 / Math.PI)) - 90
        if (lambda < -180) lambda += 360

        return { lat: phi, lng: lambda, height: h }
    }

    lonLatToVector3 = (lon: number, lat: number, height: number): XYZ => {
        const phi = lat * (Math.PI / 180)
        const theta = (lon - 180) * (Math.PI / 180)

        const x =
            ((this.radii.major + height) / this.radiusScale) *
            Math.cos(phi) *
            Math.sin(theta)
        const y =
            (-(this.radii.major + height) / this.radiusScale) * Math.sin(phi)
        const z =
            (-(this.radii.major + height) / this.radiusScale) *
            Math.cos(phi) *
            Math.cos(theta)

        return { x: x, y: y, z: z }
    }

    // Rotates X then Z then Y ?
    // angle is in radians
    // if center undefined, then 0 0 0
    rotatePoint3D = (pt: XYZ, angle: XYZ, center?: XYZ): XYZ => {
        if (center == undefined) center = { x: 0, y: 0, z: 0 }
        //Offset
        const dx = pt.x - center.x
        const dy = pt.y - center.y
        const dz = pt.z - center.z

        const sx = Math.sin(angle.x)
        const cx = Math.cos(angle.x)
        const sy = Math.sin(angle.y)
        const cy = Math.cos(angle.y)
        const sz = Math.sin(angle.z)
        const cz = Math.cos(angle.z)

        const x = center.x + dx * (cy * cz) + dy * (-cy * sz) + dz * sy
        const y =
            center.y +
            dx * (cx * sz + sx * sy * cz) +
            dy * (cx * cz - sx * sy * sz) +
            dz * (-sx * cy)
        const z =
            center.z +
            dx * (sx * sz - cx * sy * cz) +
            dy * (sx * cz + cx * sy * sz) +
            dz * (cx * cy)

        return { x: x, y: y, z: z }
    }

    //Uses haversine to calculate distances over arcs
    lngLatDistBetween = (
        lon1: number,
        lat1: number,
        lon2: number,
        lat2: number
    ): number => {
        const R = this.radii.major / this.radiusScale
        const φ1 = lat1 * (Math.PI / 180)
        const φ2 = lat2 * (Math.PI / 180)
        const Δφ = (lat2 - lat1) * (Math.PI / 180)
        const Δλ = (lon2 - lon1) * (Math.PI / 180)

        const a =
            Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
            Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))

        return R * c
    }
}
