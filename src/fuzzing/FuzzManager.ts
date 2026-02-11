import DexcaliburProject from "../DexcaliburProject.js";
import * as Log from "../Logger.js";
import InputEvent from "../platform/InputEvent.js";
import FuzzSession, {FuzzState} from "./FuzzSession.js";
import {BusSubscriber} from "../Bus.js";
import BusEvent from "../BusEvent.js";
import {FuzzingEvent, FuzzSessionUID, IFuzzingEvent} from "./common.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import { UserAccount } from "../user/UserAccount.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface FuzzManagerOpts {
    lastUiState?: ModelUiStruct;
    uiStateStructList?: ModelUiStruct[];
    transitionList?: ModelUiTransition[];
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


    fuzzSessions: FuzzSession[] = [];
    results: any = [];
    fuzzInputValue:any;
    initialSteps:UiState[] = [];
    lastInitialStepIndex:number = -1;
    fuzzEventResolver;



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

    endSession(pClues, pResult:boolean = true){
        this.fuzzSessions[-1].setState(FuzzState.DONE);
        this.results.append([this.fuzzSessions[-1].fuzzInputValue, pResult, pClues]);
        //this.fuzzSessions.pop(); delete

    }



    async getSessionByUID(pUserAccount:UserAccount,  pSess:FuzzSessionUID):Promise<Nullable<FuzzSession>> {
        const res = await this.ctx.getProjectDB().search({
            _uid: pSess
        }, FuzzSession.TYPE.getType())

        return res.length>0?res[0]:null;
    }

    getLiveSession(pSess:FuzzSessionUID):Nullable<FuzzSession> {
        return null;
    }

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
