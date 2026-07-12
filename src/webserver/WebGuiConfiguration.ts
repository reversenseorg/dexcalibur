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

/**
 * Options of configuration
 * @interface
 */
interface WebGuiOptions {
    http_port?:number;
    ws_port?:number;
    ssl?:boolean;
    rootFolder?:string;
    home?:string;
}

/**
 * Represents configuration data required to route request for each GUI
 * @class
 */
export class WebGuiConfiguration {

    static DEFAULT_HOMEPAGE = "index.html";

    raw:string;

    name:string = "";

    ppts:WebGuiOptions = {};

    started = false;

    constructor(pRaw:string = "") {
        this.raw = pRaw;
    }


    addProperty( pName:string, pValue:any):void {
        this.ppts[pName] = pValue;
    }

    getHttpPort():number {
        return this.ppts.http_port;
    }

    getWebSocketPort():number {
        return this.ppts.ws_port;
    }

    isSslEnabled():boolean {
        return this.ppts.ssl;
    }

    getRootFolder():string {
        return (this.ppts.rootFolder!=null ? this.ppts.rootFolder : this.name);
    }

    /**
     *To get the relative path of the file containing home page. This path is relative to delegated web root
     *
     */
    getHome():string {
        return this.ppts.home!=null ? this.ppts.home : WebGuiConfiguration.DEFAULT_HOMEPAGE;
    }

    isStarted():boolean {
        return this.started;
    }
}