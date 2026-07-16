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

import got from "got";
import * as _ps_ from "process";
import * as _path_ from "path";

import {IDexcaliburEngine} from "../IDexcaliburEngine.js";
import {Nullable} from "./IStringIndex.js";
import {Subject} from "rxjs";
import * as _child_process_ from "child_process";
import DexcaliburWorkspace from "../DexcaliburWorkspace.js";
import UT from "../Utils.js";
import Util from "../Utils.js";
import {EngineNodeException} from "../errors/EngineNodeException.js";
import {NodeState} from "./EngineNodeManager.js";
import {ScanOrder} from "../audit/common/ScanOrder.js";
import * as Log from "../Logger.js";
import * as http from "node:http";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {UserSession} from "../user/session/UserSession.js";
import WebServer from "../WebServer.js";
import {ProjectOrder} from "../project/ProjectOrder.js";
import {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {InternalState} from "./InternalState.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {NodeInternalType} from "@reversense/dxc-core-api";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@reversense/dexcalibur-orm";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {User} from "../User.js";
import {HttpClient} from "./HttpClient.js";
import Control from "../audit/common/Control.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;
const GOT = got.default;


/**
 * Represent a running instance of DexcaliburEngine.
 *
 * It is mainly used to hold metadata about remote instances
 * when engine mode is turned to MASTER/SLAVE, and treatments are distributed
 * over several instances.
 *
 *
 * @class
 */
export class EngineNodeClient extends HttpClient {

    constructor( pHost:string, pPort:string, pEngine:DexcaliburEngine) {
        super({
            host: pHost,
            port: pPort,
            ctx: pEngine
        });

    }

    async getHealthCheckResult():Promise<boolean> {
        try{
            // Logger.info("[ENGINE NODE][HEALTH] Request node healthcheck : "+this.baseURL+"api/health/ready");
            const response = await this.perform("api/health/ready", {
                timeout: {
                    response:  (process.env.DXC_HC_TIMEOUT ? parseInt(process.env.DXC_HC_TIMEOUT,10) : 100000) // 100 s
                }
            });
            return (response.body==='OK');
        }catch(e){
            Logger.error(e.stack);
            return false;
        }
    }

    async stop():Promise<boolean> {
        try{
            // Logger.info("[ENGINE NODE][HEALTH] Request node healthcheck : "+this.baseURL+"api/health/ready");
            const response = await this.perform("api/node/stop", { method:'POST'});
            if(response.body!=null){
                console.log(response.body);
                console.log(JSON.parse(response.body).data.done);
                return (JSON.parse(response.body).data.done=='ok');
            }else{
                return false;
            }
        }catch(e){
            Logger.error(e.stack);
            return false;
        }
    }
}