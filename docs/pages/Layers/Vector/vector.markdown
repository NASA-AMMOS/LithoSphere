---
layout: page
title: Vector
permalink: /layers/vector
parent: Layers
---

# Vector

An unclamped vector.

Example

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
