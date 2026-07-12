

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

export class SerializeSelector {
    field:string;
    alias
    cond:boolean = false;
    selectors:SerializeSelector[];
}



const TOKEN_RE = /^([a-zA-Z0-9_]+)(=>[a-zA-Z0-9_]+)*(<[a-zA-Z0-9_]+>)?(\[.*\])?$/;
const CLASS_RE = /^<([a-zA-Z0-9_]+)>$/;
const SUBF_RE = /^([a-zA-Z0-9_])=>([a-zA-Z0-9_]+)$/;

/**
 *  name,ret<TYPE>[field1:field2],..
 *
 *  name,absolute_size,size,children<ModelClass>[name:simpleName=>sname],children<ModelPackage>[name:sname],
 *
 */
export class SerializeFilter {

    query:string = null;
    fields:string[]


    constructor() {
    }

    prepare(pSelector:string): SerializeFilter {

        let rootFields:string[] = pSelector.split(',');

        rootFields.map( (pField) => {
            let m = TOKEN_RE.exec(pField);



        });

        return this;
    }

    process( pObject:any):any {

    }

}