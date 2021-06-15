import { Sprite } from 'three';
declare const Sprites: {
    spriteMaterials: {};
    makeMarkerSprite: (parameters: any, id: any, forceNewMaterial: any) => Sprite;
    makeMarkerMaterial: (parameters: any, id: any, forceNewMaterial: any) => any;
    makeTextSprite: (message: any, parameters: any) => Sprite;
};
export default Sprites;
