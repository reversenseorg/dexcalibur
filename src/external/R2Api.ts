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

import * as _net_ from "net";

import {R2Pipe} from "./R2Pipe.js";


export class R2Api {

    _ctx:R2Pipe;


    constructor(pInstance:R2Pipe) {
        this._ctx = pInstance;
    }


    getBuffer(addr, size, cb) {
        let dataBuffer = Buffer.from([]);
        const server = _net_.createServer(client => {
            client.on('data', data => {
                dataBuffer = Buffer.concat([dataBuffer, data]);
            });
            client.on('end', _ => {
                cb(null, dataBuffer);
                client.destroy();
                server.close();
            });
            client.on('error', err => {
                cb(err);
            });
        });
        server.listen(0, () => {

            const port = (server.address() as any).port;
            const command = 'wts 127.0.0.1:' + port + ' ' + size + '@ ' + addr;
            this._ctx.runCmd(command);
        });
    }

    async call(s):Promise<any>{
        return await this._ctx.runCmd("'" + s);
    }

    async callAt(s, addr):Promise<any>{
        return await this._ctx.runCmd(s + "@0x" + Number(addr).toString(16));
    }

    async cmdAt(s, addr):Promise<any> {
        return await this._ctx.runCmd(s + "@0x" + Number(addr).toString(16));
    }

    async cmd(s):Promise<any> {
        return await this._ctx.runCmd(s);
    }
}