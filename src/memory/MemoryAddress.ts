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

import {DbDataType, IJSONSchema} from "@reversense/dexcalibur-orm";

/**
 * Represent a memory address
 */
export class MemoryAddress {

    static schema:IJSONSchema = {
        type:'object',
        properties:{
            address:{
                type:"number",
                description:"Address in memory"
            }}}

    address:bigint = BigInt(-1);

    constructor(pAddress?:bigint) {
        if(pAddress!=null){
            this.address = pAddress;
        }
    }

    add(pNumber:number|bigint):MemoryAddress{
        return new MemoryAddress(this.address + BigInt(pNumber));
    }


    sub(pNumber:number|bigint):MemoryAddress{
        return new MemoryAddress(this.address - BigInt(pNumber));
    }


    /**
     * Export to hexadecimal representation with padding
     * @param {number} pAddressSize Number of byte in the representation
     * @return {string}
     * @method
     */
    toHex(pAddressSize:number):string {
        const hex = this.address.toString(16);
        if(pAddressSize<0 || (hex.length/2>=pAddressSize)){
            return "0x"+hex;
        }else{
            return "0x"
                +(hex.length%2>0?'0':'')
                +('00'.repeat(pAddressSize-Math.round(hex.length/2)))
                +hex;
        }

    }
}