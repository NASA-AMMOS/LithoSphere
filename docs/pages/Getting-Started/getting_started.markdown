---
layout: page
title: Getting Started
permalink: /getting-started
nav_order: 2
---

# Getting Started

LithoSphere is accessible via the Node.js package manager npm (recommended) as well as an old-school JavaScript module.

## npm

1. To install LithoSphere via npm, simply run:

    ```
    npm install lithosphere
    ```

2. Then, at the top of your script, import it like so:

    ```javascript
    import LithoSphere from 'lithosphere'
    ```

3. Then invoke LithoSphere with:
    ```javascript
    const Litho = new LithoSphere(yourHtmlContainerId, yourOptionsObject)
    // Litho.addLayer(type, layerOptions)
    ```

## Old-School Alternative

If you're not using npm just yet, that's okay, we support you too.

1. Within the LithoSphere GitHub repository, navigate to `/dist` and copy `lithosphere.js` into your project.

2. Add the following script tag to your HTML before you intend to invoke it:
    ```html
    <script src="your/path/to/lithosphere.js"></script>
    ```
3. Using the `examples/example.html` file as a guide, use something like the following to initialize LithoSphere:
    ```html
    <div id="container"></div>
    <script>
        const Litho = new LithoSphere.default('container', {})
        // Litho.addLayer(type, layerOptions)
    </script>
    ```

## Moving Forward

Check out the [Constructor]({{ site.baseurl }}/constructor) page next for more information about the LithoSphere constructor and its available options.
