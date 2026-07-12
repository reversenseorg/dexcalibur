
/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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