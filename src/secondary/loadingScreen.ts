import './loadingScreen.css'

export default class Controls {
    // parent
    p: any
    loadingContainer: HTMLElement

    constructor(parent: any) {
        this.p = parent

        if (this.p.options.loadingScreen === false) return

        this.loadingContainer = document.createElement('div')
        this.loadingContainer.setAttribute('id', '_lithosphere_loadingscreen')
        this.loadingContainer.style.position = 'absolute'
        this.loadingContainer.style.top = '0'
        this.loadingContainer.style.left = '0'
        this.loadingContainer.style.width = '100%'
        this.loadingContainer.style.height = '100%'
        //this.loadingContainer.style.pointerEvents = 'none'
        this.loadingContainer.style.background = 'black'
        this.loadingContainer.style.color = 'white'
        this.loadingContainer.style.fontFamily = 'sans-serif'
        this.loadingContainer.style.zIndex = '9001'
        this.loadingContainer.style.opacity = '1'
        this.loadingContainer.style.transition = 'opacity 0.5s ease-in'

        // prettier-ignore
        this.loadingContainer.innerHTML = [
            "<div class='_lithosphere_loadingscreen_loading'>",
                "<div></div>",
                "<div></div>",
                "<div></div>",
                "<div></div>",
                "<div></div>",
                "<div></div>",
            '</div>',
        ].join('\n')
        this.p._.container.appendChild(this.loadingContainer)

        this.p._.sceneContainer.style.filter = 'blur(10px) brightness(0.5)'
        this.p._.sceneContainer.style.transition = 'filter 0.5s ease-in-out'
    }

    end = (name): void => {
        if (this.p.options.loadingScreen === false) return

        if (this.loadingContainer) {
            this.loadingContainer.style.opacity = '0'
            this.p._.sceneContainer.style.filter = 'blur(0px) brightness(1)'
            setTimeout(() => {
                this.loadingContainer.remove()
                this.loadingContainer = null
                this.p._.sceneContainer.style.filter = null
                this.p._.sceneContainer.style.transition = null
            }, 500)
        }
    }
}
