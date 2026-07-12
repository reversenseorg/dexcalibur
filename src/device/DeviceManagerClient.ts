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

import got, {Options} from "got";
import DexcaliburEngine from "../DexcaliburEngine.js";
import Control from "../audit/common/Control.js";
import {HttpClient} from "../core/HttpClient.js";
import {DeviceManagerClientException} from "./error/DeviceManagerClientException.js";

const GOT = got.default;

/**
 *
 */
export class DeviceManagerClient extends HttpClient {

    sshPort:string;
    sshUser:string;
    sshKey:string;

    private _ctx:DexcaliburEngine;

    constructor( pEngine:DexcaliburEngine) {
        super({
            host: process.env.DXC_VDM_HOST,
            port: process.env.DXC_VDM_PORT,
            ctx: pEngine
        });

        this._updateSettings();
    }


    private _updateSettings():void {

        if(process.env.DXC_VDM_SSH_PORT!=null){
            this.sshPort = process.env.DXC_VDM_SSH_PORT;
        }
        if(process.env.DXC_VDM_SSH_USER!=null){
            this.sshUser = process.env.DXC_VDM_SSH_USER;
        }
        if(process.env.DXC_VDM_SSH_KEY!=null){
            this.sshKey = process.env.DXC_VDM_SSH_KEY;
        }
    }

    async testHttpConnection():Promise<boolean> {

        const response = await this.perform(this.baseURL+"api/health/status",{

            timeout: {
                request: 10000
            }
        });

        const raw = JSON.parse(response.body);
        const ctrls:Control[] = [];

        if(raw.success){
            raw.data.map( x => {
                ctrls.push( Control.fromJsonObject(x));
            });
        }

        return false;
    }

    async testSshConnection():Promise<boolean> {
        return false;
    }

    async startRemoteVDM():Promise<any>{
        if(this.sshKey==null){
            throw DeviceManagerClientException.CANNOT_INIT_SSH();
        }
    }
}