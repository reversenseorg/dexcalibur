import InputEvent from "../platform/InputEvent.js";
import {IPhysicalEventDecoder} from "../platform/IPhysicalEventDecoder.js";
import {AndroidEventType, AndroidSynEventCode} from "../android/AndroidInputEvent.js";
import {DeviceOptions} from "../Device.js";
import InputEventType from "./InputEventType.js";
import InputEventCode from "./InputEventCode.js";

// Android Event Format in /dev/input/eventX
// struct input_event {
// 	struct timeval time; 2*8 bytes _ Variable with the architecture
// 	unsigned short type; 2 bytes
// 	unsigned short code; 2 bytes
// 	unsigned int value; 4 bytes
// };

export default class AndroidPhysicalEventWrapper implements IPhysicalEventDecoder {

    static SEPARATOR_EVENT_TYPE = AndroidEventType.EV_SYN
    static SEPARATOR_EVENT_CODE = AndroidSynEventCode.SYN_REPORT

    eventSize: number = 24; // Depends on the architecture/device

    constructor(pConfig:DeviceOptions={}){
        for(const i in pConfig) this[i] = pConfig[i];
    }

    decode(pRaw: Buffer): InputEvent {
        // TODO: Switch to dxc-struct to read buffer
        let offset = 0;
        let timestamp_sec = pRaw.readBigUInt64LE(offset);
        offset += 8;
        let timestamp_usec = pRaw.readBigUInt64LE(offset);
        offset += 8;
        let eventType = pRaw.readUInt16LE(offset);
        offset += 2;
        let eventCode = pRaw.readUInt16LE(offset);
        offset += 2;
        let eventValue = pRaw.readUInt32LE(offset).toString(16).padStart(8, '0')
        let timestamp: string  = Number(timestamp_sec) + '.' + Number(timestamp_usec);
        // Timestamp remark:
        // - Conversion bigInt to number not precise if timestamp_sec or timestamp_usec is over Number.MAX_SAFE_INTEGER 9007199254740991.
        // - Stored in a string to avoid imprecision on decimals from number.
        let parsedRaw = {
            "timestamp": timestamp,
            "type": InputEventType.parse(eventType),
            "code": InputEventCode.parse(eventCode),
            "value": eventValue};
        return new InputEvent(parsedRaw);
    }

    decodeBufferChunk(pRawChunk: Buffer): InputEvent[] {
        let parsedEventChunk: any[] = [];
        let numberOfEvents = (pRawChunk.length / this.eventSize >>0);
        for (let i = 0; i < numberOfEvents; i++) {
            let rawEvent = pRawChunk.subarray(this.eventSize*i, this.eventSize*(i+1));
            let inputEvent = this.decode(rawEvent)
            parsedEventChunk.push(inputEvent);
        }
        return parsedEventChunk;
    }
}