import * as Log from '../Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;
import * as _child_process_ from "child_process";
import {IBridge} from "../Bridge.js";
import InputEvent from "./InputEvent.js";
import {IInputDeviceDecoder} from "./kernels/common/IInputDeviceDecoder.js";
import EventRecordSession from "./EventRecordSession.js";
import {Nullable} from "../core/IStringIndex.js";
import {Device} from "../Device.js";


export default class DeviceEventCollector {

    static getKernelTime = "cat /proc/uptime";

    private _deviceBridge: IBridge;

    private _decoder:IInputDeviceDecoder;

    private _devUID:string;

    constructor(pDeviceUID:string, pDeviceBridge: IBridge, pDecoder:IInputDeviceDecoder) {
        this._devUID = pDeviceUID;
        this._deviceBridge = pDeviceBridge;
        this._decoder = pDecoder;
    }

    /**
     * Start child process to collect devices events with adb getevent
     */
    start(pInputName:string, pSysfs:string):EventRecordSession {

        const session = new EventRecordSession({
            deviceID:this._devUID,
            inputName:pInputName,
        });

        console.log('[DeviceEventCollector] START CollectDeviceEvents');
        try {
            const childProcess = this._deviceBridge.spawn(`cat ${pSysfs}`);
            childProcess.stdout.on('data', (data) => {
                let parsedEventChunk : InputEvent[] = this.parseEventChunk(data);
                parsedEventChunk.forEach((event) => {
                    event.source = pInputName;
                    session.push(event);
                })
                //console.log("[DeviceEventCollector] parsedEventChunk : ", parsedEventChunk);
            });
            childProcess.stderr.on('data', (data) => {
                session.stop();
                Logger.error(`[DeviceEventCollector] stderr: ${data}`);
            });
            childProcess.on('error', (error) => {
                session.stop();
                Logger.error(`[DeviceEventCollector] error: ${error.message}`);
            });
            childProcess.on('close', (code) => {
                session.stop();
                console.log(`[DeviceEventCollector] child process exited with code ${code}`);
            });

            session.attachChildProcess(childProcess);

        } catch(err) {
            Logger.error("[DeviceEventCollector] Error : " + "\n"+err.message+"\n"+err.stack);
            if(session!=null){
                session.stop();
            }
        }
        return session;
    }

    parseEventChunk(pEventChunk: Buffer): InputEvent[] {
        return this._decoder.decodeBufferChunk(pEventChunk);
    }
}