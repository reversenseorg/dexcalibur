
import HookSet from "../HookSet.js";
import HookStrategy from "./HookStrategy.js";
import {HookManagerException} from "../errors/HookManagerException.js";
import JavaMethodHook from "./JavaMethodHook.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import HookSession from "../HookSession.js";
import {RuntimeEvent} from "./RuntimeEvent.js";
import {IDatabase, IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {ProjectDatabase} from "../database/ProjectDatabase.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";

/**
 * Represents every datat set related to hook management
 */
export class HookDbApi {

    private _db:ProjectDatabase;

    public strategies:MongodbDbCollection;
    public fragments:MongodbDbCollection;
    public sets:MongodbDbCollection;
    public jhooks:MongodbDbCollection;
    public nhooks:MongodbDbCollection;
    public sessions:MongodbDbCollection;
    public events:MongodbDbCollection;

    constructor( pDatabase:ProjectDatabase) {
        this._db = pDatabase;
        this._init();
    }

     private _init(){
        if(this._db == null){
            throw HookManagerException.DB_NOT_INITIALIZED();
        }

        this.strategies = this._db.getCollectionOf(HookStrategy.TYPE.getType()) as MongodbDbCollection;
        this.sets = this._db.getCollectionOf(HookSet.TYPE.getType()) as MongodbDbCollection;
        this.fragments = this._db.getCollectionOf(HookTemplateFragment.TYPE.getType()) as MongodbDbCollection;
        this.jhooks = this._db.getCollectionOf(JavaMethodHook.TYPE.getType()) as MongodbDbCollection;
        this.nhooks = this._db.getCollectionOf(NativeFunctionHook.TYPE.getType()) as MongodbDbCollection;
        this.sessions = this._db.getCollectionOf(HookSession.TYPE.getType()) as MongodbDbCollection;
        this.events = this._db.getCollectionOf(RuntimeEvent.TYPE.getType()) as MongodbDbCollection;
    }

    /**
     * Stub.
     * HookSet shoudl be replaced
     *
     * @param pUID
     */
    async isHookSetExists(pUID:string):Promise<boolean>{
        return await this.sets.asyncHasEntry({ id: pUID });
    }

    async isStrategyExists(pUID:string):Promise<boolean>{
        return await this.strategies.asyncHasEntry({ _uid: pUID });
    }

    async isJavaHookExists(pUID:string):Promise<boolean>{
        return await this.jhooks.asyncHasEntry({ _uid: pUID });
    }

    async isNativeHookExists(pUID:string):Promise<boolean>{
        return await this.nhooks.asyncHasEntry({ _uid: pUID });
    }

    async isHookSessionExists(pUID:string):Promise<boolean>{
        return await this.sessions.asyncHasEntry({ _uid: pUID });
    }

    async isRuntimeEventExists(pUID:string):Promise<boolean>{
        return await this.events.asyncHasEntry({ _uid: pUID });
    }

    async getStrategy( pUID:string) :Promise<HookStrategy>{
        return await this.strategies.asyncGetEntry({ _uid:pUID });
    }

    async getHookSet( pUID:string) :Promise<HookSet>{
        return await this.sets.asyncGetEntry({ id:pUID });
    }

    async getFragments( pUID:string) :Promise<HookTemplateFragment>{
        return await this.fragments.asyncGetEntry({ _uid:pUID });
    }

    async getAllJavaHook( ) :Promise<JavaMethodHook[]>{
        return await this.jhooks.getAsList();
    }

    async getAllHookSet( ) :Promise<HookSet[]>{
        return await this.sets.getAsList();
    }

    async getAllNativeHook( ) :Promise<NativeFunctionHook[]>{
        return await this.nhooks.getAsList();
    }

    async getSession( pUID:string) :Promise<HookSession>{
        return await this.sessions.asyncGetEntry({ _uid:pUID });
    }

    async getRuntimeEvent( pUID:string) :Promise<RuntimeEvent<any>>{
        return await this.events.asyncGetEntry({ id:pUID });
    }


    async createHookStrategy( pStrategy:HookStrategy):Promise<any> {
        const r = await this.strategies.asyncAddEntry( pStrategy.getUID(), pStrategy);

        if(pStrategy.before != null){
            await this.fragments.asyncUpdateEntry(pStrategy.before);
        }
        if(pStrategy.after != null){
            await this.fragments.asyncUpdateEntry(pStrategy.after);
        }
        if(pStrategy.replace != null){
            await this.fragments.asyncUpdateEntry(pStrategy.replace);
        }

        return r;
    }

    async updateHookStrategy( pStrategy:HookStrategy):Promise<any> {

        if(pStrategy.before != null){
            await this.fragments.asyncUpdateEntry(pStrategy.before);
        }
        if(pStrategy.after != null){
            await this.fragments.asyncUpdateEntry(pStrategy.after);
        }
        if(pStrategy.replace != null){
            await this.fragments.asyncUpdateEntry(pStrategy.replace);
        }

        return await this.strategies.asyncUpdateEntry(pStrategy);
    }

    /**
     * To remove a hook strategy from the hook db
     *
     * @param pStrategy
     */
    async removeHookStrategy( pStrategy:HookStrategy):Promise<boolean> {
        if(pStrategy.before != null){
            await this.fragments.asyncRemoveEntry(pStrategy.before);
        }
        if(pStrategy.after != null){
            await this.fragments.asyncRemoveEntry(pStrategy.after);
        }
        if(pStrategy.replace != null){
            await this.fragments.asyncRemoveEntry(pStrategy.replace);
        }

        return await this.strategies.asyncRemoveEntry(pStrategy);
    }

    async createHookSet( pSet:HookSet):Promise<any> {
        return await this.sets.asyncAddEntry( pSet.getID(), pSet);
    }

    async updateHookSet( pSet:HookSet):Promise<any> {
        return await this.sets.asyncUpdateEntry(pSet);
    }

    /**
     * To remove an hook set from the db
     *
     * @param pSet
     */
    async removeHookSet( pSet:HookSet):Promise<boolean> {
        return await this.sets.asyncRemoveEntry(pSet);
    }

    async createHookSession( pSess:HookSession):Promise<any> {
        //await this.sessions.asyncAddEntry( pSess.getUID(), pSess);

        if(pSess.message.length > 0){
            for(let i=0; i<pSess.message.length; i++){
                await this.events.asyncAddEntry( pSess.message[i].getUID(),  pSess.message[i]);
            }
        }

        return await this.sessions.asyncAddEntry( pSess.getUID(), pSess);
    }

    async createRuntimeEvent( pEvent:RuntimeEvent<any>):Promise<any> {
        return await this.events.asyncAddEntry( pEvent.getUID(), pEvent);
    }

    async createJavaHook( pHook:JavaMethodHook):Promise<any> {
        return await this.jhooks.asyncAddEntry( pHook.getGUID(), pHook);
    }

    async updateJavaHook( pHook:JavaMethodHook):Promise<boolean> {
        return await this.jhooks.asyncUpdateEntry( pHook);
    }

    async updateHookSession( pSession:HookSession):Promise<any> {

        const res = await this.sessions.asyncUpdateEntry( pSession, {upsert:true});
        const msg = pSession.messages();
        for(let i=0; i<msg.length; i++){
            await this.events.asyncUpdateEntry( msg[i], {upsert:true});
            msg[i].saved = true;
        }

        return res;
    }

    async updateRuntimeEvent( pEvent:RuntimeEvent<any>):Promise<any> {
        return await this.events.asyncUpdateEntry( pEvent);
    }

    async removeHookSession( pSession:HookSession):Promise<boolean> {
        return await this.sessions.asyncRemoveEntry( pSession);
    }

    async removeRuntimeEvent( pEvent:RuntimeEvent<any>):Promise<boolean> {
        return await this.events.asyncRemoveEntry( pEvent);
    }

    async removeJavaHook( pHook:JavaMethodHook):Promise<boolean> {
        return await this.jhooks.asyncRemoveEntry( pHook);
    }


    async createNativeHook( pHook:NativeFunctionHook):Promise<any> {
        return await this.nhooks.asyncAddEntry( pHook.getGUID(), pHook);
    }

    async updateNativeHook( pHook:NativeFunctionHook):Promise<any> {
        return await this.nhooks.asyncUpdateEntry( pHook);
    }

    async removeNativeHook( pHook:NativeFunctionHook):Promise<boolean> {
        return await this.nhooks.asyncRemoveEntry( pHook);
    }

    async createFragment( pFrag:HookTemplateFragment):Promise<any> {
        return await this.fragments.asyncAddEntry( pFrag.getUID(), pFrag);
    }

    async updateFragment( pFrag:HookTemplateFragment):Promise<any> {
        return await this.fragments.asyncUpdateEntry( pFrag);
    }

    async removeFragment( pFrag:HookTemplateFragment):Promise<boolean> {
        return await this.fragments.asyncRemoveEntry( pFrag);
    }

    /**
     *
     * @param pCreate
     */
    save(){

        console.error("[HOOK DB API] useless save called")
        /*
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
            if(this.events.asyncHasEntry(vEvent.getUID())){
                this.updateRuntimeEvent( vEvent);
            }else{
                this.createRuntimeEvent( vEvent);
            }
        });*/
    }
}