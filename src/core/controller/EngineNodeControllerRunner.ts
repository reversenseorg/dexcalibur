

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

import DexcaliburEngine, {DexcaliburEngineOptions} from "../../DexcaliburEngine.js";
import {Settings} from "../../Settings.js";


/**
 * Represent data to inject into worker environment
 *
 * @interface
 */
export interface WorkerEnvData {
    /**
     * Name of the data injected into worker env
     *
     * @type {string}
     */
    uid:string,
    /**
     * Must be serializable as JSON
     * Not support cyclic refs, and so
     *
     * @type {any}
     */
    data:any
}


export class EngineNodeControllerRunner {

    parentPort: any;

    threadID: string;

    private _engine:DexcaliburEngine;

    constructor(pOpts:DexcaliburEngineOptions) {
        this._engine = DexcaliburEngine.getInstance(pOpts);

    }

    setMessagePort(pMsgPort:any, pThreadID:string){
        this.parentPort = pMsgPort;
        this.threadID = pThreadID;
    }

    /**
     *
     */
    async start():Promise<any> {
        //Settings.GlobalSettings.load();
        return await Settings.GlobalSettings.loadAsNodeController();
        /*return await this._engine.loadConfiguration(
            await Settings.GlobalSettings.loadAsNodeController()
        );*/
        //return await this._engine.boot(false, "", true);
    }

    async refreshPool():Promise<any>{
        return await this._engine.getNodeManager().refreshPool();
    }
}