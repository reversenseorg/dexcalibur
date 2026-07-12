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

import InputEvent from "../../InputEvent.js";
import {IInputDeviceDecoder} from "../common/IInputDeviceDecoder.js";
import {Nullable} from "../../../core/IStringIndex.js";
import {InputDeviceType} from "../common/InputDeviceType.js";
import {Endianness} from "../../../core/Endianness.js";


export class LinuxInputDeviceDecoder implements IInputDeviceDecoder {

    deviceType:InputDeviceType;

    /**
     * Structure size
     */
    eventSize: number = 24;

    constructor(pDevType:Nullable<InputDeviceType>) {
        this.deviceType = pDevType!;
    }

    /**
     *
     * @param pRaw
     */
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

        const evtType = this.deviceType.getEventTypeById(eventType, Endianness.LITTLE_ENDIAN);
        const evtCode = evtType.getEventCodeById(eventCode, Endianness.LITTLE_ENDIAN);

        return new InputEvent({
            "timestamp": timestamp,
            "type": evtType,
            "code": evtCode,
            "value": eventValue});
    }

    /**
     *
     * @param pRawChunk
     */
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