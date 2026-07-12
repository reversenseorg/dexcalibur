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

import {ModelRegisterReference} from "../ModelReference.js";
import DDVM_Symbol from "./DDVM_Symbol.js";
import DDVM_Exception from "./DDVM_Exception.js";


export class DDVM_Wide
{
    /**
     * Most Significant 32-bit Number
     * @field
     */
    mn:ModelRegisterReference = null;
    m:DDVM_Symbol = null;

    /**
     * Least Significant 32-bit Number
     * @field
     */
    ln:ModelRegisterReference = null;
    l:DDVM_Symbol = null;

    /**
     * Concrete value
     * @field
     */
    v:number = null;

    vm:any = null;

    constructor( pDVM:any, pRegister:ModelRegisterReference ){

        this.mn = pRegister;
        this.ln = pRegister.getNext();
        this.m = pDVM.stack.getLocalSymbol( this.mn.getRX() );
        this.l = pDVM.stack.getLocalSymbol( this.ln.getRX() );

        if(pDVM.isImm(this.m) && pDVM.isImm(this.l)){
            this.v = (this.m.getValue() << 32) | (this.l.getValue() & 0x00000000FFFFFFFF);
        }
    }

    getValue():number{
        if(this.vm.isImm(this.m) && this.vm.isImm(this.l)){
            return this.v = (this.m.getValue() << 32) | (this.l.getValue() & 0x00000000FFFFFFFF);
        }else{
            throw new DDVM_Exception('T001','Long value is not concrete');
        }
    }
}