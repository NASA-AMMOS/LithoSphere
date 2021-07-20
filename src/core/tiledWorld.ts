import { Shaders } from './'

import {
    TextureLoader,
    NearestFilter,
    Mesh,
    MeshBasicMaterial,
    PlaneBufferGeometry,
    BufferAttribute,
    CanvasTexture,
} from 'three'

import load from '../parsers'
import Utils from '../utils'
import Paths from '../utils/paths'

import { XYZ, XYZLOD } from '../generalTypes'

interface Private {
    loader: TextureLoader
    // How many THREE world units each tile is
    tileDimension: number
}

export default class TiledWorld {
    _: Private
    // array of current drawn xyz's of tiles
    tilesDrawn: any
    // array of desired xyz's of tiles
    tilesWanted: any
    // a stack of tiles to be drawn so we can don't have to process all at once
    tilesToBeDrawn: any
    // array of tiles that are in the process of drawing
    tilesBeingDrawn: any

    // Parent
    p: any

    constructor(parent: any) {
        this.p = parent
        this._reset()
    }

    _reset(): void {
        this._ = {
            loader: new TextureLoader(),
            tileDimension: 6,
        }
        this.tilesDrawn = []
        this.tilesWanted = []
        this.tilesToBeDrawn = []
        this.tilesBeingDrawn = []
    }

    // bulk adds or removes tiles from the world based on visible extent
    refreshTiles(): void {
        // Make sure our desired tiles match the current visible extent
        this.updateDesiredTiles()

        // This clears any tiles that were to be drawn but are no longer wanted before it could be drawn
        this.tilesToBeDrawn = []

        // See what tiles we need to add and add them
        for (let i = 0; i < this.tilesWanted.length; i++) {
            let matched = false
            for (let j = 0; j < this.tilesDrawn.length; j++) {
                // If they match, hence it already exists, don't redraw
                if (
                    this.tilesWanted[i].x == this.tilesDrawn[j].x &&
                    this.tilesWanted[i].y == this.tilesDrawn[j].y &&
                    this.tilesWanted[i].z == this.tilesDrawn[j].z &&
                    this.tilesWanted[i].isLODTile ==
                        this.tilesDrawn[j].isLODTile &&
                    this.tilesWanted[i].LODLevel ==
                        this.tilesDrawn[j].LODLevel &&
                    this.tilesDrawn[j].outdated != true
                ) {
                    matched = true
                    break
                }
            }
            for (let j = 0; j < this.tilesToBeDrawn.length; j++) {
                // If they match, hence it already exists, don't redraw
                if (
                    this.tilesWanted[i].x == this.tilesToBeDrawn[j].x &&
                    this.tilesWanted[i].y == this.tilesToBeDrawn[j].y &&
                    this.tilesWanted[i].z == this.tilesToBeDrawn[j].z &&
                    this.tilesWanted[i].isLODTile ==
                        this.tilesToBeDrawn[j].isLODTile &&
                    this.tilesWanted[i].LODLevel ==
                        this.tilesToBeDrawn[j].LODLevel
                ) {
                    matched = true
                    break
                }
            }
            // Not matched? Then we draw it
            if (!matched) {
                this.tilesToBeDrawn.push(this.tilesWanted[i])
            }
        }
        if (this.tilesToBeDrawn.length > 0) {
            // Should be wanted at time of pop
            const failCallback = () => {
                if (this.tilesToBeDrawn.length > 0) {
                    this.addTile(this.tilesToBeDrawn.pop(), failCallback).catch(
                        () => {
                            failCallback()
                        }
                    )
                }
            }
            this.addTile(this.tilesToBeDrawn.pop(), failCallback).catch(() => {
                failCallback()
            })
        }

        // See what tiles we need to remove and remove them
        if (
            (this.tilesToBeDrawn.length == 0 &&
                this.tilesBeingDrawn.length == 0) ||
            (false &&
                this.tilesWanted.length != this.tilesDrawn.length &&
                this.tilesBeingDrawn.length == 0)
        ) {
            for (let i = 0; i < this.tilesDrawn.length; i++) {
                let matched = false
                for (let j = 0; j < this.tilesWanted.length; j++) {
                    // If they match, hence it already exists, don't redraw
                    if (
                        this.tilesDrawn[i].x == this.tilesWanted[j].x &&
                        this.tilesDrawn[i].y == this.tilesWanted[j].y &&
                        this.tilesDrawn[i].z == this.tilesWanted[j].z &&
                        this.tilesDrawn[i].isLODTile ==
                            this.tilesWanted[j].isLODTile &&
                        this.tilesDrawn[i].LODLevel ==
                            this.tilesWanted[j].LODLevel
                    ) {
                        matched = true
                        break
                    }
                }
                //Not matched? Then we remove it
                if (!matched) {
                    this.removeTile(i, true)
                }
            }

            // Remove any tiles that have been marked as outdated
            // These would've been recreated to their updated state so
            // these here were just placeholders so the transition was smooth
            this.removeAllOutdatedTiles()
        }

        if (this.tilesToBeDrawn.length == 0) {
            if (!this.p._.firstLoad) {
                this.p._onFirstLoad()
            }
        }

        // Update load spinner and load percent if set
        const spinner = document.getElementById(this.p.options.loadingSpinnerId)
        const percent = document.getElementById(this.p.options.loadingPercentId)
        if (this.tilesToBeDrawn.length == 0) {
            if (spinner) spinner.style.opacity = '0'
        } else if (spinner && spinner.style.opacity == '0') {
            spinner.style.opacity = '1'
        }
        if (percent) percent.innerHTML = this.tilesToBeDrawn.length

        //Fade in existing tiles
        // Tile by default start at 0 opacity and increase until the set opacity
        this.fadeInTiles()
        //Fade out tilesDrawn that have fadeOutAndRemove set (by removeTile())
        this.fadeOutTiles()
    }

