---
layout: page
title: Vector
permalink: /layers/vector
parent: Layers
---

# Vector

An unclamped vector.

### Annotations

Sprite-based textual annotations can be added using the following extended Point feature schema:

```json
{
    "type": "Feature",
    "geometry": {
        "type": "Point",
        "coordinates": [137.348048, -4.673226]
    },
    "properties": {
        "annotation": true,
        "name": "Sample Sprite Text",
        "style": {
            "color": "rgb(40, 20, 20)",
            "fillColor": "rgb(0, 255, 255)",
            "fillOpacity": 1,
            "weight": 2,
            "fontSize": "18px",
            "elevOffset": 100,
            "minZoom": 12,
            "maxZoom": 14
        }
    }
}
```

On sprite-based vectors, if elevations are not specified in the coordinates pair, the elevation will be automatically computed and given a small vertical offset. Setting the `elevOffset` style allows control (in meters) of what that offset is.

### Example

```javascript
Litho.addLayer('vector', {
    name: 'vectorLine',
    order: 1,
    on: true,
    // GeoJSON or path to geojson
    // [lng, lat, elev?]
    geojson: {
        type: 'FeatureCollection',
        features: [
            {
                type: 'Feature',
                properties: { SOL: 0, Site: 0, length: 25.99 },
                geometry: {
                    type: 'LineString',
                    coordinates: [
                        [137.3250006349, -4.72500217818315, -3000],
                        [137.42500036372522, -4.62500251269999],
                    ],
                },
            },
        ],
    },
    //swapLL: false //swap the default long lat order to lat long
    onClick: function (feature, lnglat, layer) {
        console.log(feature, lnglat, layer)
    },
    useKeyAsHoverName: 'length',
    style: {
        // Prefer feature[f].properties.style values
        letPropertiesStyleOverride: false, // default false
        default: {
            fillColor: 'white', //Use only rgb and hex. No css color names
            fillOpacity: 1,
            color: 'white', //Not relevant for lines because fillColor is the primary color
            weight: 6,
            radius: 'prop=radius',
        },
        point: {},
        line: {},
        lineType: 'thick', // 'thin' || '<any_else_for_default>/thick' //note: only thick lines can be raytraced
        polygon: {},
        byProp: {
            'prop=images.0.test:blue': {},
        },
    },
    opacity: 1,
    minZoom: 11,
    maxZoom: 18,
})
```
