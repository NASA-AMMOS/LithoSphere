---
layout: page
title: Controls
permalink: /controls
nav_order: 4
---

# Controls

Controls are UI elements that can be added to the screen for added interaction. You can enable them all or not if you want to build a more robust UI or integrate LithoSphere into an existing project.

Add controls are added like:

```javascript
Litho.addControl(className, Control, options?, corner?)
```

-   `className` - An HTML class name to assign to the control.
-   `Control` - A JavaScript class with the required functions `getControl` and `attachEvents`. Prebuilt Controls are detailed below.
-   `options` - Specific to the control.
-   `corner` - Sets which screen corner to place the control in and is one of `'TopLeft' || 'TopRight' || 'BottomLeft' || 'BottomRight'`

### Compass

A compass the radially indicates view azimuth and field of view. Hovering over it also displays the azimuth in degrees.

```javascript
Litho.addControl('myCompass', Litho.controls.compass)
```

### Coordinates

Displays the current longitude, latitude and elevation coordinates under the cursor. If the `existingDivId` option is sent, it'll use that HTML element to write the coordinates to instead of generating its own.

```javascript
Litho.addControl('myCoords', Litho.controls.coordinates, {
    //existingDivId: 'myCustomCoordDiv',
})
```

### Exaggerate

Allows users to exaggerate terrain by applying a multiplier to its elevation values.

```javascript
Litho.addControl('myExaggerate', Litho.controls.exaggerate)
```

### Home

Returns the view to the initial view

```javascript
Litho.addControl('myHome', Litho.controls.home)
```

### Layers

A menu that lists out the current layers within LithoSphere and provides the abilities to toggle layers and set their opacities.

```javascript
Litho.addControl('myLayers', Litho.controls.layers)
```

### Observe

Allows users to set camera parameters and stand at a location in it.

```javascript
Litho.addControl('myObserve', Litho.controls.observe)
```

### Walk

Enters first person mode to walk on the surface with available keyboards controls.

```javascript
Litho.addControl('myWalk', Litho.controls.walk)
```
