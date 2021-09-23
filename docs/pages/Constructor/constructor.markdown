---
layout: page
title: Constructor
permalink: /constructor
nav_order: 3
---

# Constructor

It all starts with

```javascript
new LithoSphere(containerId, options)
```

#### Contents

-   [Arguments]({{ site.baseurl }}/constructor#arguments)
-   [Options]({{ site.baseurl }}/constructor#options)
-   [A Full Example]({{ site.baseurl }}/constructor#a-full-example)

## Arguments

|    Parameter    |   Type   | Required |       Default       |                     Description                      |
| :-------------: | :------: | :------: | :-----------------: | :--------------------------------------------------: |
| **containerId** | _string_ |   true   |         N/A         | The id of the HTML element LithoSphere will draw in. |
|   **options**   | _object_ |  false   | See 'options' below |       Top level configurations for LithoSphere       |

## Options

|        Parameter         |    Type    |                                      Default                                       |                                   Description                                    |
| :----------------------: | :--------: | :--------------------------------------------------------------------------------: | :------------------------------------------------------------------------------: |
|     **initialView**      |  _object_  |     See [initialView]({{ site.baseurl }}/constructor#optionsinitialview) below     |                  Sets the initial coordinate view of the scene                   |
|     **majorRadius**      | _integer_  |                                      6371000                                       |                         Major planetary radius in meters                         |
|     **minorRadius**      | _integer_  |                                    majorRadius                                     |                         Minor planetary radius in meters                         |
|    **loadingScreen**     | _boolean_  |                                        true                                        |    If true, shows a loading screen until all lithosphere content first loads     |
|    **customParsers**     |  _object_  |                     See [Parsers]({{ site.baseurl }}/parsers)                      |                 Allows the use of custom elevation tile parsers                  |
|     **demFallback**      |  _object_  |     See [demFallback]({{ site.baseurl }}/constructor#optionsdemfallback) below     |                  A DEM to fallback to if any layer's DEM fails                   |
|   **tileMapResource**    |  _object_  | See [tileMapResource]({{ site.baseurl }}/constructor#optionstilemapresource) below |                              Configures projections                              |
|    **radiusOfTiles**     | _integer_  |                                         4                                          |         How many tiles outward from the center to use for the base tiles         |
|    **wireframeMode**     | _boolean_  |                                       false                                        |            If true, all tiles are rendered with a wireframe material             |
|     **exaggeration**     |  _number_  |                                         1                                          |                     A multiplier to scale terrain heights by                     |
|       **showAxes**       | _boolean_  |                                       false                                        |                          If true, XYZ axes are rendered                          |
|        **useLOD**        | _boolean_  |                                        true                                        |       If true, Level of Detail (LOD) tiles are rendered in the background        |
|         **LOD**          | _object[]_ |             See [LOD]({{ site.baseurl }}/constructor#optionslod) below             |                      Fine tune Level of Detail (LOD) layers                      |
|    **tileResolution**    |  _number_  |                                         32                                         |                           Square tile pixel dimension                            |
|  **renderOnlyWhenOpen**  | _boolean_  |                                        true                                        | Only update and render the scene if the containerId element has an non-zero area |
|      **starsphere**      |  _object_  |      See [starsphere]({{ site.baseurl }}/constructor#optionsstarsphere) below      |                         Setup a skydome/skybox/skysphere                         |
|      **atmosphere**      |  _object_  |      See [atmosphere]({{ site.baseurl }}/constructor#optionsatmosphere) below      |                       Setup an atmosphere for your planet                        |
| **canBecomeHighlighted** | _boolean_  |                                        true                                        |                          Globally disable highlighting                           |
|    **highlightColor**    |  _string_  |                                      'yellow'                                      |               What color should highlight things be? (If hovered)                |
|   **canBecomeActive**    | _boolean_  |                                        true                                        |                    Globally disable coloring active features                     |
|     **activeColor**      |  _string_  |                                       'red'                                        |                 What color should active things be? (If clicked)                 |

### options.initialView

The latitude, longitude, and zoom LithoSphere first starts at.

|      Parameter       |   Type   | Default |               Description               |
| :------------------: | :------: | :-----: | :-------------------------------------: |
| **initialView.lng**  | _number_ |    0    | Sets the initial longitude of the scene |
| **initialView.lat**  | _number_ |    0    | Sets the initial latitude of the scene  |
| **initialView.zoom** | _number_ |    0    |   Sets the initial zoom of the scene    |

#### Example

```javascript
{
    initialView: {
        lng: 137.4071927368641,
        lat: -4.626571631163808,
        zoom: 16,
    }
}
```

### options.demFallback

If a tile layer has a `demPath` set and one of its tile dem request fails for whatever reason (such as a 404) or does not have a `demPath` set, it will try to get the corresponding DEM tile specified in `demFallback`.

|   Parameter    |   Type   | Default |            Description            |
| :------------: | :------: | :-----: | :-------------------------------: |
|  **demPath**   | _string_ |         |  Path for the fallback DEM tiles  |
|   **format**   | _string_ |  'tms'  | Tile format: 'tms', 'wmts', 'wms' |
| **parserType** | _string_ | 'rgba'  |  Which parser to use for demPath  |

#### Example

```javascript
{
    demFallback: {
        demPath:
            'https://domain.com/Missions/MSL/Layers/Gale_HiRISE/MSL_Gale_DEM_Mosaic_1m_v3/{z}/{x}/{y}.png',
        parserType: 'rgba',
    },
}
```

### options.tileMapResource

Representative of the tilemapresource.xml file outputted following tile generation.
_Note: `proj` is the only key currently in use._

|              Parameter               |    Type    |   Default    |                       Description                       |
| :----------------------------------: | :--------: | :----------: | :-----------------------------------------------------: |
|      **tileMapResource.bounds**      | _number[]_ |  [0,0,0,0]   |                  minx, miny, maxx, max                  |
|      **tileMapResource.origin**      | _number[]_ |    [0,0]     |                          x, y                           |
|       **tileMapResource.proj**       |  _string_  | null (wgs84) | proj4 string describing the global tileset's projection |
| **tileMapResource.resunitsperpixel** |  _string_  |      34      | proj4 string describing the global tileset's projection |
|   **tileMapResource.reszoomlevel**   |  _string_  |      0       | proj4 string describing the global tileset's projection |

#### Example

```javascript
{
    tileMapResource: { // this is also the default
        bounds: [0, 0, 0, 0],
        origin: [0, 0],
        proj: null, // proj4 string describing the global tileset projection
        resunitsperpixel: 34,
        reszoomlevel: 0,
    },
}
```

### options.LOD

Configure how the internal level of detail (LOD) works. LOD makes it so that terrain farther away from you is at increasingly lower resolutions. LOD is implemented in LithoSphere in a dead simple way. Instead of just grabbing the tiles from you zoom and viewport, it grabs tiles above your zoom level (lower resolution) and renders them below high resolution tiles. It picks which tiles to pull by first looking at the coordinate at the center of your screen and then working a radius number of tiles outwards.
_Note: This only works if `useLOD` is set to `true`._

|        Parameter         |   Type   | Required | Default |                           Description                            |
| :----------------------: | :------: | :------: | :-----: | :--------------------------------------------------------------: |
| **LOD[i].radiusOfTiles** | _number_ |   true   |   N/A   | How many tiles outward from the center to use for this LOD level |
|    **LOD[i].zoomsUp**    | _number_ |   true   |   N/A   |   How many zoom levels upward (closer to 0) to pull tiles from   |

#### Example

```javascript
{
    useLOD: true,
    LOD: [  // this is also the default
        { radiusOfTiles: 4, zoomsUp: 3 },
        { radiusOfTiles: 2, zoomsUp: 7 },
        { radiusOfTiles: 2, zoomsUp: 11 },
    ],
}
```

### options.starsphere

A skydome but with its missing half and far up beyond the sky.

|      Parameter       |   Type   | Required |  Default  |                       Description                        |
| :------------------: | :------: | :------: | :-------: | :------------------------------------------------------: |
|  **starsphere.url**  | _string_ |   true   |    N/A    | URL of an image to wrap around the inside of the skydome |
| **starsphere.color** | _string_ |  false   | '#AAAAAA' |     What color light to shine upon our skydome image     |

#### Example

```javascript
{
    starsphere: {
        url:
            'https://awesomesite.nasa.gov/public/images/eso0932a.jpg',
        color: '#FF0000', // Tinge it all red
    },
}
```

### options.atmosphere

|      Parameter       |   Type   | Required |  Default  |                    Description                     |
| :------------------: | :------: | :------: | :-------: | :------------------------------------------------: |
| **atmosphere.color** | _string_ |  false   | '#FFFFFF' | What color should the atmosphere of the planet be? |

#### Example

```javascript
{
    atmosphere: {
        color: '#111111',
    },
}
```

## A Full Example

```javascript
const Litho = new LithoSphere.default('container', {
    initialView: {
        lng: 137.4071927368641,
        lat: -4.626571631163808,
        zoom: 16,
    },
    wireframeMode: true,
    exaggeration: 2,
    showAxes: true,
    useLOD: true,
    renderOnlyWhenOpen: true,
    starsphere: {
        url: 'https://awesomesite.nasa.gov/public/images/eso0932a.jpg',
        color: '#666666',
    },
    atmosphere: {
        color: '#111111',
    },
    highlightColor: 'yellow', //css color for vector hover highlights | default 'yellow'
    activeColor: 'red', //css color for active vector features | default 'red'
})
```

## Moving Forward

Check out the [Layers]({{ site.baseurl }}/layers) page next for more information about how you can add and configure layers.
