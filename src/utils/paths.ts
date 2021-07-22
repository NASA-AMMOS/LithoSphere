// Constructs tile URLs

import Utils from './'

const Paths = {
    buildPath: function (
        format: string,
        basePath: string,
        tD: any,
        projection: any,
        tileResolution: number,
        trueTileResolution: number,
        options?: any,
        asObject?: boolean
    ): any {
        format = format || 'tms'

        let path
        const xyz = { x: tD.x, y: tD.y, z: tD.z }

        switch (format) {
            case 'wmts':
                path = basePath
                path = path.replace('{z}', xyz.z)
                path = path.replace('{x}', xyz.x)
                path = path.replace('{y}', xyz.y)
                break
            case 'wms':
                path = Paths.wmsExtension.buildPath(
                    basePath,
                    xyz,
                    projection,
                    tileResolution,
                    trueTileResolution,
                    options
                )
                break
            default:
                // 'tms'
                path = basePath
                path = path.replace('{z}', xyz.z)
                path = path.replace('{x}', xyz.x)
                xyz.y = projection.invertY(xyz.y, xyz.z)
                path = path.replace('{y}', xyz.y)
        }

        if (asObject)
            return {
                path: path,
                xyz: xyz,
            }
        return path
    },
    wmsExtension: {
        // If any custom options not documented here are used, they will be sent to the
        // WMS server as extra parameters in each request URL. This can be useful for
        // [non-standard vendor WMS parameters](http://docs.geoserver.org/stable/en/user/services/wms/vendor.html).
        defaultWmsParams: {
            SERVICE: 'WMS',
            REQUEST: 'GetMap',

            // @option layers: String = ''
            // **(required)** Comma-separated list of WMS layers to show.
            //LAYERS: '',

            // @option styles: String = ''
            // Comma-separated list of WMS styles.
            //STYLES: '',

            // @option format: String = 'image/jpeg'
            // WMS image format (use `'image/png'` for layers with transparency).
            FORMAT: 'image/png',

            // @option transparent: Boolean = false
            // If `true`, the WMS service will return images with transparency.
            TRANSPARENT: true,

            // @option version: String = '1.1.1'
            // Version of the WMS service to use
            VERSION: '1.1.1',
            //SRS: 'helloworld',

            WIDTH: null,
            HEIGHT: null,
        },
        extensionOptions: {
            // @option crs: CRS = EPSG:4326
            // Coordinate Reference System to use for the WMS requests).
            crsCode: 'EPSG:4326',

            // @option uppercase: Boolean = false
            // If `true`, WMS request parameter keys will be uppercase.
            uppercase: true,
        },
        buildPath: function (
            basePath: string,
            xyz: any,
            projection: any,
            tileResolution: number,
            trueTileResolution: number,
            options: any
        ): string {
            const wmsParams = { ...Paths.wmsExtension.defaultWmsParams }

            if (options && options.wmsParams)
                for (const i in options.wmsParams) {
                    if (!(i in Paths.wmsExtension.extensionOptions)) {
                        wmsParams[i] = options.wmsParams[i]
                    }
                }

            wmsParams.VERSION = options.wmsVersion || wmsParams.VERSION

            if (options.correctSeams === true) {
                // Since we buffer 1px out on each each we're going to assume the tileRes is smaller
                // if tileResolution is 32x31, it goes down to 31x31, buffered out all
                // directions and queried as 33x33, then interpolated on with a simple 2x2 kernel to 32x32
                tileResolution--
                wmsParams.WIDTH = wmsParams.HEIGHT = tileResolution + 2
            } else wmsParams.WIDTH = wmsParams.HEIGHT = tileResolution

            const crsCode =
                projection.tileMapResource.crsCode ||
                Paths.wmsExtension.extensionOptions.crsCode
            wmsParams[
                parseFloat(wmsParams.VERSION) >= 1.3 ? 'CRS' : 'SRS'
            ] = crsCode

            const bounds = projection.tileXYZ2NwSe(
                xyz,
                trueTileResolution,
                true,
                options.correctSeams === true
                    ? (tileResolution + 1) / tileResolution
                    : null
            )

            const bbox = (parseFloat(wmsParams.VERSION) >= 1.3 &&
            crsCode === 'EPSG:4326'
                ? [bounds.min.y, bounds.min.x, bounds.max.y, bounds.max.x]
                : [bounds.min.x, bounds.min.y, bounds.max.x, bounds.max.y]
            ).join(',')

            return (
                basePath +
                Utils.getParamString(
                    wmsParams,
                    basePath,
                    Paths.wmsExtension.extensionOptions.uppercase
                ) +
                (Paths.wmsExtension.extensionOptions.uppercase
                    ? '&BBOX='
                    : '&bbox=') +
                bbox
            )
        },
    },
}

export default Paths
