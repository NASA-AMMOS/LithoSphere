// prettier-ignore
import { ShaderMaterial, Color, AdditiveBlending } from 'three'
import { NO_DATA_VALUE_INTERNAL } from '../constants'

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
            'attribute vec3 customColor;\n' +
            'varying vec3 vColor;\n' +
            'void main() {\n' +
                'vUv = uv;\n' +
                'vColor = customColor;\n' +
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
                'uniform float tVAT' + i + ';\n'
        }

        // prettier-ignore
        baseShaderFrag +=
            'varying vec2 vUv;\n' +
            'varying vec3 vColor;\n' +
            'void main(void) {\n' +
                'vec4 C;\n' +
                'vec4 B = vec4(0,0,0,0);\n' + //transparent base layer
                'vec4 C0 = texture2D(t0, vUv);\n' +
                'float highestA = tA0;\n'

        baseShaderFrag +=
            'C = vec4( C0.rgb * (C0.a * tA0) + B.rgb * B.a * (1.0 - (C0.a * tA0)), 1);\n' // blending equation
        for (let i = 1; i < numberOfTextures; i++) {
            // prettier-ignore
            baseShaderFrag +=
                'if ( tVAT' + i + ' == 0.0 && tA' + i +' > highestA ){ highestA = tA' + i + '; }\n' +
                'vec4 C' + i + ' = texture2D(t' + i + ', vUv);\n' +
                'C = vec4( C' + i + '.rgb * (C' + i + '.a * tA' + i + ') + C.rgb * C.a * (1.0 - (C' + i + '.a * tA' + i + ')), 1);\n'
        }

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
                'if (vColor.r * vColor.g * vColor.b == 1.0){\n' +
                    'discard;\n' +
                '}\n' +
                'if (!(vColor.r == 0.0 && vColor.g == 0.0 && vColor.b == 0.0)){\n' +
                    'C = vec4(vColor, 1);\n' +
                '}\n' +
                'C.a = highestA;\n' +
                'gl_FragColor = C;\n' +
            '}'

        const uniforms = {}

        for (let i = 0; i < numberOfTextures; i++) {
            uniforms['t' + i] = { value: textures[i].texture }
            uniforms['tA' + i] = { value: fadeIn ? 0 : textures[i].opacity }
            uniforms['tVAT' + i] = { value: textures[i].isVAT }
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
