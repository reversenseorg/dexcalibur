import {INode, JSONSchemaValidator, NodeProperty, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./IStringIndex.js";

const validator = new JSONSchemaValidator();

export class NodeUtils {

    private constructor() {
    }

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

    static validateProperty(pProp:NodeProperty, pValue:any):boolean{
        return validator.validate(pValue, pProp.toJSONSchemaDoc()).valid;
    }
}