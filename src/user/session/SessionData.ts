
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
