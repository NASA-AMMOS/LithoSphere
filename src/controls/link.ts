import { Corners } from '../generalTypes'
import { Object3D, BufferGeometry, MeshBasicMaterial, Mesh } from 'three'
import Sprites from '../secondary/sprites'

interface Private {
    linkPanned: boolean
    linkPannedTimeout: any
    targetPoint: Object3D
}

export default class Link {
    _: Private
    // parent
    p: any
    name: string
    params: object
    corner: Corners
    isLinked: boolean

    constructor(parent: any, name: string, params?: object) {
        this.p = parent
        this.name = name
        this.params = params || {}
        this._ = {
            linkPanned: false,
            linkPannedTimeout: null,
        }
        this.corner = Corners.TopLeft

        this.return = {
            isLinked: params.initiallyLinked || false,
            linkMove: this.linkMove, //(lng, lat, zoom)
            linkMouseMove: this.linkMouseMove, //(lng, lat)
            linkMouseOut: this.linkMouseOut,
        }
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_link_root' title='Link' style='width: 26px; height: 26px; color: ${this.return.isLinked ? 'black' : 'white'}; background: ${this.return.isLinked ? '#FBC02D' : 'black'}; font-size: 24px; line-height: 27px; text-align: center; cursor: pointer;'>`,
                '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                    '<path fill="currentColor" d="M10.59,13.41C11,13.8 11,14.44 10.59,14.83C10.2,15.22 9.56,15.22 9.17,14.83C7.22,12.88 7.22,9.71 9.17,7.76V7.76L12.71,4.22C14.66,2.27 17.83,2.27 19.78,4.22C21.73,6.17 21.73,9.34 19.78,11.29L18.29,12.78C18.3,11.96 18.17,11.14 17.89,10.36L18.36,9.88C19.54,8.71 19.54,6.81 18.36,5.64C17.19,4.46 15.29,4.46 14.12,5.64L10.59,9.17C9.41,10.34 9.41,12.24 10.59,13.41M13.41,9.17C13.8,8.78 14.44,8.78 14.83,9.17C16.78,11.12 16.78,14.29 14.83,16.24V16.24L11.29,19.78C9.34,21.73 6.17,21.73 4.22,19.78C2.27,17.83 2.27,14.66 4.22,12.71L5.71,11.22C5.7,12.04 5.83,12.86 6.11,13.65L5.64,14.12C4.46,15.29 4.46,17.19 5.64,18.36C6.81,19.54 8.71,19.54 9.88,18.36L13.41,14.83C14.59,13.66 14.59,11.76 13.41,10.59C13,10.2 13,9.56 13.41,9.17Z" />',
                '</svg>',
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document
            .getElementById('_lithosphere_control_link_root')
            .addEventListener('click', () => {
                this.return.isLinked = !this.return.isLinked

                const linkRoot = document.getElementById(
                    '_lithosphere_control_link_root'
                )

                if (this.return.isLinked) {
                    linkRoot.style.background = '#FBC02D'
                    linkRoot.style.color = 'black'
                } else {
                    linkRoot.style.background = 'black'
                    linkRoot.style.color = 'white'
                }

                if (typeof this.params.onToggle === 'function') {
                    this.params.onToggle(this.return.isLinked)
                }
            })
    }

    getReturn = (): any => {
        return this.return
    }

    onMove = (lng, lat, height): void => {
        if (this.return.isLinked) {
            if (typeof this.params.onMove === 'function') {
                this._.linkPanned = true
                this.params.onMove(lng, lat, height)
                clearTimeout(this._.linkPannedTimeout)
                this._.linkPannedTimeout = setTimeout(() => {
                    this._.linkPanned = false
                }, 500)
            }
        }
    }

    onMouseMove = (lng, lat, height): void => {
        if (this.return.isLinked) {
            if (typeof this.params.onMouseMove === 'function') {
                this.params.onMouseMove(lng, lat, height)
            }
        }
    }
    onMouseOut = (): void => {
        if (this.return.isLinked) {
            if (typeof this.params.onMouseOut === 'function') {
                this.params.onMouseOut()
            }
        }
    }
    onFirstPersonUpdate = (): void => {
        if (typeof this.params.onFirstPersonUpdate === 'function') {
            this.params.onFirstPersonUpdate()
        }
    }
    onOrbitalUpdate = (): void => {
        if (typeof this.params.onOrbitalUpdate === 'function') {
            this.params.onOrbitalUpdate()
        }
    }

    setLink = (latlng, style, spriteId): void => {
        if (!this.p._.wasInitialized) return

        if (this._.targetPoint != null)
            this.p.frontGroup.remove(this._.targetPoint)
        if (latlng == null) return

        const geometry = new BufferGeometry()
        const material = new MeshBasicMaterial({ color: 0x00ff00 })
        this._.targetPoint = new Mesh(geometry, material)
        const elev = this.p.getElevationAtLngLat(latlng.lng, latlng.lat)
        if (elev == 0) return

        const pos = this.p.projection.lonLatToVector3(
            latlng.lng,
            latlng.lat,
            (elev + 0.4) * this.p.options.exaggeration
        )

        style = style || {
            radius: 8,
            fillColor: { r: 0, g: 255, b: 0, a: 0.7 },
            weight: 2,
            color: 'rgb(0,255,0)',
        }
        if (spriteId == null) spriteId = 'linkTargetPoint'

        const sprite = Sprites.makeMarkerSprite(style, spriteId)
        sprite.style = style

        // @ts-ignore
        this._.targetPoint.attenuate = true

        this._.targetPoint.position.set(pos.x, pos.y, pos.z)
        this._.targetPoint.add(sprite)
        this.p.frontGroup.add(this._.targetPoint)
        this.p._.events._attenuate()
        this.p._.events._refreshFrontGroupRotation()
    }

    linkMove = (lng: number, lat: number): void => {
        if (this.return.isLinked && !this._.linkPanned)
            this.p.setCenter({ lat: lat, lng: lng, z: 0 }, true)
    }
    linkMouseMove = (lng: number, lat: number): void => {
        if (this.return.isLinked) this.setLink({ lat: lat, lng: lng })
    }
    linkMouseOut = (): void => {
        this.setLink()
    }
}