    // From the center latlng and zoom level, finds are tiles that should be visible in the scene
    updateDesiredTiles(): void {
        // Finding all the wanted tiles each time is simpler than also finding the difference
        this.tilesWanted = []

        // Get center lnglat and the radius of tiles we want
        const center = this.p.getCenter()
        let projectedXYZ = this.p.projection.latLngZ2TileXYZ(
            center.lat,
            center.lng,
            this.p.zoom
        )
        let xCenter = projectedXYZ.x
        let yCenter = projectedXYZ.y

        const r = this.p.options.radiusOfTiles

        // sqrt(d) = tile distance from center
        // used for sorting by distance later
        let d

        // Radius over a 2d array
        // Simply goes over the square size r*2 and checks to see if a spot is inside
        for (let x = xCenter - r + 1; x < xCenter + r; x++) {
            for (let y = yCenter - r + 1; y < yCenter + r; y++) {
                d = Math.pow(x - xCenter, 2) + Math.pow(y - yCenter, 2)
                if (d <= r * r) {
                    this.tilesWanted.push({
                        x: this.p.projection.tileMapResource.proj
                            ? // @ts-ignore
                              parseInt(x)
                            : Utils.mod(x, Math.pow(2, this.p.zoom)),
                        y: this.p.projection.tileMapResource.proj
                            ? // @ts-ignore
                              parseInt(y)
                            : Utils.mod(y, Math.pow(2, this.p.zoom)),
                        z: this.p.zoom,
                        d: d,
                        make: true,
                        isLODTile: false,
                    })
                }
            }
        }

        // And now LOD tiles
        // LOD is simple -- it just renders a higher(lower in number) zoom layer on a lower scene
        let lastZ = null
        if (this.p.options.useLOD) {
            for (let i = 0; i < this.p.options.LOD.length; i++) {
                const lr = this.p.options.LOD[i].radiusOfTiles //LOD radius
                const z = Math.max(
                    this.p._.minNativeZoom,
                    this.p.zoom - this.p.options.LOD[i].zoomsUp
                ) //zooms up zoom
                if (z == lastZ) break
                lastZ = z
                if (Math.abs(z - this.p.zoom) <= 1) continue

                projectedXYZ = this.p.projection.latLngZ2TileXYZ(
                    center.lat,
                    center.lng,
                    z
                )
                xCenter = projectedXYZ.x
                yCenter = projectedXYZ.y

                for (let x = xCenter - lr + 1; x < xCenter + lr; x++) {
                    for (let y = yCenter - lr + 1; y < yCenter + lr; y++) {
                        d = Math.pow(x - xCenter, 2) + Math.pow(y - yCenter, 2)
                        if (d <= lr * lr) {
                            this.tilesWanted.push({
                                x: this.p.projection.tileMapResource.proj
                                    ? // @ts-ignore
                                      parseInt(x)
                                    : Utils.mod(x, Math.pow(2, z)),
                                y: this.p.projection.tileMapResource.proj
                                    ? // @ts-ignore
                                      parseInt(y)
                                    : Utils.mod(y, Math.pow(2, z)),
                                z: z,
                                d: d,
                                make: true,
                                isLODTile: true,
                                LODLevel: i,
                            })
                        }
                    }
                }
            }
        }

        // Now sort them based on distance from look-at center so they
        // render radially out based on distance
        this.tilesWanted.sort((a, b) => b.d - a.d)

        // Based on how we found wanted tiles, they are already sorted in LOD
        // order (with LOD first). BUT since we sorted by distance (d),
        // we need to sort again
        this.tilesWanted.sort((a, b) => {
            const aLODLevel = a.isLODTile ? a.LODLevel : -1
            const bLODLevel = b.isLODTile ? b.LODLevel : -1
            return bLODLevel - aLODLevel
        })
    }

