import {IDatabase, IDbCollection} from "../persist/orm/DbAbstraction";
import HookSet from "../HookSet";
import HookStrategy from "./HookStrategy";
import {HookManagerException} from "../errors/HookManagerException";
import JavaMethodHook from "./JavaMethodHook";
import NativeFunctionHook from "./NativeFunctionHook";
import HookTemplateFragment from "./HookTemplateFragment";
import KeyPoint from "./KeyPoint";
import {SqliteException} from "../../connectors/sqlite/SqliteException";
import SqliteDbCollection from "../../connectors/sqlite/SqliteDbCollection";

/**
 * Represents every datat set related to hook management
 */
export class HookDbApi {

    private _db:IDatabase = null;
    public strategies:IDbCollection = null;
    public fragments:IDbCollection = null;
    public sets:IDbCollection = null;
    public jhooks:IDbCollection = null;
    public nhooks:IDbCollection = null;

    constructor( pDatabase:IDatabase) {
        this._db = pDatabase;
        this._init();
    }

    private _init(){
        if(this._db == null){
            throw HookManagerException.DB_NOT_INITIALIZED();
        }

        this.strategies = this._db.getCollection(HookStrategy.TYPE.getName(), HookStrategy.TYPE);
        this.sets = this._db.getCollection(HookSet.TYPE.getName(), HookSet.TYPE);
        this.fragments = this._db.getCollection(HookTemplateFragment.TYPE.getName(), HookTemplateFragment.TYPE);
        this.jhooks = this._db.getCollection(JavaMethodHook.TYPE.getName(), JavaMethodHook.TYPE);
        this.nhooks = this._db.getCollection(NativeFunctionHook.TYPE.getName(), NativeFunctionHook.TYPE);
    }

    /**
     * Stub.
     * HookSet shoudl be replaced
     *
     * @param pUID
     */
    isHookSetExists(pUID:string){
        return this.sets.hasEntry(pUID);
    }

    isStrategyExists(pUID:string){
        return this.strategies.hasEntry(pUID);
    }

    isJavaHookExists(pUID:string){
        return this.jhooks.hasEntry(pUID);
    }

    isNativeHookExists(pUID:string){
        return this.nhooks.hasEntry(pUID);
    }

    getStrategy( pUID:string) :HookStrategy{
        return this.strategies.getEntry(pUID);
    }

    getHookSet( pUID:string) :HookSet{
        return this.sets.getEntry(pUID);
    }

    getFragments( pUID:string) :HookTemplateFragment{
        return this.fragments.getEntry(pUID);
    }

    getAllJavaHook( pUID:string) :JavaMethodHook[]{
        return this.jhooks.getAll();
    }

    getAllNativeHook( pUID:string) :JavaMethodHook[]{
        return this.nhooks.getAll();
    }

    createHookStrategy( pStrategy:HookStrategy):void {
        const r = this.strategies.addEntry( pStrategy.getUID(), pStrategy);

        if(pStrategy.before != null){
            this.fragments.updateEntry(pStrategy.before);
        }
        if(pStrategy.after != null){
            this.fragments.updateEntry(pStrategy.after);
        }
        if(pStrategy.replace != null){
            this.fragments.updateEntry(pStrategy.replace);
        }

        return r;
    }

    updateHookStrategy( pStrategy:HookStrategy):void {

        if(pStrategy.before != null){
            this.fragments.updateEntry(pStrategy.before);
        }
        if(pStrategy.after != null){
            this.fragments.updateEntry(pStrategy.after);
        }
        if(pStrategy.replace != null){
            this.fragments.updateEntry(pStrategy.replace);
        }

        return this.strategies.updateEntry(pStrategy);
    }

    createHookSet( pSet:HookSet):void {
        return this.sets.addEntry( pSet.getID(), pSet);
    }

    updateHookSet( pSet:HookSet):void {
        return this.sets.updateEntry(pSet);
    }

    createJavaHook( pHook:JavaMethodHook):void {
        return this.jhooks.addEntry( pHook.getGUID(), pHook);
    }

    updateJavaHook( pHook:JavaMethodHook):void {
        return this.jhooks.updateEntry( pHook);
    }


    createNativeHook( pHook:NativeFunctionHook):void {
        return this.nhooks.addEntry( pHook.getGUID(), pHook);
    }

    updateNativeHook( pHook:NativeFunctionHook):void {
        return this.nhooks.updateEntry( pHook);
    }

    createFragment( pFrag:HookTemplateFragment):void {
        return this.fragments.addEntry( pFrag.getUID(), pFrag);
    }

    updateFragments( pFrag:HookTemplateFragment):void {
        return this.fragments.updateEntry( pFrag);
    }
}