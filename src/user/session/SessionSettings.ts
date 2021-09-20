
import {AuthenticationSettings} from "../auth/AuthenticationSettings";
import Util from "../../Utils";
import {SecurityZone} from "../../security/SecurityZone";



/**
 * Represent session management settings
 *
 * @class
 */
export class SessionSettings{

    _tmpStorage:string;
    /**
     * Max session duration (seconds)
     * The duration is verified for each request.
     *
     * @field
     * @type {number}
     */
    _duration:number = 3600;
    _fsBased:boolean = false;
    _flush:boolean = false;

    private _parent:AuthenticationSettings;

    constructor( pParent:AuthenticationSettings,  pSettings:any) {
        this._parent = pParent;
        this._tmpStorage = Util.getValue( pSettings, 'store', 'dxc_sess');
        this._fsBased = Util.getValue( pSettings, 'fsBased', false);
        this._duration = Util.getValue( pSettings, 'expire', 3600);
        this._flush = Util.getValue( pSettings, 'expireFlush', false);
    }

    getMaxDuration():number {
        return this._duration;
    }

    mustFlushSessDate():boolean {
        return this._flush;
    }

    isFsBased():boolean {
        return this._fsBased;
    }

    getStorage():string {
        return this._tmpStorage;
    }



    /**
     * To save change
     *
     * Arguments can be used to export all configuration on local change
     *
     * @param {string} pDestFile Optional. Destination file path
     */
    save(pDestFile:string = null):void {
        this._parent.save(pDestFile);
    }

    toObject( pZone:SecurityZone = SecurityZone.PUBLIC):any {
        return {
            _tmpStorage: this._tmpStorage,
            _fsBased: this._fsBased,
            _duration: this._duration,
            _flush: this._flush,
        };
    }
}