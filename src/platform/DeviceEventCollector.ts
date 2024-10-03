import * as Log from '../Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;
import * as _child_process_ from "child_process";
import {IBridge} from "../Bridge.js";
import AndroidPhysicalEventWrapper from "./AndroidPhysicalEventWrapper.js";
import InputEvent from "./InputEvent.js";


export default class DeviceEventCollector {

    static getKernelTime = "cat /proc/uptime";
    // static getEventCommand = "getevent -ltq";
    static getEventCommand = "cat /dev/input/event1";
    static listDevicesEventsCommand = "getevent -lp"; // cat /proc/bus/input/devices

    childProcess: _child_process_.ChildProcess = null;

    deviceBridge: IBridge;
    eventWrapper: AndroidPhysicalEventWrapper;

    deviceEvents: Record<string, any>[] = [];

    constructor(deviceBridge: IBridge) {
        this.deviceBridge = deviceBridge;
        this.eventWrapper = new AndroidPhysicalEventWrapper();
    }

    /**
     * Start child process to collect devices events with adb getevent
     */
    start() {
        console.log('[DeviceEventCollector] START CollectDeviceEvents');
        try {
            this.childProcess = this.deviceBridge.spawn(DeviceEventCollector.getEventCommand);
            this.childProcess.stdout.on('data', (data) => {
                let parsedEventChunk : InputEvent[] = this.parseEventChunk(data);
                parsedEventChunk.forEach((event) => {
                    this.deviceEvents.push(event);
                })
                console.log("[DeviceEventCollector] parsedEventChunk : ", parsedEventChunk);
            });
            this.childProcess.stderr.on('data', (data) => {
                Logger.error(`[DeviceEventCollector] stderr: ${data}`);
            });
            this.childProcess.on('error', (error) => {
                Logger.error(`[DeviceEventCollector] error: ${error.message}`);
            });
            this.childProcess.on('close', (code) => {
                console.log(`[DeviceEventCollector] child process exited with code ${code}`);
            });

        } catch(err) {
            Logger.error("[DeviceEventCollector] Error : " + "\n"+err.message+"\n"+err.stack);
        }
    }

    stop(){
        if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill();
            console.log('[DeviceEventCollector] STOP');
        }
        console.log('[DeviceEventCollector] Dump DeviceEvents : ', this.getDeviceEvents());
    }

    /**
     * To Retrieve the list of possible device events from device.
     */
    listDeviceEvents() {
        let commandResult = this.deviceBridge.shell(DeviceEventCollector.listDevicesEventsCommand);
        this.parseListDevicesEvents(commandResult.toString());
        console.log(commandResult);
    }

    parseEventChunk(eventChunk: Buffer): InputEvent[] {
        let decodeBufferChunk = this.eventWrapper.decodeBufferChunk(eventChunk);
        return decodeBufferChunk;
    }

    parseListDevicesEvents(commandResult: string) {
        return;
    }

    getDeviceEvents() {
        return this.deviceEvents;
    }
}