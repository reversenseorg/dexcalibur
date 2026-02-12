import DexcaliburProject from "../DexcaliburProject.js";
import * as Log from "../Logger.js";
import InputEvent from "../platform/InputEvent.js";
import FuzzSession, {FuzzSessionOpts, FuzzState} from "./FuzzSession.js";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import {FuzzingEvent, FuzzSessionUID, IFuzzingEvent} from "./common.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import { UserAccount } from "../user/UserAccount.js";
import {FuzzerException} from "../errors/FuzzerException.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface FuzzManagerOpts {
    //lastUiState?: ModelUiStruct;
    //uiStateStructList?: ModelUiStruct[];
    //transitionList?: ModelUiTransition[];
    eventsHistory?: InputEvent[];
}

export enum FUZZ_EVENT_TYPE {
    SUCCESS = "success",
    FAILURE = "failure",
    INFO = "info"
}


/**
 * Manager to manage Fuzzing Session.
 *
 * @class
 */
export default class FuzzManager {

    ctx: DexcaliburProject = null;

    /**
     * Cache contains only local and active session
     */
    cache: FuzzSession[] = [];

    results: any = [];

    /**
     * @constructor
     */
    constructor(pCtx: DexcaliburProject) {
        this.ctx = pCtx;
    }

    setOptions(pOpts: FuzzManagerOpts){
        for(const i in pOpts) this[i] = pOpts[i];
    }

    /**
     * @method
     */
    performInitialSteps(){
        /*let currentUiState = this.getCurrentUiState();
        if (needHardReset || currentUiState ==null || this.initialSteps.includes(currentUiState)) {
            // reset
            // currentUiState = initialSteps[0][0];
            // this.lastCurrentUiCmp = null;
            // this.lastCurrentProgramedAction = null;
            // this.lastInitialStepIndex = 0;
        }
        this.lastInitialStepIndex += 1;
        this.performAction(this.initialSteps[this.lastInitialStepIndex]);*/
    }

    /**
     * To get a session from database
     *
     * Should not be used to get an active session (use getLiveSession instead).
     *
     * @param {UserAccount} pUserAccount
     * @param {FuzzSessionUID} pSess Session UID
     * @returns {Promise<Nullable<FuzzSession>>}
     * @async
     */
    async getSessionByUID(pUserAccount:UserAccount,  pSess:FuzzSessionUID):Promise<Nullable<FuzzSession>> {
        const res = await this.ctx.getProjectDB().search({
            _uid: pSess
        }, FuzzSession.TYPE.getType())

        return res.length>0?res[0]:null;
    }

    /**
     * To create a new fuzzing session,
     *
     * Init various paraneters and save it into database.
     *
     * @param {UserAccount} pUserAccount
     * @param {FuzzSessionOpts} pOpts
     * @returns {Promise<FuzzSession>}
     * @async
     */
    async createSession(pUserAccount:UserAccount, pOpts:FuzzSessionOpts):Promise<FuzzSession> {
        // TODO : check ACL

        // create session
        let sess = new FuzzSession({
            mgr: this,
            ...pOpts
        });

        // generate UUID
        sess.setUID(await this.ctx.getProjectDB().generateFreeUuid( FuzzSession.TYPE.getType()));

        // save
        if(pOpts.termPoint!=null){
           // await sess.setTerminalPoint(pOpts.termPoint);
        }

        sess = await this.ctx.getProjectDB().save(sess) as FuzzSession;

        return sess;
    }

    /**
     * To drop a session from database
     * @param pSess
     */
    async dropSession(pSess:FuzzSessionUID):Promise<void>{
        await this.ctx.getProjectDB()
            .getCollectionOf(FuzzSession.TYPE.getType())
            .asyncRemoveEntry({
                [FuzzSession.TYPE.getPrimaryKey().getName()]: pSess
            });
    }

    /**
     * To get an active session from its UID
     *
     * It is the fastest way to get a session from its UID.
     *
     * @param {FuzzSessionUID} pSess Session UID
     * @returns {Nullable<FuzzSession>} Return the session if found, else NULL
     * @throws {FuzzerException} If current instance is master, throw an exception.
     */
    getLiveSession(pSess:FuzzSessionUID):Nullable<FuzzSession> {
        if(this.ctx.engine.isMaster()){
            throw FuzzerException.MASTER_CANNOT_RUN("")
        }

        return this.cache.find(vS => vS.getUID()===pSess);
    }

    /**
     * To deploy the manager into the bus
     *
     *
     */
    registerListener():void {

        this.ctx.getBus().subscribe(FuzzingEvent.STOP, BusSubscriber.from((vEvent:BusEvent<IFuzzingEvent>)=>{
            if(vEvent.getData().fsid==null) return;

            const s = this.getLiveSession(vEvent.getData().fsid);
            if(s!=null) s.stop();
        }));
        this.ctx.getBus().subscribe(FuzzingEvent.START, BusSubscriber.from((vEvent:BusEvent<IFuzzingEvent>)=>{
            if(vEvent.getData().fsid==null) return;

            const s = this.getLiveSession(vEvent.getData().fsid);
            if(s!=null) s.start();
        }));
        this.ctx.getBus().subscribe(FuzzingEvent.PAUSE, BusSubscriber.from((vEvent:BusEvent<IFuzzingEvent>)=>{
            if(vEvent.getData().fsid==null) return;

            const s = this.getLiveSession(vEvent.getData().fsid);
            if(s!=null) s.pause();
        }));
        this.ctx.getBus().subscribe(FuzzingEvent.RESUME, BusSubscriber.from((vEvent:BusEvent<IFuzzingEvent>)=>{
            if(vEvent.getData().fsid==null) return;

            const s = this.getLiveSession(vEvent.getData().fsid);
            if(s!=null) s.pause();
        }));


        this.ctx.getBus().subscribe([
                FuzzingEvent.STEP_END,
                FuzzingEvent.STEP_START,
                FuzzingEvent.STEP_CRASH,
            ], BusSubscriber.from((vEvent:BusEvent<IFuzzingEvent>)=>{
            if(vEvent.getData().fsid==null) return;

            const s = this.getLiveSession(vEvent.getData().fsid);
            if(s!=null) s.pause();
        }));
    }
}
