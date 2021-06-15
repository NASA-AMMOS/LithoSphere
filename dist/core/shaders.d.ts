import { ShaderMaterial } from 'three';
declare const Shaders: {
    simplePoint: () => ShaderMaterial;
    multiTexture: (textures: any) => ShaderMaterial;
    atmosphere: (color?: string) => ShaderMaterial;
};
export default Shaders;
