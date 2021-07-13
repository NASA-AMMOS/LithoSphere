export interface TileMapResource {
    bounds: number[]
    origin: number[]
    crsCode: string
    epsg?: string
    proj: string
    resunitsperpixel: number
    reszoomlevel: number
}

export interface LatLng {
    lat: number
    lng: number
}

export interface LatLngH {
    lat: number
    lng: number
    height: number
}

export interface LatLngElev {
    lat: number
    lng: number
    elev: number
}

export interface LatLngZ {
    lat: number
    lng: number
    zoom?: number
}

export interface XY {
    x: number
    y: number
}

export interface XYZ {
    x: number
    y: number
    z: number
}

export interface XYZLOD {
    x: number
    y: number
    z: number
    isLODTile?: boolean
    LODLevel?: number
    make?: boolean
}

export const enum Corners {
    TopLeft = 'TopLeft',
    TopRight = 'TopRight',
    BottomLeft = 'BottomLeft',
    BottomRight = 'BottomRight',
}

export interface ControlType {
    _: any
    p: any
    corner?: Corners
    getControl: Function
    attachEvents: Function
    onUpdate?: Function
    onMouseMove?: Function
    onMove?: Function
    onMouseOut?: Function
    onFirstPersonUpdate?: Function
    onOrbitalUpdate?: Function
}

export interface Options {
    initialView?: LatLngZ
    // Whether or not to show the loading screen
    loadingScreen?: boolean
    majorRadius?: number
    minorRadius?: number
    // Specifies map projection
    tileMapResource?: TileMapResource
    customParsers?: any
    starsphere?: {
        url?: string
        color?: string
    }
    atmosphere?: {
        color?: string
    }
    loadingSpinnerId?: string
    // Number of tiles to go out radially to fill the base scene
    radiusOfTiles?: number
    // Enable Level of Detail
    useLOD?: boolean
    // Describes the level of detail layers
    LOD?: { radiusOfTiles: number; zoomsUp: number }[]
    // How many vertices wide each tile is
    tileResolution?: number
    trueTileResolution?: number
    // Tile y axis inverted
    yInvert?: boolean
    showAxes?: boolean
    // Show wires instead of faces
    wireframeMode?: boolean
    // Exaggerates the terrain's elevation
    exaggeration?: number
    // Don't render/update if source container is closed
    renderOnlyWhenOpen?: boolean
    // Offset the camera's look-at point height
    targetYOffset?: number
    highlightColor?: string
    activeColor?: string
}
