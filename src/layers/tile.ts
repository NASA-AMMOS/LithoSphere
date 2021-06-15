export default class TileLayerer {
    // parent
    p: any

    constructor(parent: any) {
        this.p = parent
    }

    add = (layerObj): void => {
        if (!this.p.p._.wasInitialized) return

        this.p.p._.tiledWorld.killDrawingTiles()
        let alreadyExists = false
        if (
            layerObj.hasOwnProperty('name') &&
            layerObj.hasOwnProperty('on') &&
            layerObj.hasOwnProperty('path') &&
            layerObj.hasOwnProperty('opacity') &&
            layerObj.hasOwnProperty('minZoom') &&
            layerObj.hasOwnProperty('maxZoom')
        ) {
            for (let i = 0; i < this.p.tile.length; i++) {
                if (this.p.tile[i].hasOwnProperty('name')) {
                    if (this.p.tile[i].name == layerObj.name) {
                        this.p.tile[i] = layerObj
                        alreadyExists = true
                        break
                    }
                }
            }
            if (!alreadyExists) {
                this.p.tile.push(layerObj)
                this.p.tile.sort((a, b) => a.order - b.order)
            }
            //Remove all tiles so that they'll be recreated
            if (
                this.p.p.zoom >= layerObj.minZoom &&
                this.p.p.zoom <= layerObj.maxZoom
            ) {
                this.p.p._.tiledWorld.removeAllTiles()
            }
            this.p.p._.maxZoom = this.p.findHighestMaxZoom()
            this.p.p._.minNativeZoom = this.p.findLowestMinZoom()
        } else {
            console.warn('Attempted to add an invalid tile layer.')
        }
    }

    toggle = (name: string, on?: boolean): boolean => {
        if (!this.p.p._.wasInitialized) return false

        let foundMatch = false
        this.p.tile.forEach((t) => {
            if (name === t.name) {
                t.on = on != null ? on : !t.on
                foundMatch = true
            }
        })

        if (foundMatch) {
            this.p.p._.tiledWorld.outdateAllTiles()
            this.p.p._.maxZoom = this.p.findHighestMaxZoom()
            this.p.p._.minNativeZoom = this.p.findLowestMinZoom()
            return true
        }
        return false
    }

    setOpacity = (name: string, opacity: number): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.tile.length; i++) {
            if (this.p.tile[i].hasOwnProperty('name')) {
                if (this.p.tile[i].name == name) {
                    this.p.tile[i].opacity = opacity
                    return true
                }
            }
        }
        return false
    }

    remove = (name: string): boolean => {
        if (!this.p.p._.wasInitialized) return false

        for (let i = 0; i < this.p.tile.length; i++) {
            if (this.p.tile[i].hasOwnProperty('name')) {
                if (this.p.tile[i].name == name) {
                    this.p.p._.tiledWorld.killDrawingTiles()
                    if (
                        this.p.p.zoom >= this.p.tile[i].minZoom &&
                        this.p.p.zoom <= this.p.tile[i].maxZoom
                    ) {
                        const startingLength = this.p.p._.tiledWorld.tilesDrawn
                            .length
                        for (let j = 0; j < startingLength; j++) {
                            this.p.p._.tiledWorld.removeTile(0)
                        }
                    }
                    this.p.tile.splice(i, 1)
                    this.p.p._.maxZoom = this.p.findHighestMaxZoom()
                    this.p.p._.minNativeZoom = this.p.findLowestMinZoom()
                    return true
                }
            }
        }
        return false
    }
}
