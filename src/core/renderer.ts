import { WebGLRenderer } from 'three'

export default class Renderer {
    renderer: any
    container: HTMLElement

    constructor(container: HTMLElement) {
        this.renderer = null
        this.container = container
        this._init()
    }

    _init(): void {
        const webglSupport = (function () {
            try {
                const canvas = document.createElement('canvas')
                return !!(
                    window.WebGLRenderingContext &&
                    (canvas.getContext('webgl') ||
                        canvas.getContext('experimental-webgl'))
                )
            } catch (e) {
                return false
            }
        })()
        this.container.innerHTML = ''

        if (webglSupport) {
            this.renderer = new WebGLRenderer({
                logarithmicDepthBuffer: false,
                alpha: true,
            })
            this.renderer.setClearColor(0x000000, 0)
            this.renderer.sortObjects = false
            this.renderer.autoClear = false

            //const gl = this.renderer.getContext()

            this.container.appendChild(this.renderer.domElement)

            this.renderer.setPixelRatio(window.devicePixelRatio)

            // Update the Size
            window.addEventListener('resize', this.updateSize, false)
            this.updateSize()
        } else {
            // WebGL is not supported sp let's fill the container with a message about enabling WebGL
            this.container.innerHTML =
                "<div style='margin-bottom: 5px;'>Seems like <a target='_blank' href='https://www.khronos.org/webgl/wiki/Getting_a_WebGL_Implementation'>WebGL</a> isn't supported for you.</div><div>Find out how to get it <a target='_blank' href='https://get.webgl.org/'>here</a>.</div>"
            this.container.style.textAlign = 'center'
            this.container.style.fontSize = '18px'

            console.warn('WebGL Not Supported')

            this.renderer = null
        }
    }

    updateSize = (): void => {
        this.renderer.setSize(
            this.container.offsetWidth,
            this.container.offsetHeight
        )
    }

    remove(): void {
        window.removeEventListener('resize', this.updateSize, false)
    }
}
