---
layout: page
title: Tile
permalink: /layers/tile
parent: Layers
---

# Tile

A tiled raster layer with height support.

Example

```javascript
Litho.addLayer('tile', {
    name: 'Aeolis',
    order: 1, //Orders are ordered only within the layer type
    on: true,
    path:
        'https://miplmmgis.jpl.nasa.gov/Missions/MSL/Layers/Gale_Aeolis_Palus/Gale_Aeolis_Palus/{z}/{x}/{y}.png',
    demPath:
        'https://miplmmgis.jpl.nasa.gov/Missions/MSL/Layers/MSL_CTX_DEM_mosaic_20m/{z}/{x}/{y}.png',
    // TODO: Implement format
    format: 'tms', // 'wmts' || 'wms'
    demFormat: 'tms', //
    opacity: 1,
    minZoom: 10,
    maxZoom: 17,
    boundingBox: [
        137.09995782300004,
        -5.10494553812677,
        137.69994902819656,
        -4.12495782349,
    ],
})
```