    async addTile(xyz: XYZLOD, failCallback?): Promise<any> {
        if (xyz === undefined) return

        // Both will need to happen to continue
        const tileLoaded = { raster: false, data: false }

        // t for tile
        // -1 because Three js planes take in segments between vertices and not vertices
        // i.e. a dimension of 1 would be two vertices O ----- O
        const t = new Mesh(
            new PlaneBufferGeometry(
                this._.tileDimension,
                this._.tileDimension,
                this.p.options.tileResolution - 1,
                this.p.options.tileResolution - 1
            ),
            new MeshBasicMaterial({
                visible: false,
            })
        )

        // State that we're in the process of drawing this tile
        this.tilesBeingDrawn.push({
            x: xyz.x,
            y: xyz.y,
            z: xyz.z,
            isLODTile: xyz.isLODTile,
            LODLevel: xyz.LODLevel,
            make: xyz.make,
        })

        // And make an empty drawn to populate
        this.tilesDrawn.push({
            x: xyz.x,
            y: xyz.y,
            z: xyz.z,
            isLODTile: xyz.isLODTile,
            LODLevel: xyz.LODLevel,
            t: t,
            contents: [],
            from: {
                dems: [],
                rasters: [],
                data: [],
            },
        })

        const onceTileLoaded = (destroy?: boolean) => {
            // Didn't work out; at least we gave them a shot
            if (destroy) {
                t.geometry.dispose()
                // @ts-ignore
                t.material.dispose()
                if (typeof failCallback === 'function') failCallback()
            }

            //Make sure both parts loaded
            if (tileLoaded.data) {
                const differentZoomTilesToRemove = []
                // If a lower zoom tile exists that this one covers, remove it
                // It's just a faster remove -- instead of checking to remove once
                // all new tiles are loaded

                if (this.p._.events._.lastZoomDelta <= 2) {
                    for (let i = this.tilesDrawn.length - 1; i >= 0; i--) {
                        if (
                            xyz.isLODTile == this.tilesDrawn[i].isLODTile &&
                            xyz.LODLevel == this.tilesDrawn[i].LODLevel
                        ) {
                            const drawnXYZ = [
                                this.tilesDrawn[i].x,
                                this.tilesDrawn[i].y,
                                this.tilesDrawn[i].z,
                            ]
                            const thisXYZ = [xyz.x, xyz.y, xyz.z]
                            if (xyz.z < this.tilesDrawn[i].z) {
                                if (
                                    Utils.tileIsContained(
                                        thisXYZ,
                                        drawnXYZ,
                                        true
                                    )
                                ) {
                                    differentZoomTilesToRemove.push(i)
                                }
                            } else if (xyz.z > this.tilesDrawn[i].z) {
                                if (Utils.tileIsContained(drawnXYZ, thisXYZ)) {
                                    this.tilesDrawn[i].contents.push(thisXYZ)
                                    if (
                                        this.tilesDrawn[i].contents.length >=
                                        Utils.tileContains(drawnXYZ, xyz.z)
                                            .length
                                    ) {
                                        differentZoomTilesToRemove.push(i)
                                    }
                                }
                            }
                        }
                    }
                }

                // Finally add the tile
                for (let i = this.tilesBeingDrawn.length - 1; i >= 0; i--) {
                    if (
                        this.tilesBeingDrawn[i].x == xyz.x &&
                        this.tilesBeingDrawn[i].y == xyz.y &&
                        this.tilesBeingDrawn[i].z == xyz.z &&
                        this.tilesBeingDrawn[i].isLODTile == xyz.isLODTile &&
                        this.tilesBeingDrawn[i].LODLevel == xyz.LODLevel
                    ) {
                        if (this.tilesBeingDrawn[i].make) {
                            // @ts-ignore
                            if (xyz.isLODTile) {
                                // @ts-ignore
                                this.p.planetsLOD[xyz.LODLevel].add(t)
                            } else {
                                this.p.planet.add(t)
                            }

                            // Now add the textures
                            // We no longer do this alongside the geometry because separating
                            // it out affords greater control over when to update what
                            this.updateRastersForTile(xyz)

                            differentZoomTilesToRemove.forEach((tileI) => {
                                this.removeTile(tileI, true)
                            })
                        } else {
                            t.geometry.dispose()
                            // @ts-ignore
                            t.material.dispose()
                            for (
                                let j = this.tilesDrawn.length - 1;
                                j >= 0;
                                j--
                            ) {
                                if (
                                    this.tilesDrawn[j].x == xyz.x &&
                                    this.tilesDrawn[j].y == xyz.y &&
                                    this.tilesDrawn[j].z == xyz.z &&
                                    this.tilesDrawn[i].isLODTile ==
                                        xyz.isLODTile &&
                                    this.tilesDrawn[i].LODLevel == xyz.LODLevel
                                ) {
                                    this.tilesDrawn.splice(j, 1)
                                }
                            }
                        }
                        this.tilesBeingDrawn.splice(i, 1)
                        return
                    }
                }
            }
        }

        const tileGeometry = (heightArr?: number[]) => {
            let cnt = 0
            const verts = Math.pow(this.p.options.tileResolution, 2)
            const colors = new Float32Array(verts * 3)

            if (heightArr == null) {
                heightArr = new Array(verts).fill(0)
            }

            //Keep picking heights until we get one that isn't an obvious no data value
            let centerHeight = 0
            const centerCnt = Math.floor(heightArr.length / 2)
            let counter = 0
            while (
                (centerHeight == null ||
                    centerHeight > this.p.projection.radiusOfPlanetMajor ||
                    centerHeight < -this.p.projection.radiusOfPlanetMajor) &&
                counter < heightArr.length
            ) {
                centerHeight = heightArr[centerCnt]
                counter++
            }

            const centerP =
                Math.floor(t.geometry.attributes.position.array.length / 6) * 3

            const tx =
                xyz.x +
                ((centerP / 3) % this.p.options.tileResolution) /
                    (this.p.options.tileResolution - 1)
            const ty =
                xyz.y +
                Math.floor(centerP / 3 / this.p.options.tileResolution) /
                    (this.p.options.tileResolution - 1)
            const projectedLL = this.p.projection.tileXYZ2LatLng(tx, ty, xyz.z)
            const tlat = projectedLL.lat
            const tlon = projectedLL.lng

            const centerLat = tlat

            const centerPos = this.p.projection.lonLatToVector3(
                tlon,
                tlat,
                centerHeight * this.p.options.exaggeration
            )

            t.position.set(centerPos.x, centerPos.y, centerPos.z)
            //4s because RGBA and 3s because xyz
            //No resampling if the plane is already 64x64
            if (t.geometry.attributes.position.array.length / 3 == verts) {
                let height = 0
                let xyzPos
                for (
                    let p = 0;
                    p < t.geometry.attributes.position.array.length;
                    p += 3
                ) {
                    height = heightArr[cnt] || 0
                    colors[p] = 0
                    colors[p + 1] = 0
                    colors[p + 2] = 0
                    if (height < -100000) {
                        height = -100000
                    }

                    const tx =
                        xyz.x +
                        ((p / 3) % this.p.options.tileResolution) /
                            (this.p.options.tileResolution - 1)
                    const ty =
                        xyz.y +
                        Math.floor(p / 3 / this.p.options.tileResolution) /
                            (this.p.options.tileResolution - 1)
                    const projectedLL = this.p.projection.tileXYZ2LatLng(
                        tx,
                        ty,
                        xyz.z,
                        xyz
                    )
                    let tlat = projectedLL.lat
                    const tlon = projectedLL.lng

                    //Prevent pole wrapping
                    if (this.p.zoom <= this.p._.zCutOff) {
                        if (centerLat > 75 && tlat < -88) {
                            tlat = 90
                        } else if (centerLat < -75 && tlat > 88) {
                            tlat = -90
                        }
                    }

                    xyzPos = this.p.projection.lonLatToVector3(
                        tlon,
                        tlat,
                        height * this.p.options.exaggeration
                    )
                    // @ts-ignore
                    t.geometry.attributes.position.array[p] =
                        xyzPos.x - centerPos.x
                    // @ts-ignore
                    t.geometry.attributes.position.array[p + 1] =
                        xyzPos.y - centerPos.y
                    // @ts-ignore
                    t.geometry.attributes.position.array[p + 2] =
                        xyzPos.z - centerPos.z

                    cnt += 1
                }

                //Tell THREE that these verts need updating
                t.geometry.attributes.position.needsUpdate = true

                //TODO t.geometry.verticesNeedUpdate = true
                //TODO t.geometry.computeFaceNormals()
                t.geometry.computeVertexNormals()
                t.geometry.computeBoundingSphere()

                t.geometry.setAttribute(
                    'customColor',
                    new BufferAttribute(colors, 3)
                )

                tileLoaded.data = true
                onceTileLoaded()
            }
        }

        // ==================== Load the Data tile ====================
        let loadDemTile = false

        let filledDemPath
        let layerI = null
        for (let i = this.p.layers.tile.length - 1; i >= 0; i--) {
            //Check if on and in right zoom range
            if (
                this.p.layers.tile[i].on &&
                ((xyz.z >= this.p.layers.tile[i].minZoom &&
                    xyz.z <= this.p.layers.tile[i].maxZoom &&
                    Utils.isInExtent(
                        xyz,
                        this.p.layers.tile[i].boundingBox,
                        this.p.projection
                    )) ||
                    this.p.layers.tile[i].path == '_vectorsastile_') //TODO: Check this vec as tile
            ) {
                layerI = i
                if (this.p.layers.tile[i].demPath != undefined) {
                    loadDemTile = true
                    // Find only the first valid dem
                    break
                }
            }
        }

        if (loadDemTile && layerI != null) {
            const builtDemPath = Paths.buildPath(
                this.p.layers.tile[layerI].format,
                this.p.layers.tile[layerI].demPath,
                xyz,
                this.p.projection,
                this.p.options.tileResolution,
                this.p.layers.tile[layerI].demFormatOptions,
                true
            )
            let heightArr = null
            if (builtDemPath)
                // Load is from are parsers and wraps potentially a bunch of tile formats
                heightArr = await load(
                    this.p.options.customParsers,
                    builtDemPath.path,
                    this.p.layers.tile[layerI],
                    builtDemPath.xyz,
                    this.p.options.tileResolution,
                    Math.pow(this.p.options.tileResolution, 2)
                ).catch(() => {})

            tileGeometry(heightArr || null)
        } else {
            //Make a flat (still curved to the globe) tile
            tileGeometry()
        }
    }

