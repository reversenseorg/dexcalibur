import {NodeType} from "./persist/orm/NodeType.js";
import {NodeInternalType} from "./NodeInternalType.js";
import {NodeProperty, NodePropertyState} from "./persist/orm/NodeProperty.js";
import {DbDataType, DbKeyType, DbSerialize, IDbCollection} from "./persist/orm/DbAbstraction.js";
import {ValidationRule} from "./Validator.js";
import DataScope from "./DataScope.js";
import ModelFileSection from "./ModelFileSection.js";
import DexcaliburProject from "./DexcaliburProject.js";

/**
 * A class to save the state of an analyzer or analyzed entities
 *
 * @class
 */
export class AnalyzerState {

    static TYPE:NodeType = new NodeType(
        "anal_state",
        NodeInternalType.ANAL_STATE,
        [
            (new NodeProperty("_uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("state"))
                .type(DbDataType.STRING)
                .sleep( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.stringify(x.p) : null)})
                .wakeUp( (x:NodePropertyState)=>{ return (x.p!=null ? JSON.parse(x.p) : null)}),
            (new NodeProperty("modified")).type(DbDataType.NUMERIC).def(-1)
        ]);


    __:NodeInternalType = NodeInternalType.ANAL_STATE;

    _uid:string;

    state:any = {};

    modified = -1;

    /**
     * The collection where the state is backed up
     * @private
     */
    private _coll:IDbCollection = null;

    constructor(pConfig:any = {}) {
      for(const i in pConfig) this[i] = pConfig[i];
    }

    isReady(){
        return (this._coll!=null);
    }

    setContext(pCtx:DexcaliburProject){
        this._coll = pCtx.getDB().getCollection('anal_state', AnalyzerState.TYPE)
    }

    save():any{
        return this._coll.updateEntry(this);
    }

}

AnalyzerState.TYPE.builder(AnalyzerState);