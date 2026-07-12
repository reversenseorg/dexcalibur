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

import InputEventCodeProperties from "./InputEventCodeProperties.js";
import EncodedToken, {EncodedTokenOptions} from "./EncodedToken.js";
import {Endianness} from "../core/Endianness.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";

// Source: https://cs.android.com/android/platform/superproject/main/+/main:bionic/libc/kernel/uapi/linux/input-event-codes.h
// Source: https://lxr.linux.no/#linux+v3.9.5/include/uapi/linux/input.h
// Source: https://codebrowser.dev/qt6/include/linux/input.h.html



export interface InputEventCodeOptions extends EncodedTokenOptions {
    description?:string;
    properties?: InputEventCodeProperties;
    tagUIDs?: string[];
    metadata?:any;
}

export default class InputEventCode extends EncodedToken {

    description?:string;
    properties: InputEventCodeProperties;
    /**
     * The list of names of tag to apply to InputEvent or RuntimeEvent
     */
    tagUIDs: string[] = [];
    metadata?:any;

    constructor(pConfig:InputEventCodeOptions ) {
        super({
            byteSize: 2,
            endianness: Endianness.LITTLE_ENDIAN,
            ...pConfig
        });

        if (pConfig != null) {
            this.description = pConfig.description!;
            this.properties = pConfig.properties!;
            this.tagUIDs = pConfig.tagUIDs!;
            this.metadata = pConfig.metadata!;
        }
    }


    /**
     * To create an event type which extends current instance
     *
     * It drops codes
     *
     * @param pConfig
     */
    newDerivation(pConfig:InputEventCodeOptions): InputEventCode {
        const evt = new InputEventCode(this);

        // change token if necessary
        if(pConfig.value != this.value){
            evt.key = pConfig.key;
            evt.value = pConfig.value!;
            evt.byteSize = pConfig.byteSize!;
            evt.endianness = pConfig.endianness!;
        }

        // update properties
        if(pConfig.properties != null){
            evt.properties = {
                ...this.properties,
                ...pConfig.properties
            };
        }

        return evt;
    }


    toJsonObject():any {
        const o:any = super.toJsonObject();
        o.metadata = this.metadata;
        o.description = this.description;
        o.properties = this.properties;
        o.tagUIDs = this.tagUIDs;
        return o;
    }

}