    findTileDrawnBasedOnUUID(uuid: string): any {
        let foundTile = null
        this.tilesDrawn.forEach((tile) => {
            if (tile.t.uuid === uuid) {
                foundTile = tile
                return
            }
        })
        return foundTile
    }

    findTileDrawnBasedOnXYZLOD(xyz: XYZLOD): any {
        let foundTile = null
        this.tilesDrawn.forEach((tile) => {
            if (
                tile.x === xyz.x &&
                tile.y === xyz.y &&
                tile.z === xyz.z &&
                tile.isLODTile === xyz.isLODTile &&
                tile.LODLevel == xyz.LODLevel
            ) {
                foundTile = tile
                return
            }
        })
        return foundTile
    }

    updateRastersForTile(xyz: XYZLOD): void {
        const tD = this.findTileDrawnBasedOnXYZLOD(xyz) //tD = tile drawn
        if (tD == null) return

        // Initialize a few state variables
        const textures = []
        // Raster textures either come from tiles layers or clamped vector layers
        const tileLayersComplete = new Array(this.p.layers.tile.length).fill(
            false
        )
        const clampedLayersComplete = new Array(
            this.p.layers.clamped.length
        ).fill(false)

        // A tile mesh renders multiple rasters blended together
        // Tile layers are joined at the pixel level -- not the geometry level
        const onceTexturesLoaded = () => {
            // Ensure that all textures are in fact loaded
            // LOD tiles don't get clamped rasters since it looks ugly
            if (
                tileLayersComplete.every(Boolean) &&
                (xyz.isLODTile || clampedLayersComplete.every(Boolean))
            ) {
                // And if there weren't any textures, just pass it through
                if (textures.length == 0) {
                    //Hide the tiles if no textures are found
                    tD.t.visible = false
                    return
                }
                // Otherwise sort them by index attached
                textures.sort((a, b) => a.i - b.i)
                tD.from.rasters = []

                // Make sure all clamped layers are above tiles layers
                let orderingI = 0
                for (let i = 0; i < textures.length; i++) {
                    if (textures[i].type == 'tile') {
                        tD.from.rasters.push({
                            name: textures[i].name,
                            type: textures[i].type,
                            texture: textures[i].texture,
                            opacity: textures[i].opacity,
                            isVAT: 0,
                            i: orderingI,
                        })
                        orderingI++
                    }
                }
                for (let i = 0; i < textures.length; i++) {
                    if (textures[i].type == 'clamped') {
                        tD.from.rasters.push({
                            name: textures[i].name,
                            type: textures[i].type,
                            texture: textures[i].texture,
                            opacity: textures[i].opacity,
                            isVAT: 1,
                            i: orderingI,
                        })
                        orderingI++
                    }
                }

                tD.t.material = Shaders.multiTexture(tD.from.rasters, true)

                if (this.p.options.wireframeMode) {
                    tD.t.material = new MeshBasicMaterial({
                        color: 0xffffff,
                        wireframe: true,
                    })
                }
                tD.t.material.needsUpdate = true
            }
        }

        // ==================== Load the Raster tile textures ====================
        for (let i = 0; i < this.p.layers.tile.length; i++) {
            //Check if on and in right zoom range
            if (
                this.p.layers.tile[i].on &&
                tD.z >= this.p.layers.tile[i].minZoom &&
                tD.z <= this.p.layers.tile[i].maxZoom &&
                Utils.isInExtent(
                    { x: tD.x, y: tD.y, z: tD.z },
                    this.p.layers.tile[i].boundingBox,
                    this.p.projection
                )
            ) {
                //Load the tile
                const builtPath = Paths.buildPath(
                    this.p.layers.tile[i].format,
                    this.p.layers.tile[i].path,
                    tD,
                    this.p.projection,
                    this.p.options.trueTileResolution,
                    this.p.layers.tile[i].formatOptions
                )
                if (builtPath) {
                    //Closure to save the index
                    ;((i) => {
                        this._.loader.load(
                            builtPath,
                            (texture) => {
                                //on success
                                texture.magFilter = NearestFilter
                                texture.minFilter = NearestFilter

                                //Attach the index to it so we know then intended order later
                                if (this.p.layers.tile[i])
                                    textures.push({
                                        name: this.p.layers.tile[i].name,
                                        type: 'tile',
                                        texture: texture,
                                        opacity: this.p.layers.tile[i].opacity,
                                        i: i,
                                    })
                                tileLayersComplete[i] = true
                                onceTexturesLoaded()
                            },
                            () => {
                                console.log('')
                            }, //in progress
                            () => {
                                //on error
                                tileLayersComplete[i] = true
                                onceTexturesLoaded()
                            }
                        )
                    })(i)
                } else {
                    tileLayersComplete[i] = true
                    onceTexturesLoaded()
                }
            } else {
                tileLayersComplete[i] = true
                onceTexturesLoaded()
            }
        }

        // =============== Generate the Raster clamped textures =============

        // LOD tiles don't get clamped rasters since it looks ugly
        if (!xyz.isLODTile) {
            for (let i = 0; i < this.p.layers.clamped.length; i++) {
                /*
            console.log( 'on:', this.p.layers.clamped[i].on)
            console.log( 'minZoom:', this.p.layers.clamped[i].minZoom)
            console.log( 'z >= minz:', tD.z >= this.p.layers.clamped[i].minZoom)
            console.log( 'maxZoom:', this.p.layers.clamped[i].maxZoom)
            console.log( 'z <= maxz:', tD.z <= this.p.layers.clamped[i].maxZoom)
            console.log( 'bbox:', this.p.layers.clamped[i].boundingBox )
            console.log( 'inExt:', Utils.isInExtent(
                        { x: tD.x, y: tD.y, z: tD.z },
                        this.p.layers.clamped[i].boundingBox,
                        this.p.projection
                    )))
                    */
                //Check if on and in right zoom range
                if (
                    this.p.layers.clamped[i].on &&
                    (this.p.layers.clamped[i].minZoom == null ||
                        tD.z >= this.p.layers.clamped[i].minZoom) &&
                    (this.p.layers.clamped[i].maxZoom == null ||
                        tD.z <= this.p.layers.clamped[i].maxZoom) &&
                    (this.p.layers.clamped[i].boundingBox == null ||
                        Utils.isInExtent(
                            { x: tD.x, y: tD.y, z: tD.z },
                            this.p.layers.clamped[i].boundingBox,
                            this.p.projection
                        ))
                ) {
                    //Load the tile
                    const clampedTexture = this.p.layers._.layerers.clamped.getClampedTexture(
                        i,
                        { x: tD.x, y: tD.y, z: tD.z }
                    )
                    tD.contains = tD.contains || {}
                    tD.contains[this.p.layers.clamped[i].name] =
                        clampedTexture.features

                    const texture = new CanvasTexture(clampedTexture.canvas)

                    texture.magFilter = NearestFilter
                    texture.minFilter = NearestFilter

                    //Attach the index to it so we know then intended order later
                    if (this.p.layers.clamped[i])
                        textures.push({
                            name: this.p.layers.clamped[i].name,
                            type: 'clamped',
                            texture: texture,
                            opacity: this.p.layers.clamped[i].opacity,
                            i: i,
                        })
                    clampedLayersComplete[i] = true
                    onceTexturesLoaded()
                } else {
                    clampedLayersComplete[i] = true
                    onceTexturesLoaded()
                }
            }
        }
    }

