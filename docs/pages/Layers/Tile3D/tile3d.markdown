---
layout: page
title: Tile3D
permalink: /layers/tile3d
parent: Layers
---

# Tile3D

3D tiles via [3DTilesRendererJS](https://github.com/NASA-AMMOS/3DTilesRendererJS).

Example

```javascript
Litho.addLayer('tile3d', {
    name: '3dTileExample',
    order: 3,
    on: true,
    path:
        'https://raw.githubusercontent.com/NASA-AMMOS/3DTilesSampleData/master/msl-dingo-gap/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize/0528_0260184_to_s64o256_colorize_tileset.json', // path to tileset.json
    opacity: 0.6,
    minZoom: 11,
    maxZoom: 18,
    position: {
        longitude: 137.4091927368641, // default 0
        latitude: -4.626571631163808, // default 0
        elevation: -4470, // default 0
    },
    scale: 2, // default 1
    rotation: {
        x: 0, // in radians | default 0
        y: -Math.PI / 2, // default 0
        z: Math.PI / 4, // default 0
        order: 'ZXY', //default 'XYZ'
    },
})
```
