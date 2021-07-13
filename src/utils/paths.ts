// Constructs tile URLs

import Utils from './'

const Paths = {
    buildPath: function (
        format: string,
        basePath: string,
        tD: any,
        projection: any,
        tileResolution: number,
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
            wmsVersion: null,
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
            options: any
        ): string {
            const wmsParams = { ...Paths.wmsExtension.defaultWmsParams }

            if (options)
                for (const i in options) {
                    if (!(i in Paths.wmsExtension.extensionOptions)) {
                        wmsParams[i] = options[i]
                    }
                }

            wmsParams.VERSION = options.wmsVersion || wmsParams.VERSION

            wmsParams.WIDTH = wmsParams.HEIGHT = tileResolution

            const crsCode =
                projection.tileMapResource.crsCode ||
                Paths.wmsExtension.extensionOptions.crsCode
            wmsParams[
                parseFloat(wmsParams.wmsVersion) >= 1.3 ? 'CRS' : 'SRS'
            ] = crsCode

            const bounds = projection.tileXYZ2NwSe(xyz, tileResolution, true)

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