    // tD = tileDrawn as always
    updateClampedRasterForTile(tD, layerName) {
        // Don't update if this mode is on or is LOD
        if (this.p.options.wireframeMode || tD.isLODTile) return

        let clampedLayerI = null
        for (let i = 0; i < this.p.layers.clamped.length; i++) {
            //Check if on and in right zoom range
            if (this.p.layers.clamped[i].name === layerName) {
                clampedLayerI = i
                break
            }
        }

        const clampedLayer =
            clampedLayerI != null ? this.p.layers.clamped[clampedLayerI] : null

        if (
            clampedLayer &&
            clampedLayer.on &&
            (clampedLayer.minZoom == null || tD.z >= clampedLayer.minZoom) &&
            (clampedLayer.maxZoom == null || tD.z <= clampedLayer.maxZoom) &&
            (clampedLayer.boundingBox == null ||
                Utils.isInExtent(
                    { x: tD.x, y: tD.y, z: tD.z },
                    clampedLayer.boundingBox,
                    this.p.projection
                ))
        ) {
            // Load the tile
            const clampedTexture = this.p.layers._.layerers.clamped.getClampedTexture(
                clampedLayerI,
                { x: tD.x, y: tD.y, z: tD.z }
            )
            tD.contains = tD.contains || {}
            tD.contains[this.p.layers.clamped[clampedLayerI].name] =
                clampedTexture.features

            const texture = new CanvasTexture(clampedTexture.canvas)

            texture.magFilter = NearestFilter
            texture.minFilter = NearestFilter

            for (let i = 0; i < tD.from.rasters.length; i++) {
                if (tD.from.rasters[i].name === layerName) {
                    tD.from.rasters[i].texture = texture
                    break
                }
            }
            tD.t.material = Shaders.multiTexture(tD.from.rasters)
            tD.t.material.needsUpdate = true
        }
    }

