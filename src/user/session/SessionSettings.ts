
import {AuthenticationSettings} from "../auth/AuthenticationSettings.js";
import Util from "../../Utils.js";
import {SecurityZone} from "../../security/SecurityZone.js";


export interface SessionSettingsOptions {
    store?:string;
    fsBased?:boolean;
    expireFlush?:boolean;

    /**
     * Session lifetime
     * @type {number}
     */
    expire?:number;
}

/**
 * Represent session management settings
 *
 * @class
 */
export class SessionSettings{

    static DEFAULT_FS_NAME = "dxc_sess";
    static DEFAULT_SESS_DURATION = 3600;

    _tmpStorage:string;

    /**
     * Max session duration (seconds)
     *
     * The duration is verified for each request
     *
     * @field
     * @type {number}
     */
    _duration:number;


    _fsBased:boolean = false;
    _flush:boolean = false;

    private _parent:AuthenticationSettings;

    constructor( pParent:AuthenticationSettings,  pOverrideSettings:SessionSettingsOptions = {}) {
        this._parent = pParent;

        let parentSettings:any = pParent.getSessionSettings();

        if(pOverrideSettings == null) pOverrideSettings = {};
        if(parentSettings == null){
            parentSettings = {};
        }else{
            parentSettings = parentSettings.toObject();
        }

        this._tmpStorage = Util.getValueWithOverride( parentSettings, 'store', SessionSettings.DEFAULT_FS_NAME, pOverrideSettings.store);
        this._fsBased = Util.getValueWithOverride( parentSettings, 'fsBased', false, pOverrideSettings.fsBased);
        this._duration = Util.getValueWithOverride( parentSettings, 'expire', SessionSettings.DEFAULT_SESS_DURATION, pOverrideSettings.expire);
        this._flush = Util.getValueWithOverride( parentSettings, 'expireFlush', false, pOverrideSettings.expireFlush);
    }

    /**
     * To get the max duration of a user session
     * until it expires.
     *
     * In seconds
     *
     * @returns {number} Duration in second
     * @method
     */
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
        if(pZone==SecurityZone.PRIVATE){
            return {
                store: this._tmpStorage,
                fsBased: this._fsBased,
                expire: this._duration,
                expireFlush: this._flush,
            };
        }else{
            return {};
        }

    }
}