import {InputDeviceType} from "./InputDeviceType.js";
import InputEventType from "../../InputEventType.js";
import InputEventCode from "../../InputEventCode.js";
import {Nullable} from "../../../core/IStringIndex.js";
import EventRecordSession from "../../EventRecordSession.js";
import {Device} from "../../../Device.js";
import DeviceEventCollector from "../../DeviceEventCollector.js";


/*
struct input_id {
	__u16 bustype;
	__u16 vendor;
	__u16 product;
	__u16 version;
};
 */

// IOCTLs (0x00 - 0x7f)
// https://github.com/torvalds/linux/blob/02de58b24d2e1b2cf947d57205bd2221d897193c/include/uapi/linux/input.h#L59
export interface InputDeviceId {
    bustype:number; // __u16
    vendor:number;
    product:number;
    version:number;
}

export interface InputDeviceOptions {
    type?:InputDeviceType;
    phyPath?:string;
    sysfsPath?:string;
    supportedKeys?:InputEventCode[];
    supportedEvents?:InputEventType[];
    misc?:any;

    switches?:any[];
    leds?:any;

    handles?:string[];

    uid?:string;
    id?:InputDeviceId;
    name?:string;
    _bitmap?:number;
}


export class InputDevice {

    type:InputDeviceType;

    /**
     * name of the device.
     */
    name:string;

    /**
     * physical path to the device in the system hierarchy.
      */
    phyPath:string;

    /**
     * sysfs path
     */
    sysfsPath:string;

    /**
     * unique identification code for the device (if device has it).
     */
    uid:string;

    /**
     * list of input handles associated with the device
     */
    handles:string[] = [];

    id:InputDeviceId;

    supportedEvents:InputEventType[] = [];

    supportedKeys:InputEventCode[] = [];

    misc:any = {};

    leds:any = null;

    switches:any = null;

    _bitmap:number = undefined;

    records:EventRecordSession[] = [];

    activeRecord:Nullable<EventRecordSession> = null;

    constructor(pOptions:InputDeviceOptions) {
        this.type = pOptions.type!;
        this.id = pOptions.id!;
        this.uid = pOptions.uid!;
        this.supportedKeys = pOptions.supportedKeys!;
        this.supportedEvents = pOptions.supportedEvents!;
        this.misc = pOptions.misc!;
        this.leds = pOptions.leds!;
        this.sysfsPath = pOptions.sysfsPath!;
        this.phyPath = pOptions.phyPath!;
        this.name = pOptions.name!;
        this.handles = pOptions.handles!;
        this._bitmap = pOptions._bitmap!;
    }

    startRecord(pDevice:Device):EventRecordSession {
        if(!this.type.isReadyToDecode()){
            return null;
        }

        const collector = new DeviceEventCollector(pDevice.getUID(), pDevice.getDefaultBridge(), this.type.decoder);
        const sess =  collector.start(this.name, this.sysfsPath)
        this.records.push(sess);
        this.activeRecord = sess;
        return sess;
    }

    toJsonObject(){
        const o:any = {};
        for(let i in this) o[i] = this[i];
        o.supportedEvents = [];
        this.supportedEvents.map(e => {
            o.supportedEvents.push(e.toJsonObject());
        })
        o.type = this.type?.toJsonObject();
        o.records = [];
        o.activeRecord = (this.activeRecord!=null ? this.activeRecord.getUID() : null);
        return o;
    }
}