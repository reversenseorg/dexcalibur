
import {JavaHookBuilder} from "./JavaHookBuilder.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import {NativeHookBuilder} from "./NativeHookBuilder.js";
import {IDatabase, IDbCollection} from "@dexcalibur/dexcalibur-orm";


export class HookBuilder {


    private _db:IDbCollection = null;

    java:JavaHookBuilder = null;
    native:NativeHookBuilder = null;

    constructor( pContext:DexcaliburProject) {
        this.java = new JavaHookBuilder(pContext);
        this.native = new NativeHookBuilder(pContext);
    }

    /**
     * To init KP manager according to target OS
     */
    init( pDB:IDatabase):HookBuilder{
        /*
        if(pDB == null) throw JavaHookBuilderException.INVALID_DB();

        this._db = (pDB as SqliteDb).newCollection( HookBuilderRule.TYPE.getName(), HookBuilderRule.TYPE) ;
        this._db.getAll(false, true);

        if(this._db.size() == 0){

        }

*/
        return this;
    }
}