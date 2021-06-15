import { Corners } from '../generalTypes.d.ts'

interface Private {}

export default class Observe {
    _: Private
    // parent
    p: any
    name: string
    id: string
    helpDiv: HTMLElement
    corner: Corners

    constructor(parent: any, name: string) {
        this.p = parent
        this.name = name
        this.id = '_lithosphere_control_observe_root'
        this._ = {}
        this.corner = Corners.TopLeft
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

    private getInactiveContent = (): string => {
        // prettier-ignore
        return [
            `<div title='Observe' style='width: 26px; height: 26px; background: black; font-size: 24px; line-height: 27px; text-align: center; cursor: pointer;'>`,
                '<svg style="width:18px; height:18px" viewBox="0 0 24 24">',
                    '<path fill="currentColor" d="M13.73,15L9.83,21.76C10.53,21.91 11.25,22 12,22C14.4,22 16.6,21.15 18.32,19.75L14.66,13.4M2.46,15C3.38,17.92 5.61,20.26 8.45,21.34L12.12,15M8.54,12L4.64,5.25C3,7 2,9.39 2,12C2,12.68 2.07,13.35 2.2,14H9.69M21.8,10H14.31L14.6,10.5L19.36,18.75C21,16.97 22,14.6 22,12C22,11.31 21.93,10.64 21.8,10M21.54,9C20.62,6.07 18.39,3.74 15.55,2.66L11.88,9M9.4,10.5L14.17,2.24C13.47,2.09 12.75,2 12,2C9.6,2 7.4,2.84 5.68,4.25L9.34,10.6L9.4,10.5Z" />',
                '</svg>',
            "</div>" ].join('');
    }

    private getActiveContent = (): string => {
        const initialCenter = this.p.getCenter()

        // prettier-ignore
        return [
            '<div style="display: flex; position: absolute; top: 0px; left: 0px; height: 26px; line-height: 26px;">',
                this.getInactiveContent(),
                '<div style="display: flex; background: #111; font-size: 12px; margin-left: 5px;">',
                    "<div id='_lithosphere_WalkSettingsPanel' style='padding: 2px 6px 6px 6px; position: absolute; top: 0px; background: #000; width: 185px;'>",
                        "<ul style='list-style-type: none; padding: 0; margin: 0; font-size: 12px;'>",
                            "<li id='_lithosphere_WalkSettingsFov' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Field of View</div>",
                                "<input id='_lithosphere_WalkSettingsFovValue' type='number' value='" + 60 + "' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                                 "<input id='_lithosphere_WalkSettingsFovValueRaw' type='number' value='" + 60 + "' style='display: none;'>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsVerticalFov' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Vertical FOV</div>",
                                "<input id='_lithosphere_WalkSettingsVerticalFovValue' type='number' value='" + 60 + "' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsFocalLength' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Focal Length</div>",
                                "<input id='_lithosphere_WalkSettingsFocalLengthValue' type='number' value='" + 35 + "' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 6px 0px auto;'>",
                                "<div style='height: 19px; font-size: 10px; line-height: 5px;'><div style='height: 8px;'>m</div><div style='height: 8px;'>m</div></div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsAzimuth' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Azimuth</div>",
                                "<input id='_lithosphere_WalkSettingsAzimuthValue' type='number' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsElevation' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Elevation</div>",
                                "<input id='_lithosphere_WalkSettingsElevationValue' type='number' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsHeight' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Height</div>",
                                "<input id='_lithosphere_WalkSettingsHeightValue' type='number' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div>m</div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsLatitude' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Latitude</div>",
                                "<input id='_lithosphere_WalkSettingsLatitudeValue' type='number' value='" + initialCenter.lat  + "' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                            "</li>",
                            "<li id='_lithosphere_WalkSettingsLongitude' style='display: flex; justify-content: space-between; margin-bottom: 3px;'>",
                                "<div style='float: left; padding-right: 5px;'>Longitude</div>",
                                "<input id='_lithosphere_WalkSettingsLongitudeValue' type='number' value='" + initialCenter.lng + "' style='width: 100%; background-color: transparent; color: white; border: none; border-bottom: 1px solid #777; width: 80px; margin: 0px 2px 0px auto;'>",
                                "<div style='font-size: 20px; padding-right: 4px;'>&deg;</div>",
                            "</li>",
                        "</ul>",
                        "<div id='_lithosphere_WalkWalkStandButtons' style='padding-top: 6px; display: flex; justify-content: space-between;'>",
                            "<div id='_lithosphere_WalkWalkHere' style='display: none; padding: 0px 6px; cursor: pointer;'>Walk Here</div>",
                            "<div id='_lithosphere_WalkStand' style='padding: 0px 6px; cursor: pointer; width: 100%; text-align: center; font-size: 12px; text-transform: uppercase; font-weight: bold; background: #FBC02D; color: black;'>Observe</div>",
                        "</div>",
                    "</div>",
                '</div>',
            '</div>'
        ].join('')
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

        document
            .getElementById('_lithosphere_WalkStand')
            .addEventListener('click', () => {
                this.setCamera(true)

                this.toggleFOVOverlay(true)
                const w = this.getObserverValues()
                this.updateFOVOverlayBounds(
                    w.vfieldofview,
                    w.elevation,
                    w.fieldofview,
                    w.azimuth
                )

                document.addEventListener(
                    'keydown',
                    this.keydownObserverSettings
                )

                try {
                    this.p.controls.controlContainer.removeChild(this.helpDiv)
                } catch (e) {}

                // prettier-ignore
                const helpMarkup = [
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>W</div><div>Up</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>A</div><div>Left</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>S</div><div>Down</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>D</div><div>Right</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>R</div><div>Higher</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>F</div><div>Lower</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>T</div><div>FOV +</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>G</div><div>FOV -</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>Y</div><div>vFOV +</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>H</div><div>vFOV -</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; border-bottom: 1px solid #222; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>SHIFT+</div><div>Fast</div></div>",
                        "<div style='display: flex; justify-content: space-between; padding: 2px 6px; white-space: nowrap; text-align: center; color: #fff; line-height: 16px;'><div style='color: #bbb; text-align: center; margin-right: 5px;'>ESC</div><div>Quit</div></div>",
                ].join('\n')

                this.helpDiv = document.createElement('div')
                this.helpDiv.id = '_lithosphere_control_walk_help'
                this.helpDiv.style =
                    'position: absolute; bottom: 47px; right: 15px; background: black; font-size: 13px;'
                this.helpDiv.innerHTML = helpMarkup

                this.p.controls.controlContainer.appendChild(this.helpDiv)
            })
    }

    private setCamera = (lockControls, skipLock) => {
        var w = this.getObserverValues()
        this.p.setCenter(
            { lat: w.latitude, lng: w.longitude, zoom: this.p.zoom },
            true
        )
        this.p._.cameras.setFirstPersonHeight(w.height)
        this.p._.cameras.setCameraAzimuthElevation(w.azimuth, w.elevation, true)
        this.p._.cameras.setFirstPersonFocalLength(w.focallength)
        this.p._.cameras.setFirstPersonFOV(Math.max(w.vfieldofview, 60)) *
            this.p._.cameras.swap(lockControls, skipLock)
        if ('onpointerlockchange' in document)
            document.addEventListener(
                'pointerlockchange',
                this.leaveObserver,
                false
            )
        else if ('onmozpointerlockchange' in document)
            document.addEventListener(
                'mozpointerlockchange',
                this.leaveObserver,
                false
            )
    }

    private leaveObserver = () => {
        if (
            document.pointerLockElement === document.body ||
            document.mozPointerLockElement === document.body
        ) {
            /* pointer locked */
        } else {
            try {
                this.p.controls.controlContainer.removeChild(this.helpDiv)
                this.toggleFOVOverlay(false)
                document.removeEventListener(
                    'keydown',
                    this.keydownObserverSettings
                )
            } catch (e) {}
        }
    }

    private getObserverValues = () => {
        return {
            fieldofview:
                parseFloat(
                    document.getElementById('_lithosphere_WalkSettingsFovValue')
                        .value
                ) || 60,
            fieldofviewRaw:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsFovValueRaw'
                    ).value
                ) || 60,
            vfieldofview:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsVerticalFovValue'
                    ).value
                ) || 60,
            focallength:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsFocalLengthValue'
                    ).value
                ) || 35,
            azimuth:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsAzimuthValue'
                    ).value
                ) || 0,
            elevation:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsElevationValue'
                    ).value
                ) || 0,
            height:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsHeightValue'
                    ).value
                ) || 3,
            latitude:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsLatitudeValue'
                    ).value // - Globe_Walk.C.coordOffset[1]
                ) ||
                this.p.getCenter().lat ||
                0,
            longitude:
                parseFloat(
                    document.getElementById(
                        '_lithosphere_WalkSettingsLongitudeValue'
                    ).value // - Globe_Walk.C.coordOffset[0]
                ) ||
                this.p.getCenter().lon ||
                0,
        }
    }

    private keydownObserverSettings = (e) => {
        const w = this.getObserverValues()
        if (e.which === 84)
            //t
            document.getElementById(
                '_lithosphere_WalkSettingsFovValue'
            ).value = +(w.fieldofview + (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 71)
            //g
            document.getElementById(
                '_lithosphere_WalkSettingsFovValue'
            ).value = +(w.fieldofview - (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 89)
            //y
            document.getElementById(
                '_lithosphere_WalkSettingsVerticalFovValue'
            ).value = +(w.vfieldofview + (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 72)
            //h
            document.getElementById(
                '_lithosphere_WalkSettingsVerticalFovValue'
            ).value = +(w.vfieldofview - (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 68)
            //d
            document.getElementById(
                '_lithosphere_WalkSettingsAzimuthValue'
            ).value = +(w.azimuth + (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 65)
            //a
            document.getElementById(
                '_lithosphere_WalkSettingsAzimuthValue'
            ).value = +(w.azimuth - (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 87)
            //w
            document.getElementById(
                '_lithosphere_WalkSettingsElevationValue'
            ).value = +(w.elevation + (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 83)
            //s
            document.getElementById(
                '_lithosphere_WalkSettingsElevationValue'
            ).value = +(w.elevation - (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 82)
            //r
            document.getElementById(
                '_lithosphere_WalkSettingsHeightValue'
            ).value = +(w.height + (e.shiftKey ? 1 : 0.2)).toFixed(4)
        else if (e.which === 70)
            //f
            document.getElementById(
                '_lithosphere_WalkSettingsHeightValue'
            ).value = +(w.height - (e.shiftKey ? 1 : 0.2)).toFixed(4)

        const wNew = this.getObserverValues()
        this.p._.cameras.setFirstPersonHeight(wNew.height)
        this.p._.cameras.setCameraAzimuthElevation(
            wNew.azimuth,
            wNew.elevation,
            true
        )

        if (wNew.vfieldofview !== w.vfieldofview) {
            this.p._.cameras.setFirstPersonFOV(Math.max(wNew.vfieldofview, 60))
            document.getElementById(
                '_lithosphere_WalkSettingsFocalLengthValue'
            ).value = +this.p._.cameras.getFirstPersonFocalLength().toFixed(4)
        } else if (wNew.focallength !== w.focallength) {
            this.p._.cameras.setFirstPersonFocalLength(wNew.focallength)
            document.getElementById(
                '_lithosphere_WalkSettingsFovValue'
            ).value = +this.p._.cameras.getFirstPersonFOV().toFixed(4)
        }

        this.updateFOVOverlayBounds(
            wNew.vfieldofview,
            wNew.elevation,
            wNew.fieldofview,
            wNew.azimuth
        )
    }

    private toggleFOVOverlay = (on) => {
        const fovOverlay = document.getElementById(
            '_lithosphere_WalkFOVOverlay'
        )

        if (on) {
            if (fovOverlay == null) {
                const fovOverlay = document.createElement('div')
                fovOverlay.id = '_lithosphere_WalkFOVOverlay'
                // @ts-ignore
                fovOverlay.style = [
                    'position: absolute',
                    'left: 0',
                    'top: 0',
                    'width: 100%',
                    'height: 100%',
                    'pointer-events: none',
                ].join(';')
                fovOverlay.innerHTML = [
                    "<div id='_lithosphere_Walk_NW' style='position: absolute; background: rgba(0,0,0,0.4);'></div>",
                    "<div id='_lithosphere_Walk_N' style='position: absolute; background: rgba(0,0,0,0.4); border-bottom: 1px solid #444;'></div>",
                    "<div id='_lithosphere_Walk_NE' style='position: absolute; background: rgba(0,0,0,0.4);'></div>",
                    "<div id='_lithosphere_Walk_E' style='position: absolute; background: rgba(0,0,0,0.4); border-left: 1px solid #444;'></div>",
                    "<div id='_lithosphere_Walk_SE' style='position: absolute; background: rgba(0,0,0,0.4);'></div>",
                    "<div id='_lithosphere_Walk_S' style='position: absolute; background: rgba(0,0,0,0.4); border-top: 1px solid #444;'></div>",
                    "<div id='_lithosphere_Walk_SW' style='position: absolute; background: rgba(0,0,0,0.4);'></div>",
                    "<div id='_lithosphere_Walk_W' style='position: absolute; background: rgba(0,0,0,0.4); border-right: 1px solid #444;'></div>",
                ].join('\n')

                this.p.getContainer().appendChild(fovOverlay)
            }
        } else if (fovOverlay != null) {
            this.p.getContainer().removeChild(fovOverlay)
        }
    }

    private updateFOVOverlayBounds = (
        elFOV,
        elFOVCenter,
        azFOV,
        azFOVCenter
    ) => {
        elFOV = document.getElementById(
            '_lithosphere_WalkSettingsVerticalFovValue'
        ).value

        const screenFOV = this.p._.cameras.getFirstPersonFOV()
        const screenAspect = this.p._.cameras.getFirstPersonAspect()
        const rect = this.p.getContainer().getBoundingClientRect()

        // Percents from top or left where inner fov bounds will be
        const elFovPx = rect.height * (elFOV / screenFOV)
        const top = ((rect.height / 2 - elFovPx / 2) / rect.height) * 100
        const bottom = ((rect.height / 2 + elFovPx / 2) / rect.height) * 100
        const azFovPx = (rect.height / screenFOV) * azFOV
        const left = ((rect.width / 2 - azFovPx / 2) / rect.width) * 100
        const right = ((rect.width / 2 + azFovPx / 2) / rect.width) * 100

        const nw = document.getElementById('_lithosphere_Walk_NW')
        nw.style.top = 0 + '%'
        nw.style.height = top + '%'
        nw.style.left = 0 + '%'
        nw.style.width = left + '%'

        const n = document.getElementById('_lithosphere_Walk_N')
        n.style.top = 0 + '%'
        n.style.height = top + '%'
        n.style.left = left + '%'
        n.style.width = right - left + '%'

        const ne = document.getElementById('_lithosphere_Walk_NE')
        ne.style.top = 0 + '%'
        ne.style.height = top + '%'
        ne.style.left = right + '%'
        ne.style.width = 100 - right + '%'

        const e = document.getElementById('_lithosphere_Walk_E')
        e.style.top = top + '%'
        e.style.height = bottom - top + '%'
        e.style.left = right + '%'
        e.style.width = 100 - right + '%'

        const se = document.getElementById('_lithosphere_Walk_SE')
        se.style.top = bottom + '%'
        se.style.height = 100 - bottom + '%'
        se.style.left = right + '%'
        se.style.width = 100 - right + '%'

        const s = document.getElementById('_lithosphere_Walk_S')
        s.style.top = bottom + '%'
        s.style.height = 100 - bottom + '%'
        s.style.left = left + '%'
        s.style.width = right - left + '%'

        const sw = document.getElementById('_lithosphere_Walk_SW')
        sw.style.top = bottom + '%'
        sw.style.height = 100 - bottom + '%'
        ;(sw.style.left = 0 + '%'), (sw.style.width = left + '%')

        const w = document.getElementById('_lithosphere_Walk_W')
        w.style.top = top + '%'
        w.style.height = bottom - top + '%'
        w.style.left = 0 + '%'
        w.style.width = left + '%'
    }
}
