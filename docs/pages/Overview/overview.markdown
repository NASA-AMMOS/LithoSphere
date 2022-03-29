---
layout: page
title: Overview
permalink: /
nav_order: 0
---

# Overview

[LithoSphere](https://github.com/NASA-AMMOS/LithoSphere) is a completely free and open-sourced tile-based 3D globe renderer. First built within the Geographical Information System (GIS) application [MMGIS](https://github.com/NASA-AMMOS/MMGIS), LithoSphere has been pulled out and refactored into a standalone, mapping focused, JavaScript library. At its core sits the brilliant [Three.js](https://threejs.org/) library with all its extensible familiarity.

### Quick Start

`npm install lithosphere`

Head over to [Getting Started]({{ site.baseurl }}/getting-started) for more, checkout the examples in `/public/examples`, or start the demo server `npm run start:demo` and open `/public/index.html`.

### Features

-   Fully configurable layer types:
    -   Vector
    -   Clamped
    -   Overlay (not implemented)
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
    -   Crop
    -   Navigation
    -   Coordinates
    -   Link
-   A stub to create parsers for your own tiled data formats
-   And more!
