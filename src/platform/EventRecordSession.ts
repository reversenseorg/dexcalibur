import InputEvent from "./InputEvent.js";
import Util from "../Utils.js";
import HookSession from "../HookSession.js";
import {Nullable} from "../core/IStringIndex.js";
import {randomUUID} from "crypto";
import {RuntimeEvent, RuntimeEventType} from "../hook/RuntimeEvent.js";

export default class EventRecordSession {
    uid:string = null;
    startTime: number;
    duration: number;
    running: boolean = false;
    events: InputEvent[] = [];
    inputName: string;
    deviceID: string;

    process: any;

    private _sess:Nullable<HookSession> = null;

    constructor( pConfig:any = null) {
        if(pConfig!=null){
            for(const i in pConfig) this[i]=pConfig[i];
        }

        if(this.startTime == null){
            this.startTime = Util.time();
            this.running = true;
        }

        if(this.uid==null){
            this.uid = randomUUID();
        }
    }

    attachChildProcess(pChild:any):void {
        this.process = pChild;
    }


    attachHookSession(pSession:HookSession):void {
        this._sess = pSession;
    }

    push(pEvent:InputEvent):void {
        this.events.push(pEvent);
        this.duration = (Util.time()-this.startTime);

        if(this._sess!=null){
            this._sess.pushExtraRuntimeEvent(new RuntimeEvent({
                data: pEvent,
                rt_type: RuntimeEventType.INPUT_EVT,
                node: [],
                id: pEvent.source+":"+pEvent.timestamp
            }), "input.event.new");
        }
    }

    stop(){
        if(this.process != null){
            this.process.kill();
        }

        this.duration = (Util.time()-this.startTime);
        this.running = false;
    }

    timeSinceLastEvent():number{
        return Util.time()-(this.events[this.events.length].timestamp);
    }

    getUID():string {
        return this.uid;
    }
}