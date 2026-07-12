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

import {NetworkInterface} from "./NetworkInterface.js";


export interface EndpointOptions {
    interfaces?:NetworkInterface[];
    host?:string;
    port?:number;
    allowInsecureHttp?: boolean;
    allowInsecureHttpTemp?: boolean;
    minTLSVersion?: boolean;
    includeSubdomains?: boolean;
}
/**
 * Represents any endpoint.
 *
 * It is mainly used to represent remote server, but it could represent
 * devices (especially for IoT context) too.
 *
 * @class
 */
export class Endpoint {

    interfaces:NetworkInterface[] = [];

    host:string = null;
    port:number = null;

    allowInsecureHttp?: boolean;
    allowInsecureHttpTemp?: boolean;
    minTLSVersion?: boolean;
    includeSubdomains?: boolean;


    constructor(pOptions?:EndpointOptions) {
        if(pOptions!=null){
            // @ts-ignore
            for(let p of pOptions){
                this[p] = pOptions[p];
            }
        }
    }

    getHost():string {
        return this.host;
    }

    getPort():number {
        return this.port;
    }

    /**
     * To add a network interface to the endpoint
     *
     * @param {NetworkInterface} pIf Network interface
     */
    addInterface(pIf:NetworkInterface):void {
        this.interfaces.push(pIf);
    }
}