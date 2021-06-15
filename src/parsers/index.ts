import Utils from '../utils'

import RGBAParser from './rgba'

export default async function load(
    customParsers: any,
    tilePath: string,
    layerObj?: any,
    xyz?: any,
    tileResolution?: number,
    numberOfVertices?: number
): Promise<number[]> {
    return new Promise((resolve, reject) => {
        let parser = null

        if (
            layerObj.parser != null &&
            customParsers.hasOwnProperty(layerObj.parser)
        )
            parser = customParsers[layerObj.parser]
        else {
            const type = Utils.getExtension(tilePath).toLowerCase()
            switch (type) {
                //case 'demt':
                //    break;
                case 'png':
                default:
                    parser = RGBAParser
                    break
            }
        }
        parser(tilePath, layerObj, xyz, tileResolution, numberOfVertices)
            .then((data) => {
                resolve(data)
            })
            .catch((err) => {
                reject()
            })
    })
}
