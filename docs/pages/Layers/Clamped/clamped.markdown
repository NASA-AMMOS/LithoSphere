---
layout: page
title: Clamped
permalink: /layers/clamped
parent: Layers
---

# Clamped

Rasterized vector data clamped to the terrain textures.

Example

```javascript
Litho.addLayer(
    'clamped',
    {
        name: 'clampedWaypoints',
        order: 4,
        on: true,
        // GeoJSON or path to geojson
        geojsonPath:
            'https://miplmmgis.jpl.nasa.gov/Missions/MSL/Layers/Waypoints/MSL_waypoints_sol1489_m.json',
        style: {
            // Prefer feature[f].properties.style values
            letPropertiesStyleOverride: true, // default false
            default: {
                fillColor: 'white', //Use only rgb and hex. No css color names
                fillOpacity: 1,
                color: 'black',
                weight: 2,
                radius: 'prop=radius',
            },
            point: {},
            line: {},
            polygon: {},
            byProp: {
                'prop=images.0.test:blue': {},
            },
        },
        opacity: 1,
        minZoom: 11,
        maxZoom: 18,
        boundingBox: [
            137.3250006349,
            -4.72500217818315,
            137.42500036372522,
            -4.62500251269999,
        ],
        //preDrawn?: boolean //override all clamped tiles with pre drawn tiles
        //data?: { {z}: { {x}: { {y}: { pre_drawn_tile_canvas_data } }}} if preDrawn, use these tiles.
    },
    () => {
        //Litho.removeLayer('clampedWaypoints')
    }
)
```
