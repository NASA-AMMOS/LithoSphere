---
layout: page
title: Parsers
permalink: /parsers
nav_order: 6
---

# Parsers

Parsers convert elevation tiles into a `width * height` array of height values that LithoSphere can then render. The default parser takes PNG tiles and reassembles height data from the four R, G, B, A bands. See [gdal2customtiles.py]({{ site.baseurl }}/scripts#gdal2customtilespy) for information on making these tiles. Parsers can be passed to LithoSphere through its constructor and assigned per tile layer:

```javascript
const Litho = new LithoSphere(myContainer, {s
    customParsers: {
        myCustomParserName: (
            tilePath,
            layerObj,
            xyz,
            tileResolution,
            numberOfVertices
        ) => {
            return new Promise((resolve, reject) => {
                // [500, 500, 500, 500, ...]
                resolve(new Array(numberOfVertices).fill(500))
            })
        },
    },
})
// ...
Litho.addLayer('tile', {
    // ...
    // Associate your layer with a parser
    parser: 'myCustomParserName',
    // ...
})
```

A couple notes:

-   Custom parser functions get run for each tile wanted.
-   Custom parsers must return a Promise that resolves to an array.
-   You are responsible for querying the tile too.
-   If you feel your parser is useful enough, consider contributing it!
