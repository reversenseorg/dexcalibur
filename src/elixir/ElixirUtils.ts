import {NodeProperty, NodeTransform, NodeType} from "@dexcalibur/dexcalibur-orm";
import {SecurityZone} from "../security/SecurityZone.js";


export class ElixirUtils {

    static exportDefinition( pZone:SecurityZone):any {

        const cols = NodeType.toArrayHeader();
        const nodes:any[] = [];
        Object.values(NodeType.ALL).map( (v:NodeType)=>{
            nodes.push(v.toArrayValue(cols, NodeTransform.ARRAY));
        })

        return [
            {
                type: NodeType.toArrayHeader(),
                _ppts: NodeProperty.toArrayHeader()
            },
            nodes
        ];
    }
}