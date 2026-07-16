
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

import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType,
    ValidationRule
} from "@reversense/dexcalibur-orm";
import {ProductRelease} from "./ProductRelease.js";
import {NodeInternalType} from "@reversense/dxc-core-api";
import {CoreDebug} from "../core/CoreDebug.js";
import {CryptoUtils} from "../CryptoUtils.js";
import AiHelper from "../core/ai/AiHelper.js";



export interface ProductAuthor{
    name:string;
    contact:string;
    official:boolean;
}

export interface ReversenseProductOptions {
    type?:NodeInternalType;
    code?:string;
    name?:string;
    description?:string;
    author?:ProductAuthor;
    releases?:ProductRelease[];
    version?:string;
    price?:number;
    tags?:number[];
}

export type ReversenseProductUUID = string;

/**
 *
 */
export class ReversenseProduct implements INode
{

    __ = NodeInternalType.REVERSENSE_PRODUCT;

    static TYPE:NodeType = (new NodeType( "products", NodeInternalType.REVERSENSE_PRODUCT, [
        (new NodeProperty("code"))
            .type(DbDataType.STRING)
            .descr("The UID of the product")
            .schema({ type: "string", pattern: "^[a-zA-Z0-9_\\.]+$"  })
            .rule(ValidationRule.newRegexpAssert(/^[a-zA-Z0-9_\\.]+$/))
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("name"))
            .descr("The name of the business product")
            .schema({ type: "string", minLength: 3 })
            .type(DbDataType.STRING),
        (new NodeProperty("description"))
            .descr("Description of the business product")
            .schema({ type: "string" })
            .type(DbDataType.STRING).def(""),
        (new NodeProperty("type"))
            .descr("The type of the product")
            .schema({ type: "string", minLength: 3 })
            .type(DbDataType.NUMERIC)
            .def(-1),
        (new NodeProperty("author"))
            .descr("Information about the author of the product")
            .schema({ type: "object", properties: {
                name: { type: "string" },
                contact: { type: "string" },
                official: { type: "boolean" }
            }})
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("version"))
            .descr("The version of the product")
            .schema({ type: "string" })
            .type(DbDataType.STRING)
            .def("1.0.0"),
        (new NodeProperty("price"))
            .descr("price")
            .schema({ type: "number" })
            .type(DbDataType.NUMERIC)
            .def(-1),
        (new NodeProperty("tags"))
            .type(DbDataType.BLOB)
            .def([]),
        (new NodeProperty("releases"))
            .descr("All releases of the product")
            .schema({ type:"array", items: AiHelper.getInstance().getJsonSchemaOf("ProductRelease") })
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState)=>{
                if(x.p!=null && x.p.length>0){

                    const r:any[] = []
                    x.p.map( v => {
                        r.push(v.toJsonObject());
                    });
                    return r;
                }else{
                    return null;
                }
            })
            .wakeUp((x:NodePropertyState)=>{
                if(x.p!=null){
                    const r:any[] = []
                    x.p.map( v => {
                        r.push(new ProductRelease(v));
                    });

                    return r;
                }else{
                    return null;
                }
            })
            .def(null)
    ])).descr(`
    Represents a Reversense product such as a scanner or a referential. Any product sold by Reversense and available on the platform existis as a ReversenseProduct.
    A ReversenseProduct is a business product from sales point of view. A product must be licensed to be used by the final user.
    `);

    type?:NodeInternalType;

    code:ReversenseProductUUID;

    name:string;

    description:string = "";

    author:ProductAuthor;

    releases:ProductRelease[] = [];

    price:number = -1;

    tags:number[] = [];

    version:string = "1.0.0";

    /**
     *
     * @param pOpts
     */
    constructor(pOpts:ReversenseProductOptions) {
        for(const i in pOpts){
            this[i]=pOpts[i];
        }
    }

    getUID():ReversenseProductUUID {
        return  this.code;
    }

    /**
     * Strong verifying of product code involved into license checking
     *
     * @param pCode
     */
    is(pCode:string):boolean{
        return CryptoUtils.stringEqual(this.code,pCode);
    }

    /**
     * To add a new release
     *
     * Release with same version string is removed.
     *
     * @param {ProductRelease} pRelease Release to add
     * @returns {ProductRelease[]} Releases removed
     * @method
     */
    addRelease(pRelease:ProductRelease):ProductRelease[] {
        // first, remove release with same version
        const rels:ProductRelease[] = [];
        const removed:ProductRelease[] = [];

        this.releases.map(x => {
            if(pRelease.version!=x.version){
                rels.push(x);
            }else{
                removed.push(x);
            }
        });

        rels.push(pRelease);
        this.releases = rels;

        return removed;
    }

    /**
     * To remove a release
     *
     * @param pVersion
     */
    removeRelease(pVersion:string):ProductRelease|null {
        // first, remove release with same version
        const rels:ProductRelease[] = [];
        let removed:ProductRelease = null;

        this.releases.map(x => {
            if(pVersion!=x.version){
                rels.push(x);
            }else{
                removed = x;
            }
        });

        this.releases = rels;

        return removed;
    }

    /**
     *
     */
    toJsonObject():any {
        const o = {
            code:this.code,
            name:this.name,
            description:this.description,
            author:this.author,
            releases:this.releases,
            price:this.price,
            tags:this.tags,
            type:this.type,
            version:this.version,
        };

        o.releases = [];
        this.releases.map(x => {
            o.releases.push(x.toJsonObject());
        });

        CoreDebug.checkJsonSerialize(o, "ReversenseProduct");
        return o;
    }

    setUID(pCode: string) {
        this.code = pCode;
    }

    static fromJsonObject(pObj:any):ReversenseProduct {
        const rp = new ReversenseProduct(pObj);

        rp.releases = [];
        if(Array.isArray(pObj.releases)){
            pObj.releases.map((vRelease:any)=>{
                rp.addRelease(ProductRelease.fromJsonObject(vRelease));
            })
        }

        return rp;
    }
}
ReversenseProduct.TYPE.builder(ReversenseProduct);