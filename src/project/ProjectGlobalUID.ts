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

import {DexcaliburConnectionParams} from "../remote/DexcaliburConnectionParams.js";

const LOCAL_ID = "local";
const SEPARATOR = '@'

var _PROJECTS:string[] = [];

export class ProjectURI {

    private _uri:string = null;
    private _uid:string = null;
    private _conn:any = null;
    private _local:boolean = true;

    constructor( pURI:string) {
        this._uri = pURI;
    }

    static newLocalProject( pProjectUID:string){
        const s = `${pProjectUID}@${LOCAL_ID}`;
        if(_PROJECTS.indexOf(s)){
            throw new Error("A project already exists with this UID");
        }
        return new ProjectURI(s);
    }

    static fromString( pSzerialized:string ):ProjectURI {
        const t = pSzerialized.split(SEPARATOR);
        let o:ProjectURI = new ProjectURI(pSzerialized);

        if(t[1]==LOCAL_ID){
            o.setAsLocal();
        }else{
            /*o.setAsRemote(
                DexcaliburConnectionParams.fromString(t[1])
            );*/
        }

        o.setProjectUID(t[0]);

        return o;
    }

    setAsLocal():void {
        this._local = true;
        this._conn = null;
    }

    setAsRemote( pConn:DexcaliburConnectionParams):void {
        this._local = false;
        this._conn = pConn;
    }

    setProjectUID(pUID: string) {
        this._uid = pUID;
    }

    getURI():string  {
        return this._uri;
    }

    equals( pProjectURI:ProjectURI):boolean {
        return (this._uri == pProjectURI.getURI());
    }
}
