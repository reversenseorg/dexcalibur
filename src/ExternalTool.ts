

export interface ExternalToolMap {
    [uid:string] :ExternalTool
}


/**
 * Represent configuration for an external tool
 *
 * @class
 * @since 1.0.0
 */
export class ExternalTool {

    /**
     * Path of the binary
     * @type {string}
     * @field
     */
    _p:string  = null;

    private _uid:string = null;

    private _opts:any = {}

    constructor( pUID:string, pPath:string, pOptions:any={}) {
        this._uid = pUID;
        this._p = pPath;
        this._opts = pOptions;
    }

    getUID():string {
        return this._uid;
    }

    getPath():string {
        return this._p;
    }

    getOptions(){
        return this._opts;
    }
}