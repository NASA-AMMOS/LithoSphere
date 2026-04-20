/**
 * Coordinate properties utilities for Enhanced GeoJSON support.
 * Ported from MMGIS's ExtendedGeoJSON.js and Formulae_.js
 */

import Utils from './index'

/**
 * Traverses nested coordinate arrays, calling onEachLeaf for each coordinate.
 * Works with LineString, MultiLineString, Polygon, etc.
 * _path tracks the index path (e.g., "0.3" means feature index 0, coordinate index 3).
 */
export function coordinateDepthTraversal(
    array: any[],
    onEachLeaf: (array: any[], _path: string) => any[] | void,
    _path?: string
): void {
    _path = _path || '0'
    for (let i = 0; i < array.length; i++) {
        if (typeof array[i] !== 'string' && array[i].length != null) {
            coordinateDepthTraversal(
                array[i],
                onEachLeaf,
                `${_path}.${i}`
            )
        } else if (
            typeof array[i] === 'string' ||
            typeof array[i] === 'number'
        ) {
            const next = onEachLeaf(array, _path)
            if (next)
                for (let n = 0; n < array.length; n++) {
                    if (next[n] != null) array[n] = next[n]
                }
            return
        }
    }
}

/**
 * Zips coord_properties keys with coordinate values.
 * e.g. keys=[null, null, "elevation", "speed"], values=[-122.4, 37.8, 50.0, 0.5]
 * => { elevation: 50.0, speed: 0.5 }
 */
export function stitchArrays(
    keyArray: (string | null)[],
    valueArray: any[]
): Record<string, any> {
    keyArray = keyArray || []
    valueArray = valueArray || []

    const stitched: Record<string, any> = {}
    keyArray.forEach((k, idx) => {
        if (k != null)
            stitched[k] = valueArray[idx] != null ? valueArray[idx] : null
    })
    return stitched
}

/**
 * Resolves per-coordinate properties from coord_properties format.
 * Merges feature properties with stitched coordinate values.
 */
export function getCoordProperties(
    geojson: any,
    feature: any,
    coordArray: any[]
): Record<string, any> {
    const globalCoordProps = geojson.coord_properties || null
    const coordProps = Utils.getIn(
        feature,
        'properties.coord_properties',
        globalCoordProps
    )

    if (coordProps) {
        const props = JSON.parse(JSON.stringify(feature.properties))
        delete props.coord_properties

        return {
            ...props,
            ...stitchArrays(coordProps, coordArray),
        }
    } else {
        return feature.properties
    }
}
