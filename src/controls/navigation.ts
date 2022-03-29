import { Corners } from '../generalTypes.d.ts'

import './navigation.css'

interface Private {}

export default class Navigation {
    _: Private
    // parent
    p: any
    name: string
    corner: Corners

    constructor(parent: any, name: string) {
        this.p = parent
        this.name = name
        this._ = {}
        this.corner = Corners.TopRight
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_navigation_root'>`,
                `<div id='_lithosphere_control_navigation_spin_root'>`,
                    "<div id='_lithosphere_control_navigation_spin' style='padding: 0px 5px 0px 13px; user-select: none; display: flex;'>",
                        `<svg viewBox="0 0 24 24">`,
                            `<path fill="currentColor" d="M10,12L14,16L10,20V16.9C5.44,16.44 2,14.42 2,12C2,9.58 5.44,7.56 10,7.1V9.09C6.55,9.43 4,10.6 4,12C4,13.4 6.55,14.57 10,14.91V12M20,12C20,10.6 17.45,9.43 14,9.09V7.1C18.56,7.56 22,9.58 22,12C22,14.16 19.26,16 15.42,16.7L16.12,16L14.92,14.79C17.89,14.36 20,13.27 20,12M11,2H13V13L11,11V2M11,22V21L13,19V22H11Z" />`,
                        `</svg>`,
                        "<div style='padding-left: 4px;'>spin</div>",
                    "</div>",
                    "<div class='_lithosphere_control_navigation_panel'>",
                        "<div id='_lithosphere_control_navigation_spin_left'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M15.41,16.58L10.83,12L15.41,7.41L14,6L8,12L14,18L15.41,16.58Z" />`,
                            `</svg>`,
                        "</div>",
                        "<div id='_lithosphere_control_navigation_spin_right'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M8.59,16.58L13.17,12L8.59,7.41L10,6L16,12L10,18L8.59,16.58Z" />`,
                            `</svg>`,
                        "</div>",
                    "</div>",
                `</div>`,
                `<div id='_lithosphere_control_navigation_dolly_root'>`,  
                    "<div id='_lithosphere_control_navigation_dolly' style='padding: 0px 5px 0px 16px; user-select: none; display: flex;'>",
                        `<svg viewBox="0 0 24 24">`,
                            `<path fill="currentColor" d="M12 10H9.09C9.43 6.55 10.6 4 12 4S14.57 6.55 14.91 10H16.9C16.44 5.44 14.42 2 12 2S7.56 5.44 7.1 10H4L8 14L12 10M12 20C10.73 20 9.64 17.89 9.21 14.92L8 16.12L7.3 15.42C8 19.26 9.84 22 12 22C14.42 22 16.44 18.56 16.9 14H14.91C14.57 17.45 13.4 20 12 20M22 11H13L11 13H22V11M2 13H5L3 11H2V13" />`,
                        `</svg>`,
                        "<div style='padding-left: 4px;'>tilt</div>",
                    "</div>",
                    "<div class='_lithosphere_control_navigation_panel'>",
                        "<div id='_lithosphere_control_navigation_dolly_up'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M7.41,15.41L12,10.83L16.59,15.41L18,14L12,8L6,14L7.41,15.41Z" />`,
                            `</svg>`,
                        "</div>",
                        "<div id='_lithosphere_control_navigation_dolly_down'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M7.41,8.58L12,13.17L16.59,8.58L18,10L12,16L6,10L7.41,8.58Z" />`,
                            `</svg>`,
                        "</div>",
                    "</div>",
                `</div>`,
                `<div id='_lithosphere_control_navigation_pan_root'>`,
                    "<div id='_lithosphere_control_navigation_pan'  style='padding: 0px 5px 0px 15px; user-select: none; display: flex;'>",
                        `<svg viewBox="0 0 24 24">`,
                            `<path fill="currentColor" d="M12,2.5L8,7H16L12,2.5M7,8L2.5,12L7,16V8M17,8V16L21.5,12L17,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M8,17L12,21.5L16,17H8Z" />`,
                        `</svg>`,
                        "<div style='padding-left: 4px;'>pan</div>",
                    "</div>",
                    "<div class='_lithosphere_control_navigation_panel'>",
                        "<div id='_lithosphere_control_navigation_pan_up'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M12,2.5L8,7H16L12,2.5M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />`,
                            `</svg>`,
                        "</div>",
                        "<span style='display: flex;'>",
                            "<div id='_lithosphere_control_navigation_pan_left'>",
                                `<svg viewBox="0 0 24 24">`,
                                    `<path fill="currentColor" d="M7,8L2.5,12L7,16V8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />`,
                                `</svg>`,
                            "</div>",
                            "<div id='_lithosphere_control_navigation_pan_right'>",
                                `<svg viewBox="0 0 24 24">`,
                                    `<path fill="currentColor" d="M17,8V16L21.5,12L17,8M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10Z" />`,
                                `</svg>`,
                            "</div>",
                        "</span>",
                        "<div id='_lithosphere_control_navigation_pan_down'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M12,10A2,2 0 0,0 10,12A2,2 0 0,0 12,14A2,2 0 0,0 14,12A2,2 0 0,0 12,10M8,17L12,21.5L16,17H8Z" />`,
                            `</svg>`,
                        "</div>",
                    "</div>",
                `</div>`,
                `<div id='_lithosphere_control_navigation_zoom_root'>`,
                    "<div id='_lithosphere_control_navigation_zoom' style='padding: 0px 5px 0px 9px; user-select: none; display: flex;'>",
                        `<svg viewBox="0 0 24 24">`,
                            `<path fill="currentColor" d="M9.5,3A6.5,6.5 0 0,1 16,9.5C16,11.11 15.41,12.59 14.44,13.73L14.71,14H15.5L20.5,19L19,20.5L14,15.5V14.71L13.73,14.44C12.59,15.41 11.11,16 9.5,16A6.5,6.5 0 0,1 3,9.5A6.5,6.5 0 0,1 9.5,3M9.5,5C7,5 5,7 5,9.5C5,12 7,14 9.5,14C12,14 14,12 14,9.5C14,7 12,5 9.5,5Z" />`,
                        `</svg>`,
                        "<div style='padding-left: 4px;'>zoom</div>",
                    '</div>',
                    "<div class='_lithosphere_control_navigation_panel'>",
                        "<div id='_lithosphere_control_navigation_zoom_in'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M19,13H13V19H11V13H5V11H11V5H13V11H19V13Z" />`,
                            `</svg>`,
                        "</div>",
                        "<div id='_lithosphere_control_navigation_zoom_out'>",
                            `<svg viewBox="0 0 24 24">`,
                                `<path fill="currentColor" d="M19,13H5V11H19V13Z" />`,
                            `</svg>`,
                        "</div>",
                    "</div>",
                `</div>`,
            `</div>` ].join('\n');
    }

    attachEvents = (): void => {
        // Spin
        document
            .getElementById('_lithosphere_control_navigation_spin')
            .addEventListener('click', (e) => {
                document
                    .querySelector(
                        '#_lithosphere_control_navigation_spin_root ._lithosphere_control_navigation_panel'
                    )
                    .classList.toggle('active')
            })
        document
            .getElementById('_lithosphere_control_navigation_spin_left')
            .addEventListener('click', () => {
                this.p._.cameras.controls.rotateLeft(3 * (Math.PI / 180))
            })
        document
            .getElementById('_lithosphere_control_navigation_spin_right')
            .addEventListener('click', () => {
                this.p._.cameras.controls.rotateLeft(-3 * (Math.PI / 180))
            })

        // Dolly
        document
            .getElementById('_lithosphere_control_navigation_dolly')
            .addEventListener('click', (e) => {
                document
                    .querySelector(
                        '#_lithosphere_control_navigation_dolly_root ._lithosphere_control_navigation_panel'
                    )
                    .classList.toggle('active')
            })
        document
            .getElementById('_lithosphere_control_navigation_dolly_up')
            .addEventListener('click', () => {
                this.p._.cameras.controls.rotateUp(1.3 * (Math.PI / 180))
            })
        document
            .getElementById('_lithosphere_control_navigation_dolly_down')
            .addEventListener('click', () => {
                this.p._.cameras.controls.rotateUp(-1.3 * (Math.PI / 180))
            })

        // Pan
        document
            .getElementById('_lithosphere_control_navigation_pan')
            .addEventListener('click', (e) => {
                document
                    .querySelector(
                        '#_lithosphere_control_navigation_pan_root ._lithosphere_control_navigation_panel'
                    )
                    .classList.toggle('active')
            })
        document
            .getElementById('_lithosphere_control_navigation_pan_up')
            .addEventListener('click', () => {
                this.p._.events._rotateGlobe(
                    { pageX: 0, pageY: 0 },
                    { x: 0, y: -200 }
                )
            })
        document
            .getElementById('_lithosphere_control_navigation_pan_left')
            .addEventListener('click', () => {
                this.p._.events._rotateGlobe(
                    { pageX: 0, pageY: 0 },
                    { x: -200, y: 0 }
                )
            })
        document
            .getElementById('_lithosphere_control_navigation_pan_right')
            .addEventListener('click', () => {
                this.p._.events._rotateGlobe(
                    { pageX: 0, pageY: 0 },
                    { x: 200, y: 0 }
                )
            })
        document
            .getElementById('_lithosphere_control_navigation_pan_down')
            .addEventListener('click', () => {
                this.p._.events._rotateGlobe(
                    { pageX: 0, pageY: 0 },
                    { x: 0, y: 200 }
                )
            })

        // Zoom
        document
            .getElementById('_lithosphere_control_navigation_zoom')
            .addEventListener('click', (e) => {
                document
                    .querySelector(
                        '#_lithosphere_control_navigation_zoom_root ._lithosphere_control_navigation_panel'
                    )
                    .classList.toggle('active')
            })
        document
            .getElementById('_lithosphere_control_navigation_zoom_in')
            .addEventListener('click', () => {
                this.p._.cameras.controls.handleMouseWheel({ deltaY: -200 })
                this.p._.events._onZoom()
            })
        document
            .getElementById('_lithosphere_control_navigation_zoom_out')
            .addEventListener('click', () => {
                this.p._.cameras.controls.handleMouseWheel({ deltaY: 200 })
                this.p._.events._onZoom()
            })
    }
}
