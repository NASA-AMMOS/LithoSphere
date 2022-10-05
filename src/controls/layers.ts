import { Corners } from '../generalTypes.d.ts'

interface Private {}

export default class Layers {
    _: Private
    id: string
    // parent
    p: any
    name: string
    corner: Corners

    constructor(parent: any, name: string) {
        this.id = '_lithosphere_control_layers_root'
        this.p = parent
        this.name = name
        this._ = {}
        this.corner = Corners.TopRight
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='${this.id}' style='position: relative;'>`,
                '<div title="Layers" style="cursor: pointer; width: 26px; height: 26px; background: #1d1f20; font-size: 24px; line-height: 28px; text-align: center;">',
                    this.getInactiveContent(),
                '</div>',
                `<span id='${this.id}_active' style='pointer-events: none; opacity: 0; transition: opacity 0.2s ease-out;'>`,
                    this.getActiveContent(),
                '</span>',
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document.getElementById(this.id).addEventListener('mouseenter', () => {
            document.getElementById(
                this.id + '_active'
            ).innerHTML = this.getActiveContent()
            this.attachEventsInternal()
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
    }

    private getInactiveContent = (): string => {
        // prettier-ignore
        return [
            '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                '<path fill="currentColor" d="M12,16L19.36,10.27L21,9L12,2L3,9L4.63,10.27M12,18.54L4.62,12.81L3,14.07L12,21.07L21,14.07L19.37,12.8L12,18.54Z" />',
            '</svg>',
        ].join('')
    }

    private getActiveContent = (): string => {
        let activeContent = []

        for (let layerType in this.p.layers.all) {
            if (this.p.layers.all[layerType].length > 0) {
                let layerElms = []
                for (let l of this.p.layers.all[layerType]) {
                    // prettier-ignore
                    layerElms.push([
                        '<li style="display: flex; justify-content: space-between; height: 22px; font-size: 12px; line-height: 22px;">',
                            '<div style="display: flex; justify-content: space-between;">',
                                `<input class="${this.id + '_toggle'}" layer-type="${layerType}" layer-name="${l.name}" type="checkbox" ${l.on ? 'checked' : ''} style="margin: 4px 4px 3px 4px;"/>`,
                                `<span style="text-transform: capitalize; margin-right: 20px;">${l.name}</span>`,
                            '</div>',
                            '<div style="display: flex; justify-content: space-between;">',
                                `<input class="${this.id + '_opacity'}" layer-type="${layerType}" layer-name="${l.name}" type="range" min="0" max="1" step="0.01" value="${l.opacity}" style="width: 60px;"/>`,
                            '</div>',
                        '</li>'
                    ].join(''))
                }
                // prettier-ignore
                activeContent.push([
                    '<div style="border-bottom: 1px solid #222;">',
                        `<div style="text-transform: capitalize; padding: 6px; font-size: 12px; color: #888;">${layerType}</div>`,
                        '<ul style="margin: 0; padding: 0px 6px 6px 6px;">',
                            layerElms.join(''),
                        '</ul>',
                    '</div>'
                ].join(''))
            }
        }
        // prettier-ignore
        return [
            '<div style="position: absolute; top: 0px; right: 0px; background: #111; border: 1px solid #222; border-bottom: 0px solid #222;">',
                activeContent.join(''),
            '</div>'
        ].join('')
    }

    private attachEventsInternal = (): void => {
        const toggles = document.getElementsByClassName(this.id + '_toggle')
        // @ts-ignore
        for (let t of toggles) {
            t.addEventListener('click', (e) => {
                this.p.toggleLayer(t.getAttribute('layer-name'))
            })
        }

        const opacities = document.getElementsByClassName(this.id + '_opacity')
        // @ts-ignore
        for (let t of opacities) {
            const type = t.getAttribute('layer-type')
            if (type === 'clamped')
                t.addEventListener('change', (e) => {
                    this.p.setLayerOpacity(
                        t.getAttribute('layer-name'),
                        t.value
                    )
                })
            else
                t.addEventListener('input', (e) => {
                    this.p.setLayerOpacity(
                        t.getAttribute('layer-name'),
                        t.value
                    )
                })
        }
    }
}
