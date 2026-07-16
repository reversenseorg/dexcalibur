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

import ModelFile from "./ModelFile.js";

import {NodeInternalType} from "@reversense/dxc-core-api";

export enum LocationType {
    FILE,
    MEM,
    PLATFORM,
    APP,
    DYN
}

/**
 * @class
 */
export class ModelLocation {

    _t:LocationType = LocationType.FILE;
    _p:any = {};


    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    set file(pFile:ModelFile) {
        this._p.file = pFile;
    }

    get file():ModelFile {
        return this._p.file;
    }

    /**
     * To get the location type
     *
     * There are several location type app :
     * - static *.dex,
     */
    getType():LocationType {
        return this._t;
    }

    static fromFile(pFile:ModelFile):ModelLocation {
        let o:ModelLocation = new ModelLocation();
        o.file = pFile;
        return o;
    }

    /**
     *
     */
    isFileBased():boolean {
        return (this._t == LocationType.FILE);
    }

    /**
     *
     */
    isBuiltIn():boolean {
        return (this._t >= LocationType.PLATFORM);
    }

    /**
     *
     */
    toJsonObject(){
        if(this._t === LocationType.FILE){
            return {
                _t: NodeInternalType.FILE,
                _f: this.file.toJsonObject()
            };
        }else{
            return {
                _t: null,
                _f: null
            };
        }
    }
}


export const CodeLocation = {
    APP: new ModelLocation({ _t:LocationType.APP }),
    PLATFORM: new ModelLocation({ _t:LocationType.PLATFORM }),
    MEM: new ModelLocation({ _t:LocationType.MEM }),
    DYN: new ModelLocation({ _t:LocationType.DYN }),
}
