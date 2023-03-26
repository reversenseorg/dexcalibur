import {NodeType} from "../../persist/orm/NodeType.js";
import {NodeInternalType} from "../../NodeInternalType.js";
import {NodeProperty, NodePropertyState} from "../../persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType} from "../../persist/orm/DbAbstraction.js";
import {UserAccount} from "../UserAccount.js";
import {UserSession} from "./UserSession.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {IPersistent} from "../../persist/orm/IPersistent.js";


export class SessionData implements IPersistent{

    static TYPE:NodeType = new NodeType(
        'session_data',
        NodeInternalType.USER_SESSION_DATA,
        [
        ]
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