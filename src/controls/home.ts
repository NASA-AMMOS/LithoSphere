import { Corners } from '../generalTypes'

interface Private {}

export default class Home {
    _: Private
    // parent
    p: any
    name: string
    corner: Corners

    constructor(parent: any, name: string) {
        this.p = parent
        this.name = name
        this._ = {}
        this.corner = Corners.TopLeft
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_home_root' title='Reset View' style='width: 26px; height: 26px; background: black; font-size: 24px; line-height: 26px; text-align: center; cursor: pointer;'>`,
                '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                    '<path fill="currentColor" d="M9,13H15V19H18V10L12,5.5L6,10V19H9V13M4,21V9L12,3L20,9V21H4Z" />',
                '</svg>',
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document
            .getElementById('_lithosphere_control_home_root')
            .addEventListener('click', () => {
                this.p.setCenter(this.p.options.initialView, null, true)
            })
    }
}
