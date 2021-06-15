import { Corners } from '../generalTypes.d.ts'

interface Private {}

export default class Compass {
    _: Private
    // parent
    p: any
    name: string
    corner: Corners

    constructor(parent: any, name: string) {
        this.p = parent
        this.name = name
        this._ = {}
        this.corner = Corners.BottomLeft
    }

    getControl = (): string => {
        // prettier-ignore
        return [
            `<div class='${this.name}' id='_lithosphere_control_compass_root' style='width: 40px; height: 40px; position: relative;'>`,
                "<div style='position: absolute; left: 16px; bottom: 40px;font-family: sans-serif; font-size: 10px'>N</div>",
                "<svg width='40' height='40'>",
                    "<circle cx='20' cy='20' r='20' stroke-width='0' fill='rgba(0,0,0,1)' />",
                    "<path id='_lithosphere_control_compass_arc' fill='#fff' stroke='#fff' stroke-width='0'></path>",
                    "<line x1='20' y1='0' x2='20' y2='20' style='stroke:rgb(255,255,255);stroke-width:1;mix-blend-mode:difference;' />",
                    "<line x1='40' y1='20' x2='35' y2='20' style='stroke:rgb(255,255,255);stroke-width:1;mix-blend-mode:difference;' />",
                    "<line x1='20' y1='40' x2='20' y2='35' style='stroke:rgb(255,255,255);stroke-width:1;mix-blend-mode:difference;' />",
                    "<line x1='0' y1='20' x2='5' y2='20' style='stroke:rgb(255,255,255);stroke-width:1;mix-blend-mode:difference;' />",
                "</svg>",
                "<div id='_lithosphere_control_compass_azimuth' style='position: absolute; left: 0px; bottom: 0px; width: 40px; height: 40px; line-height: 40px; opacity: 0; font-size: 11px; transition: opacity 0.1s ease-out; font-weight: bold; text-align: center; background: black; border-radius: 50%;'></div>",
            "</div>" ].join('');
    }

    attachEvents = (): void => {
        document
            .getElementById('_lithosphere_control_compass_azimuth')
            .addEventListener('mouseenter', function (e) {
                const target = e.target as HTMLElement
                target.style.opacity = '1'
            })
        document
            .getElementById('_lithosphere_control_compass_azimuth')
            .addEventListener('mouseleave', function (e) {
                const target = e.target as HTMLElement
                target.style.opacity = '0'
            })
    }

    onUpdate = (): void => {
        this.setDirection()
    }

    setDirection = () => {
        const camera = this.p._.cameras.isFirstPerson
            ? this.p._.cameras.firstPerson
            : this.p._.cameras.orbit
        let arc
        let angle
        let fov
        if (camera != undefined) {
            if (this.p._.cameras.isFirstPerson) {
                angle =
                    -(
                        (camera.controls.getObject().rotation.y %
                            (Math.PI * 2)) +
                        Math.PI
                    ) *
                    (180 / Math.PI)
            } else {
                var x = camera.camera.position.x
                var z = camera.camera.position.z
                angle = Math.atan2(x, z) * (180 / Math.PI)
            }
            fov = camera.camera.fov
        }
        var start = angle - fov / 2
        var end = angle + fov / 2
        arc = describeArc(20, 20, 20, start, end)

        document
            .getElementById('_lithosphere_control_compass_arc')
            .setAttribute('d', arc)

        if (angle < 0) angle += 360
        document.getElementById(
            '_lithosphere_control_compass_azimuth'
        ).innerHTML = `${parseInt(angle)} &deg;`
    }
}

function polarToCartesian(centerX, centerY, radius, angleInDegrees) {
    var angleInRadians = ((angleInDegrees - 90) * Math.PI) / 180.0

    return {
        x: centerX + radius * Math.cos(angleInRadians),
        y: centerY + radius * Math.sin(angleInRadians),
    }
}

function describeArc(x, y, radius, startAngle, endAngle) {
    var start = polarToCartesian(x, y, radius, endAngle)
    var end = polarToCartesian(x, y, radius, startAngle)

    var largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

    var d = [
        'M',
        start.x,
        start.y,
        'A',
        radius,
        radius,
        0,
        largeArcFlag,
        0,
        end.x,
        end.y,
        'L',
        x,
        y,
    ].join(' ')

    return d
}
