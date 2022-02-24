---
layout: page
title: Layers
permalink: /layers/
has_children: true
nav_order: 4
---

# Layers

_Apologizes the Layers type pages aren't as filled out as they could be. The examples in `/public/examples` should get you pretty far nonetheless._

Layers are how you add data into Lithosphere. There are many different types of layers each with different options to set.

### Core Functions

```typescript
Litho.addLayer = (type: string, options: object, onAdd?: Function): void => {}
Litho.setLayerOpacity = (name: string, opacity: number): boolean => {}
Litho.toggleLayer = (name: string, on?: boolean): boolean => {}
Litho.removeLayer = (name: string): boolean => {}
Litho.getLayerByName = (name: string): any => {}
Litho.hasLayer = (name: string): boolean => {}
Litho.setLayerFilterEffect = (
    name: string,
    filter: string,
    value: number
): boolean => {}
Litho.setLayerSpecificOptions = (name: string, options: object): boolean => {}
```
