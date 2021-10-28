import {NodeType} from "../../persist/orm/NodeType";
import {NodeInternalType} from "../../NodeInternalType";
import {NodeProperty, NodePropertyState} from "../../persist/orm/NodeProperty";
import {DbDataType, DbKeyType} from "../../persist/orm/DbAbstraction";
import {UserAccount} from "../UserAccount";
import {UserSession} from "./UserSession";
import DexcaliburEngine from "../../DexcaliburEngine";
import DexcaliburProject from "../../DexcaliburProject";
import {IPersistent} from "../../persist/orm/IPersistent";


export class SessionData implements IPersistent{

    static TYPE:NodeType = new NodeType(
        'session_data',
        NodeInternalType.USER_SESSION_DATA,
        [
            (new NodeProperty('_name'))
                .type(DbDataType.STRING)
                .key(DbKeyType.COMPOSITE, 1),

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

SessionData.TYPE.builder(SessionData);