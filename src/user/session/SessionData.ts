
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {UserSession} from "./UserSession.js";
import {IPersistent} from "../../persist/orm/IPersistent.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";


export class SessionData implements IPersistent{

    static TYPE:NodeType = new NodeType(
        'session_data',
        NodeInternalType.USER_SESSION_DATA,
        [ ]
    );
    __:NodeInternalType = NodeInternalType.USER_SESSION_DATA;

    _sess:UserSession;
    _name:string;
    _value:any;

    constructor( pConfig:any) {

        for(let i in pConfig){
            this[i] = pConfig[i];

        }
    }

    getName():string{
        return this._name;
    }

    getValue():any {
        return this._value;
    }

    getUID(): any {
        return this._sess.getSessUID()+':'+this._name;
    }
}

//SessionData.TYPE.builder(SessionData);