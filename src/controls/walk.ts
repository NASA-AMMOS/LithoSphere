import { Corners } from '../generalTypes.d.ts'

interface Private {}

export default class Walk {
    _: Private
    // parent
    p: any
    name: string
    helpDiv: HTMLElement
    corner: Corners

    constructor(parent: any, name: string) {
        this.p = parent
        this.name = name
        this.helpDiv = null
        this._ = {}
        this.corner = Corners.TopLeft
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_walk_root' title='Walk' style='width: 26px; height: 26px; background: black; font-size: 24px; line-height: 27px; text-align: center; cursor: pointer;'>`,
                '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                    '<path fill="currentColor" d="M14.12,10H19V8.2H15.38L13.38,4.87C13.08,4.37 12.54,4.03 11.92,4.03C11.74,4.03 11.58,4.06 11.42,4.11L6,5.8V11H7.8V7.33L9.91,6.67L6,22H7.8L10.67,13.89L13,17V22H14.8V15.59L12.31,11.05L13.04,8.18M14,3.8C15,3.8 15.8,3 15.8,2C15.8,1 15,0.2 14,0.2C13,0.2 12.2,1 12.2,2C12.2,3 13,3.8 14,3.8Z" />',
                '</svg>',
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document
            .getElementById('_lithosphere_control_walk_root')
            .addEventListener('click', () => {
                this.setCamera(false)

                try {
                    this.p.controls.controlContainer.removeChild(this.helpDiv)
                } catch (e) {}

                // prettier-ignore
                const helpMarkup = [
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>W</div><div>Forward</div></div>",
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>A</div><div>Left</div></div>",
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>S</div><div>Back</div></div>",
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>D</div><div>Right</div></div>",
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>SHIFT+</div><div>Fast</div></div>",
                    "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>ESC</div><div>Quit</div></div>",
                ].join('\n')

                this.helpDiv = document.createElement('div')
                this.helpDiv.id = '_lithosphere_control_walk_help'
                // @ts-ignore
                this.helpDiv.style =
                    'position: absolute; bottom: 47px; right: 15px; background: black; font-size: 13px;'
                this.helpDiv.innerHTML = helpMarkup

                this.p.controls.controlContainer.appendChild(this.helpDiv)
            })
    }

    private setCamera = (lockControls, skipLock?: boolean) => {
        this.p._.cameras.swap(lockControls, skipLock)
        if ('onpointerlockchange' in document)
            document.addEventListener(
                'pointerlockchange',
                this.leaveWalking,
                false
            )
        else if ('onmozpointerlockchange' in document)
            // @ts-ignore
            document.addEventListener(
                'mozpointerlockchange',
                this.leaveWalking,
                false
            )
    }

    private leaveWalking = () => {
        // @ts-ignore
        if (
            document.pointerLockElement === document.body ||
            // @ts-ignore
            document.mozPointerLockElement === document.body
        ) {
            /* pointer locked */
        } else {
            try {
                this.p.controls.controlContainer.removeChild(this.helpDiv)
            } catch (e) {}
        }
    }
}
