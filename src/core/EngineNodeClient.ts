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
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {DbDataType, DbKeyType, INode, NodeProperty, NodeType, TagUUID} from "@dexcalibur/dexcalibur-orm";
import {ValidationRule} from "../Validator.js";
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

            Logger.info("[ENGINE NODE][HEALTH] Request node healthcheck : "+this.baseURL+"api/health/status");

            const response = await this.perform("api/health/ready");

            console.log("getHealthCheckResult > ",response.body);
            return (response.body=='OK');
        }catch(e){
            Logger.error(e.stack);
            return false;
        }
    }


}