import {IJSONSchema} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {AiException} from "../../errors/AiException.js";

export interface AiBasicInfo {
    name:string,
    descr:string
}

export interface AiPropertyInfo extends AiBasicInfo{
    default?:any,
    schema?:IJSONSchema
}

export interface AiCmpInfo extends AiBasicInfo {
    fqcn:string,
    properties: AiPropertyInfo[],
}


let gInst:Nullable<AiHelper> = null;


export default class AiHelper {

    private _cmp:Record<string, AiCmpInfo> = {};

    private constructor(){}

    getJsonSchemaOf(pFqcn:string, pProperty?:string):IJSONSchema {
        const cmp = this._cmp[pFqcn];
        if(cmp==null){
            throw AiException.MCP_UNKNOW_COMP(pFqcn)
        }

        if(pProperty!=null){
            const p = cmp.properties.find(x => x.name==pProperty);
            if(p==null){
                throw AiException.MCP_UNKNOW_COMP_PPT(pFqcn,pProperty);
            }
            if(p.schema==null){
                throw AiException.MCP_MISSING_CMP_SCHEMA(pFqcn,pProperty);
            }

            return p.schema;
        }

        const sch:IJSONSchema = { type:"object", properties: {}};

        for(let p of this._cmp[pFqcn].properties){
            if(p.schema==null) continue;
            sch.properties[p.name] = p.schema;
        }

        return sch;
    }

    getInfo(pFqcn:string):AiCmpInfo {
        const cmp = this._cmp[pFqcn];
        if (cmp == null) {
            throw AiException.MCP_UNKNOW_COMP(pFqcn)
        }
        return cmp;
    }

    registerExtraComponent(pComp:AiCmpInfo):AiCmpInfo {
        this._cmp[pComp.fqcn] = pComp;

        return pComp;
    }

    static getInstance():AiHelper {
        if(gInst==null) gInst = new AiHelper();

        return gInst;
    }
}

gInst = AiHelper.getInstance();

