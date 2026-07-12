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

import {Nullable} from "../../../core/IStringIndex.js";
import InputEventType from "../../InputEventType.js";
import {IInputDeviceDecoder} from "./IInputDeviceDecoder.js";
import InputEventCode from "../../InputEventCode.js";
import {Endianness} from "../../../core/Endianness.js";


export interface InputDeviceTypeOptions {
    name?:string;
    pathPattern?:RegExp;
    eventTypes?:InputEventType[];
    decoder?:Nullable<IInputDeviceDecoder>;
}

export class InputDeviceType {

    decoder?:Nullable<IInputDeviceDecoder> = null;
    name:string;

    /**
     * A pattern to detect if a devices is an input device of this type
     *
     * `/dev/input/eventX`  is a generic input event interface
     * `/dev/input/jsX`  is a joy stick interface for input subsystem
     * `/dev/input/mouseX`  is a mouse interface for input subsystem
     *
     *
     */
    pathPattern: RegExp;

    eventTypes:InputEventType[] = [];

    constructor(pOptions:Nullable<InputDeviceTypeOptions>) {

        if(pOptions!=null){
            this.decoder = pOptions.decoder!;
            this.name = pOptions.name!;
            this.pathPattern = pOptions.pathPattern!;
            this.eventTypes = pOptions.eventTypes!;

            if(this.decoder!=null && this.decoder.deviceType==null){
                this.decoder.deviceType = this;
            }
        }
    }

    isReadyToDecode():boolean {
        return (this.decoder!=null && this.decoder.deviceType!=null);
    }

    /**
     * To detect if a device path match this type of device
     *
     *
     * @param pPath
     */
    matchPath(pPath:string):boolean {
        if(this.pathPattern==null) return false;

        return this.pathPattern.test(pPath);
    }

    /**
     * TODO : replace pID:number by pID:Buffer
     * @param pID
     */
    getEventTypeById(pID: number, pEndianness = Endianness.LITTLE_ENDIAN):Nullable<InputEventType> {
        return this.eventTypes.find(x => x.equalValue(pID,pEndianness) );
    }

    toJsonObject():any {
        const o:any = {
            name: this.name,
            pathPattern: this.pathPattern.toString(),
            eventTypes: this.eventTypes
        };

        return o;
    }
}