    updateAllRasters(): void {
        this.killDrawingTiles()
        //Remove all tiles so that they'll be recreated
        const startingLength = this.tilesDrawn.length
        for (let j = 0; j < startingLength; j++) {
            const tD = this.tilesDrawn[j]
            this.updateRastersForTile({
                x: tD.x,
                y: tD.y,
                z: tD.z,
                isLODTile: tD.isLODTile,
                LODLevel: tD.LODLevel,
            })
        }
    }

    removeTile(i: number, shouldFadeOut?: boolean): void {
        if (this.tilesDrawn[i]) {
            // [false] shouldFadeOut works but for some reason the center tiles blacken
            //         briefly after everything loads. So off for now
            if (shouldFadeOut) {
                this.tilesDrawn[i].fadeOutAndRemove = true
                // Note that we aren't removing it for tilesDrawn just yet
                // The fade out function will handle the true remove
            } else {
                // Remove immediately
                this.tilesDrawn[i].t.geometry.dispose()
                this.tilesDrawn[i].t.material.dispose()
                if (this.tilesDrawn[i].isLODTile)
                    this.p.planetsLOD[this.tilesDrawn[i].LODLevel].remove(
                        this.tilesDrawn[i].t
                    )
                else this.p.planet.remove(this.tilesDrawn[i].t)
                // Add say it's no longer drawn
                this.tilesDrawn.splice(i, 1)
            }
        }
    }

