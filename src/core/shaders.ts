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
            `${getColorSpaceFunctions()}\n\n` +
            '#ifdef GL_ES\n' +
            'precision highp float;\n' +
            '#endif\n'

        for (let i = 0; i < numberOfTextures; i++) {
            // prettier-ignore
            baseShaderFrag +=
                'uniform sampler2D t' + i + ';\n' +
                'uniform float tA' + i + ';\n' +
                'uniform float fbrightness' + i + ';\n' +
                'uniform float fcontrast' + i + ';\n' +
                'uniform float fsaturation' + i + ';\n' +
                'uniform float fblendCode' + i + ';\n'
        }

        // prettier-ignore
        baseShaderFrag +=
            'varying vec2 vUv;\n' +
            'float sat;\n' +
            'float x;\n' +
            'float y;\n' +
            'vec4 Csat;\n' + // saturation related
            'vec3 backdropHSL;\nvec3 currentHSL;\n' + // color blend related
            'void main(void) {\n' +
                'vec4 C = vec4(0,0,0,0);\n' //transparent base layer
        // This will be our base alpha
        let highestA = 0
        for (let i = 0; i < numberOfTextures; i++) {
            // prettier-ignore
            baseShaderFrag +=
                `vec4 C${i} = texture2D(t${i}, vUv);\n` +
                 (( textures[i].isVAT ===  0) ?
                    (( i > 0 ) ?
                        // Color Blend
                        `if (fblendCode${i} == 2.0) {\n` + 
                            `backdropHSL = RGBtoHSL(C.rgb);\n` +
                            `currentHSL = RGBtoHSL(C${i}.rgb);\n` +
                            `currentHSL.z = backdropHSL.z;\n` +
                            `C${i}.rgb = HSLtoRGB(currentHSL);\n` +
                        `}\n`
                    : '') + 
                    // Apply Contrast
                    `C${i}.rgb = ((C${i}.rgb - 0.5f) * max(fcontrast${i}, 0.0f)) + 0.5f;\n` +
                    // Apply Brightness
                    `C${i}.rgb *= fbrightness${i};\n` +
                    // Apply Saturation
                    `sat = fsaturation${i} - 1.0f;\n` +
                    `x = sat * (2.0f / 3.0f) + 1.0f;\n` +
                    `y = (x - 1.0f) * -0.5f;\n` +
                    `Csat = C${i};\n` +
                    `C${i}.r = Csat.r * x + Csat.g * y + Csat.b * y;\n` +
                    `C${i}.g = Csat.r * y + Csat.g * x + Csat.b * y;\n` +
                    `C${i}.b = Csat.r * y + Csat.g * y + Csat.b * x;\n` +
                    (( i > 0 ) ?
                        // Overlay Blend
                        `if (fblendCode${i} == 1.0) {\n` + 
                            `if (C${i}.r < 0.5f) {\n` +
                                `C${i}.r = 2.0f * C${i}.r * C.r;\n` +
                            `} else {\n` +
                                `C${i}.r = 1.0f - (2.0f * (1.0f - C.r) * (1.0f - C${i}.r));\n` +
                            `}\n` +
                            `if (C${i}.g < 0.5f) {\n` +
                                `C${i}.g = 2.0f * C${i}.g * C.g;\n` +
                            `} else {\n` +
                                `C${i}.g = 1.0f - (2.0f * (1.0f - C.g) * (1.0f - C${i}.g));\n` +
                            `}\n` +
                            `if (C${i}.b < 0.5f) {\n` +
                                `C${i}.b = 2.0f * C${i}.b * C.b;\n` +
                            `} else {\n` +
                                `C${i}.b = 1.0f - (2.0f * (1.0f - C.b) * (1.0f - C${i}.b));\n` +
                            `}\n` +
                        `}\n`
                    : '')
                : '') +
                // prettier-ignore
                `C = vec4( C${i}.rgb * (C${i}.a * tA${i}) + C.rgb * C.a * (1.0 - (C${i}.a * tA${i})), 1);\n`

            // Find highest alpha of non-vector-as-tile-layers (VAT) too
            if (textures[i].isVat === 0 && textures[i].opacity > highestA)
                highestA = textures[i].opacity
        }
        if (highestA === 0) highestA = 1

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

function getColorSpaceFunctions() {
    // prettier-ignore
    return [
        'vec3 RGBtoHSL(in vec3 RGB) {\n',
            'float cMax = max(max(RGB.r, RGB.g), RGB.b);\n',
            'float cMin = min(min(RGB.r, RGB.g), RGB.b);\n',
            'float delta = cMax - cMin;\n',

            'float lightness = (cMax + cMin) / 2.0f;\n', //(0.299f*RGB.r + 0.587f*RGB.g + 0.114f*RGB.b);\n',

            'float hue = 0.0f;\n',
            'if (delta == 0.0f) {\n',
                'hue = 0.0f;\n',
            '}\n',
            'else if (cMax == RGB.r) {\n',
                'hue = (60.0f / 360.0f) * mod((RGB.g - RGB.b) / delta , 6.0f);\n',
            '}\n',
            'else if (cMax == RGB.g) {\n',
                'hue = (60.0f / 360.0f) * (((RGB.b - RGB.r) / delta) + 2.0f);\n',
            '}\n',
            'else if (cMax == RGB.b) {\n',
                'hue = (60.0f / 360.0f) * (((RGB.r - RGB.g) / delta) + 4.0f);\n',
            '}\n',

            'float saturation = 0.0f;\n',
            'if (delta > 0.0f) {\n',
                'saturation = delta / (1.0f - abs((2.0f * lightness) - 1.0f));\n',
            '}\n',

            'return vec3(hue, saturation, lightness);\n',
        '}',
        'vec3 HSLtoRGB(in vec3 HSL) {',
            'float C = (1.0f - abs((2.0f * HSL.z) - 1.0f)) * HSL.y;\n',
            'float X = C * (1.0f - abs(mod(HSL.x / (60.0f / 360.0f), 2.0f) - 1.0f));\n',
            'float m = HSL.z - C / 2.0f;\n',
            'vec3 rgb;\n',
            'if (HSL.x < (60.0f / 360.0f)) {\n',
                'rgb = vec3(C, X, 0);\n',
            '} else if (HSL.x < (120.0f / 360.0f)) {\n',
                'rgb = vec3(X, C, 0);\n',
            '} else if (HSL.x < (180.0f / 360.0f)) {\n',
                'rgb = vec3(0, C, X);\n',
            '} else if (HSL.x < (240.0f / 360.0f)) {\n',
                'rgb = vec3(0, X, C);\n',
            '} else if (HSL.x < (300.0f / 360.0f)) {\n',
                'rgb = vec3(X, 0, C);\n',
            '} else {\n',
                'rgb = vec3(C, 0, X);\n',
            '}\n',
            'return vec3(rgb.r + m, rgb.g + m, rgb.b + m);\n',
        '}',   
    ].join('\n')
}

export default Shaders
