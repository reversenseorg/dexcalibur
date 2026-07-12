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

import * as Log from '../Logger.js';
import {IBridge} from "../Bridge.js";
import Screenshot from "./Screenshot.js";
import ScreenshotSession from "./ScreenshotSession.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


// TODO: chose a class name: ScreenshotCollector Agent
export default class ScreenshotAgent {

    private _deviceBridge: IBridge;

    private _devUID:string;

    // private defaultDisplayId:string; // dumpsys SurfaceFlinger --display-id

    constructor(pDeviceUID:string, pDeviceBridge: IBridge) {
        this._devUID = pDeviceUID;
        this._deviceBridge = pDeviceBridge;
    }

    /**
     * Start child process to take a screenshot through the device bridge.
     */
    start(): ScreenshotSession{
        const session = new ScreenshotSession({
            deviceID:this._devUID, _deviceBridge: this._deviceBridge
        });
        console.log('[ScreenShotAgent] START ScreenshotSession');
        return session;
    }

    /**
     * @deprecated
     */
    performScreenshot(){
        let screenshot = new Screenshot();
        try {
            screenshot = this._deviceBridge.performScreenshot();
        } catch(err) {
            Logger.error("[ScreenShotAgent] Error : " + "\n"+err.message+"\n"+err.stack);
        }
        return screenshot;
    }
}