    removeAllTiles(): void {
        this.killDrawingTiles()
        //Remove all tiles so that they'll be recreated
        for (let j = 0; j < this.tilesDrawn.length; j++) {
            this.removeTile(0)
        }
    }

    // Specify that all tilesDrawn need an update
    outdateAllTiles(): void {
        this.killDrawingTiles()
        this.tilesDrawn.forEach((tile) => {
            tile.outdated = true
        })
    }

    removeAllOutdatedTiles(): void {
        let outdatedTileIndices = []
        this.tilesDrawn.forEach((t, i) => {
            if (t.outdated) outdatedTileIndices.push(i)
        })
        // descending order to play nicely with the splice function in removeTil
        outdatedTileIndices = outdatedTileIndices.sort().reverse()

        outdatedTileIndices.forEach((i) => {
            this.removeTile(i)
        })
    }

    removeTileXYZ(xyz: XYZ): void {
        for (const t in this.tilesDrawn) {
            if (
                this.tilesDrawn[t].x == xyz.x &&
                this.tilesDrawn[t].y == xyz.y &&
                this.tilesDrawn[t].z == xyz.z
            ) {
                this.tilesDrawn[t].t.geometry.dispose()
                this.tilesDrawn[t].t.material.dispose()
                if (this.tilesDrawn[t].isLODTile)
                    this.p.planetsLOD[this.tilesDrawn[t].LODLevel].remove(
                        this.tilesDrawn[t].t
                    )
                else this.p.planet.remove(this.tilesDrawn[t].t)
                this.tilesDrawn.splice(t, 1)
            }
        }
    }
    killDrawingTiles(): void {
        for (const t in this.tilesToBeDrawn) {
            this.tilesToBeDrawn[t].make = false
        }
        for (const t in this.tilesBeingDrawn) {
            this.tilesBeingDrawn[t].make = false
        }
    }

