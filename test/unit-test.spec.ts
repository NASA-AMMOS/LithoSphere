import LithoSphere from '../src/lithosphere'

describe('Demo test', () => {
    it('Should construct LithoSphere', () => {
        const Litho = new LithoSphere('container', {
            initialView: {
                lng: 137.4071927368641, // default 0
                lat: -4.626971631163808,
                zoom: 16,
            },
            loadingScreen: true, // default true
            //opt
            tileMapResource: {
                bounds: [0, 0, 0, 0],
                origin: [0, 0],
                proj: null, // proj4 string describing the global tileset projection: string (opt) | default wgs84
                resunitsperpixel: 34,
                reszoomlevel: 0,
            },
            //wireframeMode: true,
            //exaggeration: 1, //default 1
            showAxes: true,
            useLOD: true,
            renderOnlyWhenOpen: true, // default true
            starsphere: {
                url:
                    'https://miplmmgis.jpl.nasa.gov/public/images/eso0932a.jpg',
                color: '#666666',
            },
            atmosphere: {
                color: '#111111',
            },
            highlightColor: 'yellow', //css color for vector hover highlights | default 'yellow'
            activeColor: 'red', //css color for active vector features | default 'red'
        })
    })
    /*
  it('Should detect prime numbers', () => {
    expect(isPrimeNumber(2)).toBeTruthy();
    expect(isPrimeNumber(3)).toBeTruthy();
    expect(isPrimeNumber(5)).toBeTruthy();
    expect(isPrimeNumber(7)).toBeTruthy();
    expect(isPrimeNumber(11)).toBeTruthy();

    expect(isPrimeNumber(4)).toBeFalsy();
    expect(isPrimeNumber(6)).toBeFalsy();
    expect(isPrimeNumber(9)).toBeFalsy();
    expect(isPrimeNumber(16)).toBeFalsy();
  });

  it('Should throw error for values < 2', () => {
    expect(() => isPrimeNumber(1)).toThrowError(ErrorMessages.INVALID_NUMBER);
    expect(() => isPrimeNumber(0)).toThrowError(ErrorMessages.INVALID_NUMBER);
    expect(() => isPrimeNumber(-1)).toThrowError(ErrorMessages.INVALID_NUMBER);

    expect(() => isPrimeNumber(Math.max())).toThrowError(
      ErrorMessages.INVALID_NUMBER,
    );
  });
  */
})
