/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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