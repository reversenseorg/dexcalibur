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

import Util from "../../Utils.js";
import * as Log from "../../Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum K8ResourceType {
    STATEFULSET="statefulset",
    REPLICASET="replicaset",
    REPCTRL="replicaset",
    DEPLOYMENT="deployment",
    POD="pod",
    SERVICE="service"
}

export class K8sHelper {

    static MAX_REPLICA = 128;
    static KUBECTL = "kubectl";

    constructor() {

    }

    static async scale(pType:K8ResourceType, pResName:string, pSize:number, pNamespace = ""):Promise<void>{
        if([
            K8ResourceType.STATEFULSET,
            K8ResourceType.REPLICASET,
            K8ResourceType.REPCTRL,
            K8ResourceType.DEPLOYMENT,
        ].indexOf(pType)==-1){
            throw new Error(`K8sHekper error : resource type '${pType}' is not scalable`);
        }

        if(typeof pSize!=='number' || pSize<0 || pSize>K8sHelper.MAX_REPLICA){
            throw new Error(`K8sHekper error : '${pSize}' replica count is invalid`);
        }

        const ns = (/^[a-zA-Z0-9_-]+$/.test(pNamespace)? ` -n ${pNamespace} `:"");
        const out = await Util.execAsync(`${K8sHelper.KUBECTL} scale ${pType} ${pResName} --replicas=${pSize} ${ns}`);

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return ;
    }

    static async delete(pType:K8ResourceType, pResName:string, pNamespace = ""):Promise<void>{
        if([
            K8ResourceType.STATEFULSET,
            K8ResourceType.REPLICASET,
            K8ResourceType.REPCTRL,
            K8ResourceType.DEPLOYMENT,
            K8ResourceType.POD,
        ].indexOf(pType)==-1){
            throw new Error(`K8sHekper error : resource type '${pType}' cannot be deleted`);
        }

        const ns = (/^[a-zA-Z0-9_-]+$/.test(pNamespace)? ` -n ${pNamespace} `:"");
        const out = await Util.execAsync(`${K8sHelper.KUBECTL} delete ${pType} ${pResName} ${ns}`);

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return ;
    }
}