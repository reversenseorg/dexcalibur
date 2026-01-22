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

    static exportNodeInfo(pType: number, pZone:SecurityZone) {
        const node = Object.values(NodeType.ALL).find( (v:NodeType)=>{
            return (v.getType() === pType);
        });

        if(node == null) throw new Error("Invalid node type");

        let ppts:any[] = []
        node.getProperties().map( (v:NodeProperty)=>{
            const o:any = {
                name: v.getName(),
                schema: v.toJSONSchemaPart()
            };

            if(v.isNode()) o.node = v.getNodeType().getType();
            ppts.push(o);
        });

        return ppts;
    }
}