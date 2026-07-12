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

import InputEvent from "./InputEvent.js";
import UT from "../Utils.js";
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
            this.startTime = UT.time();
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
        this.duration = (UT.time()-this.startTime);

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

        this.duration = (UT.time()-this.startTime);
        this.running = false;
    }

    timeSinceLastEvent():number{
        return UT.time()-(this.events[this.events.length].timestamp);
    }

    getUID():string {
        return this.uid;
    }
}