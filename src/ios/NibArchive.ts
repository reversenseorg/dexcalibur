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

import {Nib} from "../parser/NibParser.js";
import UINibArchiveHeader = Nib.UINibArchiveHeader;
import {Nullable} from "@reversense/dxc-core-api";
import UINibArchiveClassName = Nib.UINibArchiveClassName;
import {DataLocation} from "../DataLocation.js";
import ModelResource from "../ModelResource.js";

export interface NibArchiveOptions {
    header?:Nullable<UINibArchiveHeader>;
    objTable?:Nullable<Nib.UINibArchiveObject[]>;
    keyTable?:Nullable<Nib.UINibArchiveKey[]>;
    coderTable?:Nullable<Nib.UINibArchiveCoderValue[]>;
    clsTable?:Nullable<Nib.UINibArchiveClassName[]>;
}
export class NibArchive {

    header:Nullable<UINibArchiveHeader> = null;
    objTable:Nullable<Nib.UINibArchiveObject[]> = null;
    keyTable:Nullable<Nib.UINibArchiveKey[]> = null;
    coderTable:Nullable<Nib.UINibArchiveCoderValue[]> = null;
    clsTable:Nullable<Nib.UINibArchiveClassName[]> = null;

    constructor(pOptions:NibArchiveOptions) {

        ['header', 'objTable', 'keyTable', 'coderTable', 'clsTable', 'clsTable'].map(x => {
            if(pOptions[x]!=null){
                this[x] = pOptions[x];
            }
        });
    }

    /*
    getKeyValue(pKey:string){
        if(this.keyTable==null || this.coderTable==null){
            throw Error("Missing key/coder table");
        }
        this.keyTable[pKey] = pKey;
    }*/

    toModelResource( pLocation:Nullable<DataLocation> = null):ModelResource<any> {

        return new ModelResource({
            location: pLocation,
            _uid: null,
            value: this
        });
    }
}