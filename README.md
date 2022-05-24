<hr>

<div align="center">

<span style="display:block;text-align:center">![LithoSphere](/docs/assets/images/logo-small.png)</span>

  <h1 align="center">
      LithoSphere
  </h1>

</div>

<pre align="center">A free tile-based 3D globe renderer built with Three.js</pre>

[![npm version](https://img.shields.io/npm/v/lithosphere.svg?style=flat-square)](https://www.npmjs.com/package/lithosphere)
[![travis build](https://img.shields.io/travis/com/NASA-AMMOS/LithoSphere/master.svg?style=flat-square)](https://travis-ci.com/NASA-AMMOS/LithoSphere)
[![lgtm code quality](https://img.shields.io/lgtm/grade/javascript/g/NASA-AMMOS/LithoSphere.svg?style=flat-square&label=code-quality)](https://lgtm.com/projects/g/NASA-AMMOS/LithoSphere/)

LithoSphere is a completely free and open-sourced tile-based 3D globe renderer. First built within the Geographical Information System (GIS) application [MMGIS](https://github.com/NASA-AMMOS/MMGIS), LithoSphere has been pulled out and refactored into a standalone, mapping focused, JavaScript library. At its core sits the brilliant [Three.js](https://threejs.org/) library with all its extensible familiarity.

### [LIVE DEMO](https://nasa-ammos.github.io/LithoSphere/demo)

---

### Quick Start

`npm install lithosphere`

Head over to the **[Documentation](https://nasa-ammos.github.io/LithoSphere/)** pages for more or checkout `/example.html`.

<div align="center">

<span style="display:block;text-align:center; width: 70%;">![Example Screenshot](/docs/assets/images/screenshot1.png)</span>

</div>

### Features

-   Fully configurable layer types:
    -   Vector
    -   Clamped
    -   Overlay (upcoming)
    -   Tile
    -   Tile3d
    -   Model
    -   Curtain
-   Adjustable planetary radii
-   Scripts for tiling Digital Elevation Maps (DEM) and custom projections
-   Various tile formats:
    -   TMS
    -   WMTS
    -   WMS
-   Full Proj4 support to render tile sets of any projection
-   A suite of pluginable UI controls:
    -   Compass
    -   Layers
    -   Walk
    -   Observe
    -   Home
    -   Exaggerate
    -   Crop (upcoming?)
    -   Controls
    -   Coordinates
    -   Link
-   The ability to use custom parsers for your own tiled data formats
-   And more!
