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