import Utils from '../utils'

import TifParser from './tif'
import RGBAParser from './rgba'

export default async function load(
    customParsers: any,
    tilePath: string,
    layerObj?: any,
    xyz?: any,
    tileResolution?: number,
    numberOfVertices?: number,
    forceParserType?: string
): Promise<number[]> {
    return new Promise((resolve, reject) => {
        const defaultParserNames = ['tif', 'rgba']
        let parser = null

        const parserType = forceParserType || layerObj.parser

        if (parserType != null && customParsers.hasOwnProperty(parserType))
            parser = customParsers[parserType]
        else if (
            parserType != null &&
            defaultParserNames.includes(parserType)
        ) {
            switch (parserType.toLowerCase()) {
                case 'tif':
                    parser = TifParser
                    break
                case 'rgba':
                default:
                    parser = RGBAParser
                    break
            }
        } else {
            // by file extension
            const type = Utils.getExtension(tilePath).toLowerCase()
            switch (type.toLowerCase()) {
                //case 'demt':
                //    break;
                case 'tif':
                    parser = TifParser
                    break
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
            .catch(() => {
                reject('failed')
            })
    })
}
