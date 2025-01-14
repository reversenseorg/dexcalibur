import {IncomingValue} from "../security/SanitizedValue.js";


export abstract class AbstractSettings {

    protected parent:AbstractSettings = null;

    constructor( pParent:AbstractSettings = null) {
        this.parent = pParent;
    }

    /**
     * To trigger global saving
     *
     * @param {string} pDestPath Optional. Backup file path
     * @method
     */
    save(pDestPath:string = null):any {
        return (this.parent!=null ? this.parent.save(pDestPath) : null)
    }



    abstract sanitize( pName:string, pValue:any):IncomingValue;

    abstract update( pValue:IncomingValue):void;

    abstract toObject():any;
}