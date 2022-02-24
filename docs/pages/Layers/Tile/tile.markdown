---
layout: page
title: Tile
permalink: /layers/tile
parent: Layers
---

# Tile

A tiled raster layer with height support.

## Options

|      Parameter       |     Type      |  Default   |                                               Description                                                |
| :------------------: | :-----------: | :--------: | :------------------------------------------------------------------------------------------------------: |
|       **name**       |   _string_    | _Required_ |                                    Layer's name and unique identifier                                    |
|      **order**       |   _number_    | _Required_ |                                          Layer draw order state                                          |
|        **on**        |   _boolean_   | _Required_ |                                            Initial visibility                                            |
|       **path**       |   _string_    | _Required_ |                                   A URL to the raster tileset curtain                                    |
|     **demPath**      |   _string_    |    null    |                            A URL to the DEM (Digital Elevation Model) tileset                            |
|      **format**      | _string-enum_ |   'tms'    |                               Raster tileset format ('tms', 'wmts', 'wms )                               |
|    **demFormat**     |   _string_    |   'tms'    |                                DEM tileset format ('tms', 'wmts', 'wms )                                 |
| **demFormatOptions** |   _object_    |    null    |                                            See example below                                             |
|     **opacity**      |   _number_    | _Required_ |                              Initial opaqueness [0(transparent), 1(opaque)]                              |
|     **minZoom**      |   _integer_   | _Required_ |                      The minimum (smallest number) zoom level of the raster tileset                      |
|     **maxZoom**      |   _integer_   | _Required_ |                      The maximum (biggest number) zoom level of the raster tileset                       |
|     **filters**      |   _object_    |    null    |                                Filter and blend mode effect for the layer                                |
|   **boundingBox**    |  _number[4]_  |    null    | The bounds of the tileset. Only queries for tiles that intersect this box. [lng, lat, lng, lat] (SW, NE) |

### Example

```javascript
Litho.addLayer('tile', {
    name: 'Aeolis',
    order: 1, // Orders are ordered only within the layer type
    on: true,
    path:
        'https://miplmmgis.jpl.nasa.gov/Missions/MSL/Layers/Gale_Aeolis_Palus/Gale_Aeolis_Palus/{z}/{x}/{y}.png',
    demPath:
        'https://miplmmgis.jpl.nasa.gov/Missions/MSL/Layers/MSL_CTX_DEM_mosaic_20m/{z}/{x}/{y}.png',
    // TODO: Implement format
    format: 'tms', // 'wmts' || 'wms'
    demFormat: 'tms', //
    demFormatOptions: {
        // For wms dem formats it'll query tiles with a 1px buffer and interpolate values so that tile boundaries line up perfectly
        correctSeams: true,
        // GET Parameters to add to the wms query (they can also just be added straight to the demPath string)
        wmsParams: {},
    },
    opacity: 1,
    minZoom: 10,
    maxZoom: 17,
    filters: {
        brightness: 1,
        contrast: 1,
        saturation: 1,
        blendCode: 0, //0 = none, 1 = overlay - caveat - tile zooms for all layers should line up,
    },
    boundingBox: [
        //lng, lat, lng, lat, southwest corner, northeast
        137.09995782300004,
        -5.10494553812677,
        137.69994902819656,
        -4.12495782349,
    ],
})
```
