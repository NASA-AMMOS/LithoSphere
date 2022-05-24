---
layout: page
title: Functions
permalink: /functions
nav_order: 7
---

# Functions

A collection of potentially useful functions within the `Litho` object. You can explore on your own too — just don't break things and know that, generally, items prefixed with or buried under `_`s are meant to be more private/readonly.

### addLayer()

Adds a new layer to the globe.

`addLayer = (type: string, layerObj: any, callback?: Function): void`

type | _string_ | Type of layer to add. | One of ['tile', 'tile3d', 'clamped', 'vector', 'model', ...]
layerObj | _object_ | The new layer's object | See layer type docs for examples
callback | _Function_ | Called when a layer finishes loading (i.e. a vector layer downloads its geojson) | Not all layer types support this

### removeLayer()

Removes an existing layer from the globe.

`removeLayer = (name: string): boolean`

name | _string_ | Layer name to remove
_returns_ | _boolean_ | `true` only if layer was found and removed

### toggleLayer()

`toggleLayer = (name: string, on?: boolean): boolean`

### orderLayers()

Takes an array of layer names and does its best to reorder them. Layer names that come first are on top of all later layers. Ultimately only clamped and tile layers get ordered where clamped layers always draw on top of tile layers. Clamped and tile layers that are not listed in the new `ordering` get placed on the bottom of the new draw stack and are ordered there according to their pre-existing order.

`orderLayers = (ordering: string[]): boolean`

ordering | _string[]_ | A list of layer names. Index 0 draws on top of index 1
_returns_ | _boolean_ | `true`

### setLayerOpacity()

`setLayerOpacity = (name: string, opacity: number): boolean`

### setLayerFilterEffect()

Sets a tile layer's filter effects. Multiple filters can be applied at once. The possible filter effects are:

-   brightness (default 1.0)
-   saturation (default 1.0)
-   contrast (default 1.0)
-   blendCode (default 0)  
    0: Blending off  
    1: An overlay blend  
    2: A color blend

`setLayerFilterEffect = (name: string, filter: string, value: number): boolean`

_name_ | _string_ | Name of the tile layer to apply a filter to
_filter_ | _string_ | Filter name to apply | One of ['brightness', 'saturation', 'contrast', 'blendCode']
_value_ | _string_ | The value to set the filter to
_returns_ | _boolean_ | `true` only if layer was found and filtered upon

### setLayerSpecificOptions()

Changes and applies a layers options object dynamically. The `options` parameter is merged with the existing layer's options object (it's not a full replacement). Not all layer types support options.

`setLayerSpecificOptions = (name: string, options: object): boolean`

### getLayerByName()

`getLayerByName = (layerName: string): any`

### hasLayer()

`hasLayer = (layerName: string): boolean`

### addControl()

`addControl = (name: string, control: any, params?: object, corner?: Corners): any`

### removeControl()

`removeControl = (name): void`
