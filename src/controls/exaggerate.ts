import { Corners } from '../generalTypes.d.ts'

interface Private {}

export default class Exaggerate {
    _: Private
    id: string
    // parent
    p: any
    name: string
    corner: Corners
    exaggeration: number

    constructor(parent: any, name: string) {
        this.id = '_lithosphere_control_exaggerate_root'
        this.p = parent
        this.name = name
        this._ = {}
        this.corner = Corners.TopLeft
        this.exaggeration = 1
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='${this.id}' style='position: relative;'>`,
                this.getInactiveContent(),
                `<span id='${this.id}_active' style='pointer-events: none; opacity: 0; transition: opacity 0.2s ease-out;'>`,
                    this.getActiveContent(),
                '</span>',
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document.getElementById(this.id).addEventListener('mouseenter', () => {
            document.getElementById(this.id + '_active').style.pointerEvents =
                'all'
            document.getElementById(this.id + '_active').style.opacity = '1'
        })
        document
            .getElementById(this.id + '_active')
            .addEventListener('mouseleave', () => {
                document.getElementById(
                    this.id + '_active'
                ).style.pointerEvents = 'none'
                document.getElementById(this.id + '_active').style.opacity = '0'
            })
        const options = document.getElementsByClassName(`${this.id}_option`)

        for (let i = 0; i < options.length; i++) {
            options[i].addEventListener('click', () => {
                let value = parseFloat(options[i].getAttribute('value'))
                for (let j = 0; j < options.length; j++) {
                    options[j].classList.remove('_lithosphere_active')
                    // @ts-ignore
                    options[j].style.background = 'unset'
                    // @ts-ignore
                    options[j].style.color = 'unset'
                }
                // @ts-ignore
                options[i].style.background = '#ffdd5c'
                // @ts-ignore
                options[i].style.color = 'black'
                options[i].classList.add('_lithosphere_active')
                this.setExaggeration(value)
            })

            // Set active current element
            const value = parseFloat(options[i].getAttribute('value'))
            if (value == this.p.options.exaggeration) {
                // @ts-ignore
                options[i].style.background = '#ffdd5c'
                // @ts-ignore
                options[i].style.color = 'black'
                options[i].classList.add('_lithosphere_active')
            }
        }
    }

    private getInactiveContent = (): string => {
        // prettier-ignore
        return [
            '<div title="Exaggerate" style="cursor: pointer; width: 26px; height: 26px; background: #1d1f20; font-size: 24px; line-height: 28px; text-align: center;">',
                '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                    '<path fill="currentColor" d="M12,22A2,2 0 0,1 10,20A2,2 0 0,1 12,18A2,2 0 0,1 14,20A2,2 0 0,1 12,22M13,16H11V6L6.5,10.5L5.08,9.08L12,2.16L18.92,9.08L17.5,10.5L13,6V16Z" />',
                '</svg>',
            '</div>',
        ].join('')
    }

    private getActiveContent = (): string => {
        // prettier-ignore
        return [
            '<div style="display: flex; position: absolute; top: 0px; left: 0px; height: 26px; line-height: 26px;">',
                this.getInactiveContent(),
                '<div style="display: flex; background: #111; font-size: 12px; margin-left: 5px;">',
                    `<div class="${this.id}_option" value="1" style="padding: 0px 6px; cursor: pointer;">1x</div>`,
                    `<div class="${this.id}_option" value="2" style="padding: 0px 6px; cursor: pointer;">2x</div>`,
                    `<div class="${this.id}_option" value="5" style="padding: 0px 6px; cursor: pointer;">5x</div>`,
                '</div>',
            '</div>'
        ].join('')
    }

    // WARNING: Only works for tile and clamped
    setExaggeration = (multiplier: number): void => {
        this.p.options.exaggeration = multiplier
        this.p._.tiledWorld.removeAllTiles()
    }
}
