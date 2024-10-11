import {randomUUID} from "crypto";

import HookSession from "../HookSession.js";
import {Nullable} from "../core/IStringIndex.js";
import {RuntimeEvent, RuntimeEventType} from "../hook/RuntimeEvent.js";
import Screenshot from "./Screenshot.js";
import {IBridge} from "../Bridge.js";
import * as Log from '../Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


// Name suggestion ScreenshotAgentRealisation ScreenshotAgentOperation
export default class ScreenshotSession {
    uid:string = null;
    deviceID: string;
    screenshots: Screenshot[];

    private _deviceBridge: IBridge;

    private _sess:Nullable<HookSession> = null;

    constructor( pConfig:any = null) {
        if(pConfig!=null){
            for(const i in pConfig) this[i]=pConfig[i];
        }
        if(this.uid==null){
            this.uid = randomUUID();
        }
    }

    attachHookSession(pSession:HookSession):void {
        this._sess = pSession;
    }

    push(pScreenshot:Screenshot):void {
        this.screenshots.push(pScreenshot);

        if(this._sess!=null){
            this._sess.pushExtraRuntimeEvent(new RuntimeEvent({
                data: pScreenshot,
                rt_type: RuntimeEventType.SCREENSHOT,
                node: [],
                id: "screenshot:" + pScreenshot.timestamp
            }), "output.screen.screenshot");
        }
    }

    performScreenshot(): Screenshot{
        let screenshot = new Screenshot();
        try {
            screenshot = this._deviceBridge.performScreenshot();
        } catch(err) {
            Logger.error("[ScreenShotAgent] Error : " + "\n"+err.message+"\n"+err.stack);
        }
        this.push(screenshot)
        return screenshot;
    }

    getUID():string {
        return this.uid;
    }
}