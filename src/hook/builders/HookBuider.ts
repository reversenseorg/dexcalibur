import {IDatabase, IDbCollection} from "../../persist/orm/DbAbstraction";
import {JavaHookBuilderException} from "../../errors/JavaHookBuilderException";
import {SqliteDb} from "../../../connectors/sqlite/SqliteDb";
import {HookBuilderRule} from "./HookBuilderRule";
import {JavaHookBuilder} from "./JavaHookBuilder";
import DexcaliburProject from "../../DexcaliburProject";
import {NativeHookBuilder} from "./NativeHookBuilder";


export class HookBuilder {


    private _db:IDbCollection = null;

    java:JavaHookBuilder = null;
    native:NativeHookBuilder = null;

    constructor( pContext:DexcaliburProject) {
        this.java = new JavaHookBuilder();
        this.native = new NativeHookBuilder();
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