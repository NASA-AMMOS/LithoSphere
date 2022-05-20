import { Sprite } from 'three';
declare const Sprites: {
    spriteMaterials: {};
    makeMarkerSprite: (parameters: any, id: any, options?: {}, forceNewMaterial?: boolean) => Sprite;
    makeMarkerMaterial: (parameters: any, id: any, options: any, forceNewMaterial?: boolean) => any;
};
export default Sprites;
