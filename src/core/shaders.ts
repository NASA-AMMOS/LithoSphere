// prettier-ignore
import { ShaderMaterial, Color, AdditiveBlending } from 'three'
//import { NO_DATA_VALUE_INTERNAL } from '../constants'

const Shaders = {
    simplePoint: function (): ShaderMaterial {
        const baseShaderVert =
            '#ifdef GL_ES\n' +
            'precision highp float;\n' +
            '#endif\n' +
            'void main() {\n' +
            'gl_PointSize = 50.\n' +
            'gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.)\n' +
            '}'

        const baseShaderFrag =
            'void main() {\n' +
            'gl_FragColor = vec4(0.0, 1.0, 1.0, 0.0)\n' +
            '}'
        //Now make the material
        return new ShaderMaterial({
            uniforms: {},
            vertexShader: baseShaderVert,
            fragmentShader: baseShaderFrag,
            transparent: true,
        })
    },
    // textures is  [{ texture: texture, opacity: opacity }, {}...]
    multiTexture: function (textures: any, fadeIn?: boolean): ShaderMaterial {
        const numberOfTextures = textures.length
        // prettier-ignore
        const baseShaderVert =
            '#ifdef GL_ES\n' +
            'precision highp float;\n' +
            '#endif\n' +
            'varying vec2 vUv;\n' +
            'void main() {\n' +
                'vUv = uv;\n' +
                'vec4 mvPosition = viewMatrix * modelMatrix * vec4(position, 1.0);\n' +
                'gl_Position = projectionMatrix * mvPosition;\n' +
            '}'

        let baseShaderFrag =
            '#ifdef GL_ES\n' + 'precision highp float;\n' + '#endif\n'

        for (let i = 0; i < numberOfTextures; i++) {
            // prettier-ignore
            baseShaderFrag +=
                'uniform sampler2D t' + i + ';\n' +
                'uniform float tA' + i + ';\n' +
                'uniform float tVAT' + i + ';\n' +
                'uniform float fbrightness' + i + ';\n' +
                'uniform float fcontrast' + i + ';\n' +
                'uniform float fsaturation' + i + ';\n' +
                'uniform float fblendCode' + i + ';\n' +
                'uniform float fblend' + i + ';\n'
        }

        // prettier-ignore
        baseShaderFrag +=
            'varying vec2 vUv;\n' +
            'void main(void) {\n' +
                'vec4 C = vec4(0,0,0,0);\n' //transparent base layer
        // This will be our base alpha
        let highestA = 0
        for (let i = 0; i < numberOfTextures; i++) {
            // prettier-ignore
            baseShaderFrag +=
                `vec4 C${i} = texture2D(t${i}, vUv);\n`
                + `if ( tVAT${i} == 0.0 ) {\n`
                    // Apply Contrast
                    + `C${i}.rgb = ((C${i}.rgb - 0.5f) * max(fcontrast${i}, 0.0f)) + 0.5f;\n`
                    // Apply Brightness
                    + `C${i}.rgb *= fbrightness${i};\n`
                    // Apply Saturation
                    + `float sat = fsaturation${i} - 1.0f;\n`
                    + `float x = sat * (2.0f / 3.0f) + 1.0f;\n`
                    + `float y = (x - 1.0f) * -0.5f;\n`
                    + `vec4 Csat = C${i};\n` 
                    + `C${i}.r = Csat.r * x + Csat.g * y + Csat.b * y;\n`
                    + `C${i}.g = Csat.r * y + Csat.g * x + Csat.b * y;\n`
                    + `C${i}.b = Csat.r * y + Csat.g * y + Csat.b * x;\n`
                + '}\n'
                // prettier-ignore
                + `C = vec4( C${i}.rgb * (C${i}.a * tA${i}) + C.rgb * C.a * (1.0 - (C${i}.a * tA${i})), 1);\n`

            // Find highest alpha of non-vector-as-tile-layers (VAT) too
            if (textures[i].isVat === 0 && textures[i].opacity > highestA)
                highestA = textures[i].opacity
        }
        if (highestA === 0) highestA = 1
        // prettier-ignore
        //baseShaderFrag +=
        // Unmultiply Alpha
        //'C.rgb /= C.a;\n'
        // Reset alpha
        //+ 'C.rgb *= C.a;\n'

        // discard if all transparent
        baseShaderFrag += 'if ('
        for (let i = 0; i < numberOfTextures; i++) {
            baseShaderFrag += ' C' + i + '.a == 0.0'
            if (i != numberOfTextures - 1) {
                baseShaderFrag += ' && '
            }
        }
        // prettier-ignore
        baseShaderFrag +=
                '){\n' +
                    'discard;\n' +
                '}\n' +
                
                `C.a = ${highestA.toFixed(1)}f;\n` +
                'gl_FragColor = C;\n' +
            '}'

        const uniforms = {}

        for (let i = 0; i < numberOfTextures; i++) {
            uniforms['t' + i] = { value: textures[i].texture }
            uniforms['tA' + i] = { value: fadeIn ? 0 : textures[i].opacity }
            uniforms['tVAT' + i] = { value: textures[i].isVAT }
            uniforms['fbrightness' + i] = {
                value: textures[i].filters.brightness,
            }
            uniforms['fcontrast' + i] = { value: textures[i].filters.contrast }
            uniforms['fsaturation' + i] = {
                value: textures[i].filters.saturation,
            }
            uniforms['fblendCode' + i] = {
                value: textures[i].filters.blendCode,
            }
            uniforms['fblend' + i] = { value: textures[i].filters.blend }
        }

        //Now make the material
        return new ShaderMaterial({
            uniforms: uniforms,
            vertexShader: baseShaderVert,
            fragmentShader: baseShaderFrag,
            transparent: true,
        })
    },
    atmosphere: function (color?: string): ShaderMaterial {
        //From: https://github.com/jeromeetienne/threex.planets/blob/master/threex.atmospherematerial.js

        // prettier-ignore
        const vertexShader = [
            'varying vec3	vVertexWorldPosition;',
            'varying vec3	vVertexNormal;',

            'void main(){',
            '	vVertexNormal = normalize(normalMatrix * normal);',

            '	vVertexWorldPosition = (modelMatrix * vec4(position, 1.0)).xyz;',

            '	// set gl_Position',
            '	gl_Position	= projectionMatrix * modelViewMatrix * vec4(position, 1.0);',
            '}',
            ].join('\n')

        // prettier-ignore
        const fragmentShader = [
            "#ifdef GL_ES",
            "precision highp float;",
            "#endif",

            'uniform vec3 glowColor;',
            'uniform float coefficient;',
            'uniform float opacity;',
            'uniform float power;',

            'varying vec3 vVertexNormal;',
            'varying vec3 vVertexWorldPosition;',

            'void main(){',
            '	vec3 worldCameraToVertex = vVertexWorldPosition - cameraPosition;',
            '	vec3 viewCameraToVertex	= (viewMatrix * vec4(worldCameraToVertex, 0.0)).xyz;',
            '	viewCameraToVertex = normalize(viewCameraToVertex);',
            '	float intensity = pow(coefficient + dot(vVertexNormal, viewCameraToVertex), power);',
            '	gl_FragColor = vec4(glowColor * intensity * opacity, 1.0);',
            ' if (intensity > 0.4) { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }',
            '}',
            ].join('\n')

        // create custom material from the shader code above
        //   that is within specially labeled script tags
        return new ShaderMaterial({
            uniforms: {
                coefficient: {
                    //type: 'f',
                    value: 0.1,
                },
                power: {
                    //type: 'f',
                    value: 6.0,
                },
                opacity: {
                    //type: 'f',
                    value: 0.5,
                },
                glowColor: {
                    //type: 'c',
                    value: new Color(color || '#FFFFFF'),
                },
            },
            vertexShader: vertexShader,
            fragmentShader: fragmentShader,
            blending: AdditiveBlending,
            transparent: true,
            depthWrite: false,
        })
    },
}

export default Shaders
