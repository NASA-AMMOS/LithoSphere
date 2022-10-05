---
layout: page
title: Model
permalink: /layers/model
parent: Layers
---

# Model

Adds a model to the scene.

Supports: .glb, .gltf, .dae, .obj

### Example

```javascript
Litho.addLayer(
    'model',
    {
        name: 'roverGLTF',
        order: 1,
        on: true,
        path: 'http://localhost:8888/Missions/MSL/Data/models/Perseverance.glb', // Can also be an array
        // mtlPath: '', //if path is to an obj, can also be an array
        opacity: 0.5,
        // isArrayed: true, // default false...
        // if true, position, scale and rotation can be arrays for a series of models layer
        // (at least position must be an array now, performance may suffer).
        // Will index match on path, mtlPath, position, scale and rotation.
        position: {
            longitude: 137.3572927368641, // default 0
            latitude: -4.674971631163808, // default 0
            elevation: -4443.613, // default 0
        },
        scale: 10, // default 1
        rotation: {
            // y-up is away from planet center. x is pitch, y is yaw, z is roll
            x: Math.PI / 12, // in radians | default 0
            y: Math.PI / 1.5, // default 0
            z: 0, // default 0
            order: 'YXZ', //default YXZ
        },
        // cache: true, // default true // If true, uses cloned meshes from the first download
    },
    () => {
        console.log('Rover loaded')
        //Litho.setLayerOpacity('roverGLTF', 0.25)
        //Litho.removeLayer('roverGLTF')
        /*
        Litho.toggleLayer('roverGLTF', false)
        setTimeout(() => {
            Litho.toggleLayer('roverGLTF', true)
        }, 10000)
        */
    }
)
```
