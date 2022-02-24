import {
    Sprite,
    SpriteMaterial,
    Texture,
    NearestFilter,
    ClampToEdgeWrapping,
} from 'three'

const Sprites = {
    //id -> spriteMaterial
    spriteMaterials: {},
    makeMarkerSprite: function (parameters, id, forceNewMaterial?: boolean) {
        const sprite = new Sprite(
            Sprites.makeMarkerMaterial(parameters, id, forceNewMaterial)
        )
        // @ts-ignore
        sprite.style = sprite.style || {}
        // @ts-ignore
        sprite.style.radius = parameters.hasOwnProperty('radius')
            ? parameters['radius']
            : 32
        return sprite
    },
    makeMarkerMaterial: function (parameters, id, forceNewMaterial?: boolean) {
        if (parameters === undefined) parameters = {}
        if (
            id &&
            this.spriteMaterials.hasOwnProperty(
                `${id}_${JSON.stringify(parameters)}`
            ) &&
            forceNewMaterial !== true
        ) {
            return this.spriteMaterials[`${id}_${JSON.stringify(parameters)}`]
        } else {
            // Ideally a power of 2
            // This is the canvas size too
            let radius = parameters.hasOwnProperty('radius')
                ? parameters['radius']
                : 64
            //Low res points will be bumped up to a higher res canvas
            radius = Math.max(radius, 64)

            const fillColor = parameters.hasOwnProperty('fillColor')
                ? parameters['fillColor']
                : {
                      r: 255,
                      g: 255,
                      b: 255,
                      a:
                          parameters['fillOpacity'] != null
                              ? parameters['fillOpacity']
                              : 1.0,
                  }

            const strokeWeight = parameters.hasOwnProperty('weight')
                ? parameters['weight']
                : 4

            const strokeColor = parameters.hasOwnProperty('color')
                ? parameters['color']
                : { r: 0, g: 0, b: 0, a: 1.0 }

            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            const width = radius * 2
            const height = radius * 2
            canvas.width = width
            canvas.height = height

            context.beginPath()
            context.arc(
                canvas.width / 2,
                canvas.height / 2,
                radius - strokeWeight * (radius / 12),
                0,
                2 * Math.PI,
                false
            )
            //fill color
            if (typeof fillColor === 'object') {
                context.fillStyle =
                    'rgba(' +
                    fillColor.r +
                    ',' +
                    fillColor.g +
                    ',' +
                    fillColor.b +
                    ',' +
                    fillColor.a +
                    ')'
            } else {
                context.fillStyle = fillColor
            }
            context.fill()
            context.lineWidth = strokeWeight * Math.ceil(radius / 8)
            // border color
            if (typeof strokeColor === 'object') {
                context.strokeStyle =
                    'rgba(' +
                    strokeColor.r +
                    ',' +
                    strokeColor.g +
                    ',' +
                    strokeColor.b +
                    ',' +
                    strokeColor.a +
                    ')'
            } else {
                context.strokeStyle = strokeColor
            }
            context.stroke()

            // canvas contents will be used for a texture
            const texture = new Texture(canvas)
            texture.needsUpdate = true
            texture.anisotropy = 0
            texture.magFilter = NearestFilter
            texture.minFilter = NearestFilter
            texture.wrapT = ClampToEdgeWrapping

            const spriteMaterial = new SpriteMaterial({
                map: texture,
                transparent: true,
                alphaTest: 0.01,
                //depthTest: true,
                //depthWrite: false
            })

            // Save spriteMaterials with id so they don't need to be recreated
            if (id && forceNewMaterial !== true) {
                this.spriteMaterials[
                    `${id}_${JSON.stringify(parameters)}`
                ] = spriteMaterial
            }

            return spriteMaterial
        }
    },
    makeTextSprite: function (message, parameters) {
        if (parameters === undefined) parameters = {}

        const fontface = parameters.hasOwnProperty('fontface')
            ? parameters['fontface']
            : 'Arial'

        const fontsize = parameters.hasOwnProperty('fontsize')
            ? parameters['fontsize']
            : 18

        const strokeWeight = parameters.hasOwnProperty('strokeWeight')
            ? parameters['strokeWeight']
            : 4

        const strokeColor = parameters.hasOwnProperty('strokeColor')
            ? parameters['strokeColor']
            : { r: 0, g: 0, b: 0, a: 1.0 }

        const fontColor = parameters.hasOwnProperty('fontColor')
            ? parameters['fontColor']
            : { r: 255, g: 255, b: 255, a: 1.0 }

        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        const width = 1024
        const height = 64
        canvas.width = width
        canvas.height = height
        context.font = 'Bold ' + fontsize + 'px ' + fontface

        // get size data (height depends only on font size)
        // TODO
        //const metrics = context.measureText(message)
        //const textWidth = metrics.width
        // background color

        // border color
        context.strokeStyle =
            'rgba(' +
            strokeColor.r +
            ',' +
            strokeColor.g +
            ',' +
            strokeColor.b +
            ',' +
            strokeColor.a +
            ')'

        context.lineWidth = strokeWeight

        //text color
        context.fillStyle =
            'rgba(' +
            fontColor.r +
            ',' +
            fontColor.g +
            ',' +
            fontColor.b +
            ',' +
            fontColor.a +
            ')'
        context.textAlign = 'left'
        context.strokeText(
            message,
            width / 2 + fontsize,
            height - fontsize / 1.8
        )
        context.fillText(message, width / 2 + fontsize, height - fontsize / 1.8)

        // canvas contents will be used for a texture
        const texture = new Texture(canvas)
        texture.needsUpdate = true

        const spriteMaterial = new SpriteMaterial({ map: texture })
        const sprite = new Sprite(spriteMaterial)
        sprite.scale.set(64, 4, 1)
        return sprite
    },
}

export default Sprites
