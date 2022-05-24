---
layout: page
title: Clamped
permalink: /layers/clamped
parent: Layers
---

# Clamped

Rasterized vector data clamped to the terrain textures.

### Annotations

Clamped textual annotations can be added using the following extended Point feature schema:

```json
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [137.358048, -4.673226]
    },
    "properties": {
        "annotation": true,
        "name": "Sample Text",
        "style": {
            "color": "rgb(0, 0, 0)",
            "fillColor": "rgb(255, 255, 255)",
            "fillOpacity": 1,
            "weight": 2,
            "fontSize": "54px",
            "rotation": 0,
            "minZoom": 15,
            "maxZoom": 16
        }
    }
}
```

## Example

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
                minZoom: 11,
                maxZoom: 18,
            },
            point: {},
            line: {},
            polygon: {
                canBecomeHighlighted: false, //default true
                canBecomeActive: false, //default true
            },
            byProp: {
                'prop=images.0.test:blue': {},
            },
            bearing: {
                angleProp: 'yaw_rad', // path.to.bearing.prop
                angleUnit: 'rad', //rad | deg
                color: 'cyan', //css color
            },
        },
        opacity: 1,
        boundingBox: [
            137.3250006349,
            -4.72500217818315,
            137.42500036372522,
            -4.62500251269999,
        ],
        canBecomeHighlighted: true, //default true
        canBecomeActive: true, //default true
        //preDrawn?: boolean //override all clamped tiles with pre drawn tiles
        //data?: { {z}: { {x}: { {y}: { pre_drawn_tile_canvas_data } }}} if preDrawn, use these tiles.
    },
    () => {
        //Litho.removeLayer('clampedWaypoints')
    }
)
```