    // Will also need to set initial multi-shader uniform opacity to 0
    fadeInTiles(): void {
        for (const m in this.tilesDrawn) {
            if (!this.tilesDrawn[m].fadeOutAndRemove)
                for (const n in this.tilesDrawn[m].from.rasters) {
                    if (
                        this.tilesDrawn[m] &&
                        this.tilesDrawn[m].t &&
                        this.tilesDrawn[m].t.material.hasOwnProperty('uniforms')
                    ) {
                        const layer = this.p.layers.getLayerByName(
                            this.tilesDrawn[m].from.rasters[n].name
                        )
                        if (layer) {
                            const desiredOpacity = layer.opacity
                            const currentOpacity = this.tilesDrawn[m].t.material
                                .uniforms['tA' + n].value
                            if (desiredOpacity > currentOpacity) {
                                this.tilesDrawn[m].t.material.uniforms[
                                    'tA' + n
                                ].value = Math.min(
                                    this.tilesDrawn[m].t.material.uniforms[
                                        'tA' + n
                                    ].value + 0.07,
                                    desiredOpacity
                                )
                            } else {
                                this.tilesDrawn[m].t.material.uniforms[
                                    'tA' + n
                                ].value = Math.max(
                                    this.tilesDrawn[m].t.material.uniforms[
                                        'tA' + n
                                    ].value - 0.07,
                                    desiredOpacity
                                )
                            }
                        }
                    }
                }
        }
    }

    fadeOutTiles(): void {
        // iterate backwards to avoid skips
        for (let i = this.tilesDrawn.length - 1; i >= 0; i--) {
            if (this.tilesDrawn[i].fadeOutAndRemove) {
                for (
                    let n = 0;
                    this.tilesDrawn[i] &&
                    n < this.tilesDrawn[i].from.rasters.length;
                    n++
                ) {
                    if (
                        this.tilesDrawn[i] &&
                        this.tilesDrawn[i].t &&
                        this.tilesDrawn[i].t.material.hasOwnProperty(
                            'uniforms'
                        ) &&
                        this.tilesDrawn[i].t.material.uniforms['tA' + n] != null
                    ) {
                        const nextOpacity = Math.max(
                            this.tilesDrawn[i].t.material.uniforms['tA' + n]
                                .value - 0.07,
                            0
                        )
                        if (nextOpacity <= 0) this.removeTile(i)
                        else {
                            this.tilesDrawn[i].t.material.uniforms[
                                'tA' + n
                            ].value = nextOpacity
                        }
                    } else {
                        // Can't fade
                        this.removeTile(i)
                    }
                }
            }
        }
    }
}
