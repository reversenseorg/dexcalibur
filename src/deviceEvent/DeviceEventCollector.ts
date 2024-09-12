import * as Log from '../Logger.js';
import AdbWrapper from "../AdbWrapper.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;
import * as _child_process_ from "child_process";
import {IBridge} from "../Bridge.js";
import {elementAt} from "rxjs";
import e from "express";


export default class DeviceEventCollector {

    static getEventCommand = "getevent -ltq";
    static showPossibleEventCommand = "getevent -lp";

    childProcess: _child_process_.ChildProcess = null;

    deviceBridge: IBridge;

    deviceEvents: Record<string, any>[] = [];

    constructor(deviceBridge: IBridge) {
        this.deviceBridge = deviceBridge;
    }
    /**
     * To listen to devices events from the device through adb getevent
     *
     * @param {IBridge} deviceBridge A bridge to a device through whom the collection will happen.
     */
    start() {
        console.log('[DeviceEventCollector] START CollectDeviceEvents');
        try {
            this.childProcess = this.deviceBridge.spawn(DeviceEventCollector.getEventCommand);
            this.childProcess.stdout.on('data', (data) => {
                let parsedEventChunk : Record<string, any>[] = DeviceEventCollector.parseEventChunk(data.toString());
                parsedEventChunk.forEach((event : Record<string, any>) => {
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

    initDeviceEventsLabel() {
        console.log('[DeviceEventCollector] START initDeviceEventsLabel');
        let commandResult = this.deviceBridge.shell(DeviceEventCollector.showPossibleEventCommand);
        this.parsePossibleEvent();
        console.log(commandResult);
    }

    static parseEventChunk(eventChunk: string) {
        let parsedEventChunk = [];
        let eventLines = eventChunk.split(/\n/);
        eventLines.forEach((line) => {
            let elements = line.split(/\s+/);
            if (elements.length >= 6) {
                let timestamp: number = + elements[1].split("]")[0];
                let device = elements[2].split(":")[0];
                let eventType = elements[3];
                let eventName = elements[4];
                let eventValue = elements[5];
                let parsedLine = {"timestamp": timestamp, "device":device ,"eventType": eventType,
                    "eventName": eventName, "eventValue": eventValue};
                parsedEventChunk.push(parsedLine);
            }
        })
        return parsedEventChunk;
    }

    parsePossibleEvent() {
        return;
    }

    getDeviceEvents() {
        return this.deviceEvents;
    }
}