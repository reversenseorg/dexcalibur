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