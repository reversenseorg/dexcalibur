
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

import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {UserSession} from "./UserSession.js";
import {IPersistent} from "../../persist/orm/IPersistent.js";
import {DbDataType, DbKeyType, NodeProperty, NodePropertyState, NodeType} from "@dexcalibur/dexcalibur-orm";
import {SessionStore} from "./SessionStore.js";
import DexcaliburProject from "../../DexcaliburProject.js";

export interface  SessionDataOptions {
    _name?:string,
    _value?:any;
    _sess?:UserSession;
}

/**
 * Represent a pair key/value used to store data
 * inside a session
 *
 * @class
 */
export class SessionData implements IPersistent{

    static TYPE:NodeType = new NodeType(
        'session_data',
        NodeInternalType.USER_SESSION_DATA,
        [
            (new NodeProperty('_name')).type(DbDataType.STRING).key(DbKeyType.PRIMARY, 1),
            (new NodeProperty('_value'))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState) => {
                    let c:any = x.p;
                    switch(x.self._name){
                        case 'prj_active':
                            c = (x.p as DexcaliburProject).getUID();
                            break;

                    }
                    return c;
                })
                .wakeUp( (x:NodePropertyState) => {
                    let c:any = x.p;
                    switch(x.self._name){
                        case 'prj_active':
                            c = x.ctx.getProject(x.p);
                            break;
                    }
                    return c;
                })
        ]
    );
    __:NodeInternalType = NodeInternalType.USER_SESSION_DATA;

    _sess:UserSession;
    _name:string;
    _value:any;

    constructor( pConfig:SessionDataOptions = null) {

        if(pConfig !=null){
            for(let i in pConfig){
                this[i] = pConfig[i];

            }
        }
    }

    /**
     * To get the data name
     *
     * @returns {string} Name
     * @method
     */
    getName():string{
        return this._name;
    }

    /**
     * To get the value
     */
    getValue():any {
        return this._value;
    }

    getUID(): any {
        return this._sess.getSessUID()+':'+this._name;
    }

    /**
     * To prepare an object ready to be serialized
     *
     */
    toJsonObject():any {
        const o:any = {
            _name: this._name,
            _value: this._value,
            _sess: (this._sess!=null ? this._sess.getSessUID() : null)
        };

        return o;
    }
}
SessionData.TYPE.builder(SessionData)
