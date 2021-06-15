import { Corners } from '../generalTypes.d.ts'

interface Private {}

interface Params {
    // If set, coordinates will be sent to this div instead of setting its own
    existingDivId?: string
}

export default class Coordinates {
    _: Private
    // parent
    p: any
    name: string
    params: Params
    corner: Corners

    constructor(parent: any, name: string, params?: object) {
        this.p = parent
        this.name = name
        this.params = params || {}
        this._ = {}
        this.corner = Corners.BottomRight
    }

    getControl = (): string => {
        const style = `${
            this.params.existingDivId != null ? 'display: none; ' : ''
        }background: black; padding: 5px; font-size: 14px;`
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_coordinate_root' title='Longitude, Latitude, Elevation' style='${style}'>`,
            "</div>" ].join('');
    }

    attachEvents = (): void => {}

    onUpdate = (): void => {
        if (!this.p._.mouseIsInScene && !this.p._.cameras.isFirstPerson) return
        this.updateMouseCoords()
    }

    private updateMouseCoords = (): void => {
        let newVal = 'Outer Space'
        if (this.p.mouse.lat != null && this.p.mouse.lng != null) {
            const unit = '&deg;'
            newVal = `${this.p.mouse.lng.toFixed(
                8
            )}${unit}, ${this.p.mouse.lat.toFixed(
                8
            )}${unit}, ${this.p.mouse.elev.toFixed(3)}m`
        }

        const coords = document.getElementById(
            '_lithosphere_control_coordinate_root'
        )
        if (coords && coords.innerHTML != newVal) coords.innerHTML = newVal

        if (this.params.existingDivId != null) {
            const existingDiv = document.getElementById(
                this.params.existingDivId
            )
            if (existingDiv && existingDiv.innerHTML != newVal)
                existingDiv.innerHTML = newVal
        }
    }
}
