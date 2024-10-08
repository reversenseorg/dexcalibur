import * as Log from '../Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;
import * as _child_process_ from "child_process";
import {IBridge} from "../Bridge.js";


/**
 *
 * @deprecated
 */
export default class AndroidEventRecordSession {

    static getKernelTime = "cat /proc/uptime";
    static listDevicesEventsCommand = "cat /proc/bus/input/devices"

    static getEventCommand = "cat /dev/input/event";

    deviceHandlerNumber: number;

    childProcess: _child_process_.ChildProcess = null;

    deviceBridge: IBridge;

    deviceEvents: Record<string, any>[] = [];

    constructor(deviceBridge: IBridge, deviceHandlerNumber: number) {
        this.deviceBridge = deviceBridge;
        this.deviceHandlerNumber = deviceHandlerNumber;
    }

    /**
     * Start child process to collect devices events with adb getevent
     */
    start() {
        console.log('[AndroidEventRecordSession] START CollectDeviceEvents');
        try {
            //this.childProcess = this.deviceBridge.spawn(AndroidEventRecordSession.getEventCommand);
            this.childProcess = _child_process_.spawn(AndroidEventRecordSession.getEventCommand + this.deviceHandlerNumber);
            this.childProcess.stdout.on('data', (data) => {

                console.log("Parse New Chunk");
                console.log(data);
                console.log("End log chunk");
                let parsedEventChunk : Record<string, any>[] = AndroidEventRecordSession.parseEventChunk(data);
                parsedEventChunk.forEach((event : Record<string, any>) => {
                    this.deviceEvents.push(event);
                })
                console.log("[AndroidEventRecordSession] parsedEventChunk : ", parsedEventChunk);
            });
            this.childProcess.stderr.on('data', (data) => {
                Logger.error(`[AndroidEventRecordSession] stderr: ${data}`);
            });
            this.childProcess.on('error', (error) => {
                Logger.error(`[AndroidEventRecordSession] error: ${error.message}`);
            });
            this.childProcess.on('close', (code) => {
                console.log(`[AndroidEventRecordSession] child process exited with code ${code}`);
            });

        } catch(err) {
            Logger.error("[AndroidEventRecordSession] Error : " + "\n"+err.message+"\n"+err.stack);
        }
    }

    stop(){
        if (this.childProcess && !this.childProcess.killed) {
            this.childProcess.kill();
            console.log('[AndroidEventRecordSession] STOP');
        }
        console.log('[AndroidEventRecordSession] Dump DeviceEvents : ', this.getDeviceEvents());
    }

    /**
     * To Retrieve the list of possible device events from device.
     */
    listDeviceEvents() {
        let commandResult = this.deviceBridge.shell(AndroidEventRecordSession.listDevicesEventsCommand);
        this.parseListDevicesEvents(commandResult.toString());
        console.log(commandResult);
    }

    static parseEventChunk(eventChunk: Buffer) {
        const EVENT_SIZE = 24; // Depends on the architecture/device
        let parsedEventChunk: any[] = [];
        let numberOfEvents = (eventChunk.length / EVENT_SIZE >>0);
        for (let i = 0; i < numberOfEvents; i++) {
            let eventBuffer = eventChunk.subarray(EVENT_SIZE*i, EVENT_SIZE*(i+1));
            // struct input_event {
            // 	struct timeval time; 2*8
            // 	unsigned short type; 2
            // 	unsigned short code; 2
            // 	unsigned int value; 4
            // };
            // TODO: Switch to dxc-struct to read buffer
            let offset = 0;
            let timestamp_sec = eventBuffer.readBigInt64LE(offset);
            offset += 8;
            let timestamp_usec = eventBuffer.readBigInt64LE(offset);
            offset += 8;
            let eventType = eventBuffer.readInt16LE(offset);
            offset += 2;
            let eventCode = eventBuffer.readInt16LE(offset);
            offset += 2;
            let eventValue = eventBuffer.readInt32LE(offset);
            let parsedLine = {"timestamp_sec": timestamp_sec, "timestamp_usec": timestamp_usec, "eventType": eventType,
                "eventCode": eventCode, "eventValue": eventValue.toString(16)};
            parsedEventChunk.push(parsedLine);
        }
        return parsedEventChunk;
    }



    parseListDevicesEvents(commandResult: string) {
        return;
    }

    getDeviceEvents() {
        return this.deviceEvents;
    }
}
