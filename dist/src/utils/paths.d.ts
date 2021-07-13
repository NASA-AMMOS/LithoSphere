declare const Paths: {
    buildPath: (format: string, basePath: string, tD: any, projection: any, tileResolution: number, options?: any, asObject?: boolean) => any;
    wmsExtension: {
        defaultWmsParams: {
            SERVICE: string;
            REQUEST: string;
            FORMAT: string;
            TRANSPARENT: boolean;
            VERSION: string;
            wmsVersion: any;
            WIDTH: any;
            HEIGHT: any;
        };
        extensionOptions: {
            crsCode: string;
            uppercase: boolean;
        };
        buildPath: (basePath: string, xyz: any, projection: any, tileResolution: number, options: any) => string;
    };
};
export default Paths;
