import { Corners, ControlType } from '../generalTypes'

import Compass from './compass'
import Coordinates from './coordinates'
import Home from './home'
import Layers from './layers'
import Exaggerate from './exaggerate'
import Observe from './observe'
import Walk from './walk'
import Link from './link'

/*
import Controls from './controls'
*/

export default class Controls {
    // parent
    p: any
    controlContainer: HTMLElement
    corners: {
        TopLeft: HTMLElement
        TopRight: HTMLElement
        BottomLeft: HTMLElement
        BottomRight: HTMLElement
    }
    activeControls: any
    compass: any
    coordinates: any
    home: any
    layers: any
    exaggerate: any
    observe: any
    walk: any
    link: any

    /*
    controls: Controls
    */

    constructor(parent: any) {
        this.p = parent
        this.activeControls = {}

        this.controlContainer = document.createElement('div')
        this.controlContainer.setAttribute('id', '_lithosphere_controls')
        this.controlContainer.style.position = 'absolute'
        this.controlContainer.style.top = '0'
        this.controlContainer.style.left = '0'
        this.controlContainer.style.width = '100%'
        this.controlContainer.style.height = '100%'
        this.controlContainer.style.pointerEvents = 'none'
        this.controlContainer.style.color = 'white'
        this.controlContainer.style.fontFamily = 'sans-serif'
        this.controlContainer.style.zIndex = '1000'
        this.p._.container.appendChild(this.controlContainer)

        this.corners = {
            TopLeft: null,
            TopRight: null,
            BottomLeft: null,
            BottomRight: null,
        }

        const margin = '10px'
        // TopLeft
        this.corners.TopLeft = document.createElement('div')
        this.corners.TopLeft.setAttribute('id', '_lithosphere_controls_topleft')
        this.corners.TopLeft.style.position = 'absolute'
        this.corners.TopLeft.style.top = margin
        this.corners.TopLeft.style.left = margin
        this.corners.TopLeft.style.pointerEvents = 'all'
        this.corners.TopLeft.style.display = 'flex'
        this.corners.TopLeft.style.flexFlow = 'column'
        this.controlContainer.appendChild(this.corners.TopLeft)

        // TopRight
        this.corners.TopRight = document.createElement('div')
        this.corners.TopRight.setAttribute(
            'id',
            '_lithosphere_controls_topright'
        )
        this.corners.TopRight.style.position = 'absolute'
        this.corners.TopRight.style.top = margin
        this.corners.TopRight.style.right = margin
        this.corners.TopRight.style.pointerEvents = 'all'
        this.corners.TopRight.style.display = 'flex'
        this.controlContainer.appendChild(this.corners.TopRight)

        // BottomLeft
        this.corners.BottomLeft = document.createElement('div')
        this.corners.BottomLeft.setAttribute(
            'id',
            '_lithosphere_controls_bottomleft'
        )
        this.corners.BottomLeft.style.position = 'absolute'
        this.corners.BottomLeft.style.bottom = margin
        this.corners.BottomLeft.style.left = margin
        this.corners.BottomLeft.style.pointerEvents = 'all'
        this.corners.BottomLeft.style.display = 'flex'
        this.controlContainer.appendChild(this.corners.BottomLeft)

        // BottomRight
        this.corners.BottomRight = document.createElement('div')
        this.corners.BottomRight.setAttribute(
            'id',
            '_lithosphere_controls_bottomright'
        )
        this.corners.BottomRight.style.position = 'absolute'
        this.corners.BottomRight.style.bottom = margin
        this.corners.BottomRight.style.right = margin
        this.corners.BottomRight.style.pointerEvents = 'all'
        this.corners.BottomRight.style.display = 'flex'
        this.controlContainer.appendChild(this.corners.BottomRight)

        // Premade controls
        this.compass = Compass
        this.coordinates = Coordinates
        this.home = Home
        this.layers = Layers
        this.exaggerate = Exaggerate
        this.observe = Observe
        this.walk = Walk
        this.link = Link
        /*
        this.controls = Controls
        */
    }

    addControl = (
        name: string,
        control: any,
        params?: object,
        corner?: Corners
    ): any => {
        // Prevent duplicates
        if (this.activeControls[name] != null) {
            console.warn(
                `UI Control control with identifying name '${name}' already exists. Remove the existing one or pick a different name to add this control.`
            )
            return
        }
        try {
            this.activeControls[name] = new control(this.p, name, params)
        } catch (err) {
            if (this.activeControls[name] != null)
                delete this.activeControls[name]
            console.warn(`Error adding UI Element with name '${name}' -`, err)
            return
        }
        // Prefer parameter corner, else control's default corner, else use top left
        corner = corner || this.activeControls[name].corner || Corners.TopLeft

        const newControl = document.createElement('div')
        newControl.setAttribute('id', `_lithosphere_control_${name}`)
        newControl.innerHTML = this.activeControls[name].getControl()
        newControl.style.marginRight = '5px'
        if (corner === Corners.TopLeft || corner === Corners.TopRight)
            newControl.style.marginBottom = '5px'

        this.corners[corner].appendChild(newControl)

        this.activeControls[name].attachEvents()

        if (this.activeControls[name].getReturn) {
            return this.activeControls[name].getReturn()
        }
    }
    removeControl = (name): void => {
        delete this.activeControls[name]
        document.getElementById(`_lithosphere_control_${name}`).remove()
    }

    // Called in LithoSphere's update function
    _onUpdateEvent = (): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onUpdate === 'function') control.onUpdate()
        })
    }

    _onMove = (lng, lat, height): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onMove === 'function')
                control.onMove(lng, lat, height)
        })
    }

    _onMouseMove = (lng, lat, height): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onMouseMove === 'function')
                control.onMouseMove(lng, lat, height)
        })
    }

    _onMouseOut = (e): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onMouseOut === 'function') control.onMouseOut(e)
        })
    }
    _onFirstPersonUpdate = (): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onFirstPersonUpdate === 'function')
                control.onFirstPersonUpdate()
        })
    }
    _onOrbitalUpdate = (e): void => {
        Object.values(this.activeControls).forEach((control: ControlType) => {
            if (typeof control.onOrbitalUpdate === 'function')
                control.onOrbitalUpdate(e)
        })
    }
}
