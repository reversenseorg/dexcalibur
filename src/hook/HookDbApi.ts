import {IDatabase, IDbCollection} from "../persist/orm/DbAbstraction.js";
import HookSet from "../HookSet.js";
import HookStrategy from "./HookStrategy.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import JavaMethodHook from "./JavaMethodHook.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import HookSession from "../HookSession.js";
import {RuntimeEvent} from "./RuntimeEvent.js";

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
    public sessions:IDbCollection = null;
    public events:IDbCollection = null;

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
        this.sessions = this._db.getCollection(HookSession.TYPE.getName(), HookSession.TYPE);
        this.events = this._db.getCollection(RuntimeEvent.TYPE.getName(), RuntimeEvent.TYPE);
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

    isHookSessionExists(pUID:string){
        return this.sessions.hasEntry(pUID);
    }

    isRuntimeEventExists(pUID:string){
        return this.events.hasEntry(pUID);
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

    getSession( pUID:string) :HookSession{
        return this.sessions.getEntry(pUID);
    }

    getRuntimeEvent( pUID:string) :RuntimeEvent<any>{
        return this.events.getEntry(pUID);
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

    /**
     * To remove a hook strategy from the hook db
     *
     * @param pStrategy
     */
    removeHookStrategy( pStrategy:HookStrategy):boolean {
        if(pStrategy.before != null){
            this.fragments.removeEntry(pStrategy.before.getUID());
        }
        if(pStrategy.after != null){
            this.fragments.removeEntry(pStrategy.after.getUID());
        }
        if(pStrategy.replace != null){
            this.fragments.removeEntry(pStrategy.replace.getUID());
        }

        return this.strategies.removeEntry(pStrategy.getUID());
    }

    createHookSet( pSet:HookSet):void {
        return this.sets.addEntry( pSet.getID(), pSet);
    }

    updateHookSet( pSet:HookSet):void {
        return this.sets.updateEntry(pSet);
    }

    /**
     * To remove an hook set from the db
     *
     * @param pSet
     */
    removeHookSet( pSet:HookSet):boolean {
        return this.sets.removeEntry(pSet.getID());
    }

    createHookSession( pSess:HookSession):void {
        this.sessions.addEntry( pSess.getUID(), pSess);

        if(pSess.message.length > 0){
            pSess.message.map( (vEvent:RuntimeEvent<any>)=>{
                this.events.addEntry( vEvent.getUID(),  vEvent);
            })
        }

        return this.sessions.addEntry( pSess.getUID(), pSess);
    }

    createRuntimeEvent( pEvent:RuntimeEvent<any>):void {
        return this.events.addEntry( pEvent.getUID(), pEvent);
    }

    createJavaHook( pHook:JavaMethodHook):void {
        return this.jhooks.addEntry( pHook.getGUID(), pHook);
    }

    updateJavaHook( pHook:JavaMethodHook):void {
        return this.jhooks.updateEntry( pHook);
    }

    updateHookSession( pSession:HookSession):void {
        const res = this.sessions.updateEntry( pSession);
        pSession.messages().map((vEvent)=>{
            if(!vEvent.saved){
                this.events.addEntry( vEvent.getUID(), vEvent);
                vEvent.saved = true;
            }
        });
    }

    updateRuntimeEvent( pEvent:RuntimeEvent<any>):void {
        return this.events.updateEntry( pEvent);
    }

    removeHookSession( pSession:HookSession):boolean {
        return this.sessions.removeEntry( pSession.getUID());
    }

    removeRuntimeEvent( pEvent:RuntimeEvent<any>):boolean {
        return this.events.removeEntry( pEvent.getUID());
    }

    removeJavaHook( pHook:JavaMethodHook):boolean {
        return this.jhooks.removeEntry( pHook.getGUID());
    }


    createNativeHook( pHook:NativeFunctionHook):void {
        return this.nhooks.addEntry( pHook.getGUID(), pHook);
    }

    updateNativeHook( pHook:NativeFunctionHook):void {
        return this.nhooks.updateEntry( pHook);
    }

    removeNativeHook( pHook:NativeFunctionHook):boolean {
        return this.nhooks.removeEntry( pHook.getGUID());
    }

    createFragment( pFrag:HookTemplateFragment):void {
        return this.fragments.addEntry( pFrag.getUID(), pFrag);
    }

    updateFragment( pFrag:HookTemplateFragment):void {
        return this.fragments.updateEntry( pFrag);
    }

    removeFragment( pFrag:HookTemplateFragment):boolean {
        return this.fragments.removeEntry( pFrag.getUID());
    }

    save( pCreate = false){
        this.jhooks.map( (vOffset, vHook:JavaMethodHook)=>{
            if(this.jhooks.hasEntry(vHook.getGUID())){
                this.updateJavaHook( vHook);
            }else{
                this.createJavaHook( vHook);
            }
        });

        this.nhooks.map( (vOffset, vHook:NativeFunctionHook)=>{
            if(this.nhooks.hasEntry(vHook.getGUID())){
                this.updateNativeHook( vHook);
            }else{
                this.createNativeHook( vHook);
            }
        });


        this.strategies.map( (vOffset, vStra:HookStrategy)=>{
            if(this.strategies.hasEntry(vStra.getUID())){
                this.updateHookStrategy( vStra);
            }else{
                this.createHookStrategy( vStra);
            }
        });


        this.fragments.map( (vOffset, vFrag:HookTemplateFragment)=>{
            if(this.fragments.hasEntry(vFrag.getUID())){
                this.updateFragment( vFrag);
            }else{
                this.createFragment( vFrag);
            }
        });


        this.sets.map( (vOffset, vSet:HookSet)=>{
            if(this.sets.hasEntry(vSet.getID())){
                this.updateHookSet( vSet);
            }else{
                this.createHookSet( vSet);
            }
        });

        this.sessions.map( (vOffset, vSess:HookSession)=>{
            if(this.sessions.hasEntry(vSess.getUID())){
                this.updateHookSession( vSess);
            }else{
                this.createHookSession( vSess);
            }
        });

        this.events.map( (vOffset, vEvent:RuntimeEvent<any>)=>{
            if(this.events.hasEntry(vEvent.getUID())){
                this.updateRuntimeEvent( vEvent);
            }else{
                this.createRuntimeEvent( vEvent);
            }
        });
    }
}