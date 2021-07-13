import '../secondary/PNG/zlib'
import '../secondary/PNG/png'

//import { NO_DATA_VALUE_INTERNAL } from '../constants'
//import Utils from '../utils'

export default function RGBAParser(
    tilePath: string,
    layerObj?: any,
    xyz?: any,
    tileResolution?: number,
    numberOfVertices?: number
): Promise<number[]> {
    return new Promise((resolve, reject) => {
        // @ts-ignore
        PNG.load(
            tilePath,
            {
                withCredentials: false,
            },
            (img) => {
                if (img == false) {
                    reject()
                    return
                }
                const rgbaArr = img.decode()
                let heightArr = []
                for (let i = 0; i < rgbaArr.length; i += 4) {
                    heightArr.push(
                        RGBAto32({
                            r: rgbaArr[i],
                            g: rgbaArr[i + 1],
                            b: rgbaArr[i + 2],
                            a: rgbaArr[i + 3],
                        })
                    )
                }
                /*
                if (layerObj && typeof layerObj.noDataValue === 'number')
                    heightArr = heightArr.map((h) =>
                        h == layerObj.noDataValue ? NO_DATA_VALUE_INTERNAL : h
                    )
                */
                resolve(heightArr)
            },
            (err) => {
                reject()
            }
        )
    })
}

function RGBAto32(rgba) {
    return decodeFloat(
        asByteString(rgba.r.toString(2)) +
            asByteString(rgba.g.toString(2)) +
            asByteString(rgba.b.toString(2)) +
            asByteString(rgba.a.toString(2))
    )
}
function asByteString(byte) {
    let byteString = byte
    while (byteString.length < 8) {
        byteString = '0' + byteString
    }
    return byteString
}
function decodeFloat(binary) {
    if (binary.length < 32)
        binary = ('00000000000000000000000000000000' + binary).substr(
            binary.length
        )
    var sign = binary.charAt(0) == '1' ? -1 : 1
    var exponent = parseInt(binary.substr(1, 8), 2) - 127
    var significandBase = binary.substr(9)
    var significandBin = '1' + significandBase
    var i = 0
    var val = 1
    var significand = 0

    if (exponent == -127) {
        if (significandBase.indexOf('1') == -1) return 0
        else {
            exponent = -126
            significandBin = '0' + significandBase
        }
    }

    while (i < significandBin.length) {
        significand += val * parseInt(significandBin.charAt(i))
        val = val / 2
        i++
    }

    return sign * significand * Math.pow(2, exponent)
}
