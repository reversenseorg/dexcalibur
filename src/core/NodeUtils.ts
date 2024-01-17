import {INode, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./IStringIndex.js";


export class NodeUtils {

    /**
     * To prepare one or more node instance to be serialized
     *
     * @param pNodes
     * @param pOptions
     */
    static toJsonObject(pNodes:INode[]|INode, pOptions:Nullable<SerializeOptions> = null):any[] {
        if(pNodes==null) return null;

        if(Array.isArray(pNodes)){
            const o:any[] = [];
            pNodes.map(x => o.push(x.toJsonObject()));
            return o;
        }else{
            return pNodes.toJsonObject(pOptions);
        }
    }
}