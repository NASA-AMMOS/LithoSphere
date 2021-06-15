import { Sprite } from 'three';
declare const Sprites: {
    spriteMaterials: {};
    makeMarkerSprite: (parameters: any, id: any, forceNewMaterial?: boolean) => Sprite;
    makeMarkerMaterial: (parameters: any, id: any, forceNewMaterial?: boolean) => any;
    makeTextSprite: (message: any, parameters: any) => Sprite;
};
export default Sprites;
