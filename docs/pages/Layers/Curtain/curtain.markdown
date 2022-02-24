---
layout: page
title: Curtain
permalink: /layers/curtain
parent: Layers
---

# Curtain

The Curtains layer type renders 2D vertical imagery draped from a GeoJSON LineGeometry.

## Options

|    Parameter     |       Type        |           Default            |                                                           Description                                                           |
| :--------------: | :---------------: | :--------------------------: | :-----------------------------------------------------------------------------------------------------------------------------: |
|     **name**     |     _string_      |          _Required_          |                                               Layer's name and unique identifier                                                |
|      **on**      |     _boolean_     |          _Required_          |                                                    Initial visibility state                                                     |
|   **opacity**    |     _number_      |          _Required_          |                                         Initial opaqueness [0(transparent), 1(opaque)]                                          |
|  **imagePath**   |     _string_      |             null             |                                           A URL to the image to display as a curtain                                            |
|  **imageColor**  | _string/string[]_ |          '#FFFFFF'           |       If no `imagePath`, the solid color to use as a curtain (or an array of colors to form a vertical gradient) instead        |
|    **depth**     |     _number_      |             100              |                                             Depth (height) in meters of the curtain                                             |
|   **options**    |     _object_      | See options in example below |                                         Layer specific and dynamically settable options                                         |
| **lineGeometry** | _geojsonFeature_  |         _Required\*_         |           A LineString geometry that serves as the path for the top of the curtain. Uses 3D coordinates for elevation           |
|   **geojson**    |     _geojson_     |         _Required\*_         | A geojson with a Polygon, LineString, or MultiLineString features. Use this if you want to group curtains together as one layer |
| **onMouseMove**  |    _Function_     |             null             |                                                    MouseMove event callback                                                     |

### Example

```javascript
Litho.addLayer(
    'curtain',
    {
        name: 'Radargram',
        on: true,
        opacity: 0.7,
        imagePath:
            '../sample_data/Missions/Test/Data/radargrams/radargram_test.jpg',
        //imageColor: ['cyan', 'rgba(0,0,0,0)', '#FF0000'], //Alternatively provide a solid color (or an array for a vertical gradient)
        // depth of image in meters
        depth: 14,
        // length of image in meters (Deprecated)
        length: 62.35,
        options: {
            // optional
            verticalExaggeration: 1, // default 1, (ex. 2 doubles the height)
            verticalOffset: 0, // default 0, (ex. 1 raises the curtain up by one full height)
        },
        // GeoJSON feature geometry that corresponds to the top of the curtain/image
        lineGeometry: {
            type: 'LineString',
            coordinates: [
                [137.368229, -4.6659, -4453],
                [137.369829, -4.665, -4444],
                [137.36869, -4.66636, -4444],
                [137.36959, -4.6666, -4437],
            ],
        },
        onMouseMove: function (
            e,
            layer,
            mesh,
            intersection,
            intersectedLngLat,
            intersectionXYZ
        ) {
            // intersection.uv gives mouse's texture coords
            // console.log(intersection.uv)
        },
    },
    () => {
        /*
        console.log('Curtain loaded')
        let exag = 1
        setInterval(() => {
            exag += 0.01
            Litho.setLayerSpecificOptions('Radargram', {
                verticalExaggeration: exag,
                //verticalOffset: exag,
            })
        }, 100)
        */
    }
)
```
