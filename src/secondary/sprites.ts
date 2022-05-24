import {
    Sprite,
    SpriteMaterial,
    Texture,
    NearestFilter,
    ClampToEdgeWrapping,
} from 'three'

import Utils from '../utils'

const Sprites = {
    //id -> spriteMaterial
    spriteMaterials: {},
    makeMarkerSprite: function (
        parameters,
        id,
        options = {},
        forceNewMaterial?: boolean
    ) {
        const sprite = new Sprite(
            Sprites.makeMarkerMaterial(
                parameters,
                id,
                options,
                forceNewMaterial
            )
        )
        // @ts-ignore
        sprite.style = sprite.style || {}

        // @ts-ignore
        sprite.style.radius = parameters.hasOwnProperty('radius')
            ? parameters['radius']
            : 32

        return sprite
    },
    makeMarkerMaterial: function (
        parameters,
        id,
        options,
        forceNewMaterial?: boolean
    ) {
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
                          parameters['fillOpacity'] != null &&
                          options.annotation !== true
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
            const ctx = canvas.getContext('2d')

            ctx.lineWidth = strokeWeight * Math.ceil(radius / 8)

            if (options.annotation === true) {
                let text = options.name || ''

                const fontXOffset = 8
                let fontSize = parameters.fontSize || '16px'
                fontSize = parseInt(fontSize.replace('px', '')) * 1.1
                ctx.font = `${fontSize}pt sans-serif`

                const heightInnerOverflow = 10
                // For chars the extend under the line. Like p
                const heightOuterOverflow = fontSize / 3.5 + 10

                const textSize = {
                    width: ctx.measureText(text).width + fontXOffset * 2,
                    height:
                        fontSize + heightInnerOverflow + heightOuterOverflow,
                }

                canvas.width = textSize.width
                canvas.height = textSize.height

                // Important to propagate these through for attenuation to work
                parameters.width = canvas.width / 6
                parameters.height = canvas.height / 6

                // Again because setting width and height resets it; but we
                // needed it before to compute width and height
                ctx.font = `${fontSize}pt sans-serif`

                const canvasX = 0

                const textX = canvasX + fontXOffset
                const textY =
                    fontSize + heightOuterOverflow / 2 + heightInnerOverflow / 2

                // Background text border
                ctx.fillStyle = strokeColor
                Utils.drawTextBorder(ctx, text, textX, textY, 3)

                // Text
                ctx.fillStyle = fillColor
                ctx.fillText(text, textX, textY)
            } else {
                const width = radius * 2
                const height = radius * 2
                canvas.width = width
                canvas.height = height

                ctx.beginPath()
                ctx.arc(
                    canvas.width / 2,
                    canvas.height / 2,
                    radius - strokeWeight * (radius / 12),
                    0,
                    2 * Math.PI,
                    false
                )
                //fill color
                if (typeof fillColor === 'object') {
                    ctx.fillStyle =
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
                    ctx.fillStyle = fillColor
                }
                ctx.fill()
                // border color
                if (typeof strokeColor === 'object') {
                    ctx.strokeStyle =
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
                    ctx.strokeStyle = strokeColor
                }
                ctx.stroke()
            }

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
}

export default Sprites
