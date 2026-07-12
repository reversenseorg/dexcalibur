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

import ModelField from "./ModelField.js";
import ModelMethod from "./ModelMethod.js";

/**
 * To diff two nodes from model by inspecting a list of properties
 * @deprecated
 */
export default class NodeCompare
{
    originalnode:ModelField|ModelMethod;
    diff:any;
    newnode:any;
    e:boolean;


    /**
     *
     * @param original_node
     * @param new_node
     * @param diff {string[]} List of properties
     */
    constructor(original_node:any=null, new_node:any=null, diff:any=null){
        this.originalnode = original_node;
        this.diff = diff;
        this.newnode = new_node;    
        this.e = (diff===null);
    }

    getDiffFromOriginal():any{
        return this.originalnode;
    }

    getDiffFromNew():any{
        return this.newnode;
    }

    getDiff():any{
        return this.diff;
    }

    isIdentic():boolean{
        return this.e;
    }
}
