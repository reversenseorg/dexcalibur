import Util from "../../Utils.js";
import * as Log from "../../Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export enum K8ResourceType {
    STATEFULSET="statefulset",
    REPLICASET="replicaset",
    REPCTRL="replicaset",
    DEPLOYMENT="deployment"
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
}