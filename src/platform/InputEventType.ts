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

import EncodedToken, {EncodedTokenOptions} from "./EncodedToken.js";
import {Endianness} from "../core/Endianness.js";
import InputEventCode from "./InputEventCode.js";
import {Nullable} from "../core/IStringIndex.js";

//Source: https://docs.kernel.org/input/event-codes.html


export interface InputEventTypeOptions extends EncodedTokenOptions {
    metadata?:any;
    description?:string;
    codes?: InputEventCode[]
}

export default class InputEventType  extends EncodedToken {

    metadata?:any;
    description:string = "";
    codes: InputEventCode[] = [];


    constructor(pConfig:InputEventTypeOptions ) {
        super({
            byteSize: 2,
            endianness: Endianness.LITTLE_ENDIAN,
            ...pConfig
        });

        if (pConfig != null) {
            this.metadata = pConfig.metadata!;
            this.codes = pConfig.codes!;
            this.description = pConfig.description!;
        }
    }

    /**
     * To create an event type which extends current instance
     *
     * It drops codes
     *
     * @param pConfig
     */
    newDerivation(pConfig:InputEventTypeOptions): InputEventType {
        const evt = new InputEventType(this);

        if(pConfig.value != this.value){
            evt.key = pConfig.key;
            evt.value = pConfig.value!;
            evt.byteSize = pConfig.byteSize!;
            evt.endianness = pConfig.endianness!;
        }

        evt.codes = [];
        return evt;
    }
    /**
     * TODO : replace pID:number by pID:Buffer
     * @param pID
     */
    getEventCodeById(pID: number, pEndianness = Endianness.LITTLE_ENDIAN):Nullable<InputEventCode> {
        return this.codes.find(x => x.equalValue(pID,pEndianness) );
    }

    toString() {
        return this.key
    }

    toJsonObject():any {

        const o:any = super.toJsonObject();
        o.metadata = this.metadata;
        o.description = this.description;
        o.codes = [];
        if(this.codes!=null){
            this.codes.map(x => o.codes.push(x.toJsonObject()));
        }
        return o;
    }
}

