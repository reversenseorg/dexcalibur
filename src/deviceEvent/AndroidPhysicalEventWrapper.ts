import InputEvent from "../platform/InputEvent.js";
import {IPhysicalEventDecoder} from "../platform/IPhysicalEventDecoder.js";
import {AndroidEventType, AndroidSynEventCode} from "../android/AndroidInputEvent.js";
import {of} from "rxjs";
import {DeviceOptions} from "../Device.js";

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
        let timestamp_sec = pRaw.readBigInt64LE(offset);
        offset += 8;
        let timestamp_usec = pRaw.readBigInt64LE(offset);
        offset += 8;
        let eventType = pRaw.readInt16LE(offset);
        offset += 2;
        let eventCode = pRaw.readInt16LE(offset);
        offset += 2;
        let eventValue = pRaw.toString('hex', offset, offset + 4)
        let timestamp  = Number(timestamp_sec) + Number(timestamp_usec) * 10 ** -6;
        let parsedRaw = {"timestamp": timestamp, "eventType": eventType,
            "eventCode": eventCode, "eventValue": eventValue};
        return new InputEvent(parsedRaw);
    }

    decodeBufferChunk(pRawChunk: Buffer) {
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