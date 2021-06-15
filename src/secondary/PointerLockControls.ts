/**
 * @author mrdoob / http://mrdoob.com/
 */

// @ts-nocheck

import { Object3D, Vector3, Euler } from 'three'

export default function PointerLockControls(camera) {
    var scope = this

    camera.rotation.set(0, 0, 0)

    var pitchObject = new Object3D()
    pitchObject.add(camera)

    var yawObject = new Object3D()
    yawObject.position.y = 10
    yawObject.add(pitchObject)

    var PI_2 = Math.PI / 2

    var onMouseMove = function (event) {
        if (scope.enabled === false) return

        var movementX =
            event.movementX || event.mozMovementX || event.webkitMovementX || 0
        var movementY =
            event.movementY || event.mozMovementY || event.webkitMovementY || 0

        yawObject.rotation.y -= movementX * 0.002
        pitchObject.rotation.x -= movementY * 0.002

        pitchObject.rotation.x = Math.max(
            -PI_2,
            Math.min(PI_2, pitchObject.rotation.x)
        )
    }

    this.dispose = function () {
        document.removeEventListener('mousemove', onMouseMove, false)
    }

    document.addEventListener('mousemove', onMouseMove, false)

    this.enabled = false

    this.getObject = function () {
        return yawObject
    }

    this.getPitchObject = function () {
        return pitchObject
    }

    this.getDirection = (function () {
        // assumes the camera itself is not rotated

        var direction = new Vector3(0, 0, -1)
        var rotation = new Euler(0, 0, 0, 'YXZ')

        return function (v) {
            rotation.set(pitchObject.rotation.x, yawObject.rotation.y, 0)

            v.copy(direction).applyEuler(rotation)

            return v
        }
    })()
}
