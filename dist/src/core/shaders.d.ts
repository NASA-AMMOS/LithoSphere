import { ShaderMaterial } from 'three';
declare const Shaders: {
    simplePoint: () => ShaderMaterial;
    multiTexture: (textures: any, fadeIn?: boolean) => ShaderMaterial;
    atmosphere: (color?: string) => ShaderMaterial;
};
export default Shaders;
