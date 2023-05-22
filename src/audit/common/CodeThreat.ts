
import Threat, {ThreatOptions} from "./Threat.js";
import CodeConstraint from "./CodeConstraint.js";
import Constraint from "./Constraint.js";
import {NodeInternalType} from "../../NodeInternalType.js";


export interface CodeConstraintMap {
    [nodeType:number] :CodeConstraint[]
}

export interface CodeThreatOptions extends ThreatOptions {
    signature?:CodeConstraint[];

}

export default class CodeThreat extends Threat {

    signature:CodeConstraint[] = [];

    private _cmap:CodeConstraintMap = {};

    constructor( pConfig:CodeThreatOptions = null) {
        super(pConfig);

        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    appendSignature(pConstraint:CodeConstraint):void {
        super.appendSignature(pConstraint);

        // update mapping
        if(this._cmap[pConstraint.node]==null){
            this._cmap[pConstraint.node] = [];
        }

        this._cmap[pConstraint.node].push(pConstraint);
    }

    listPerNodeType():CodeConstraintMap {
        return this._cmap;
    }

    listByNodeType(pNodeType:NodeInternalType):CodeConstraint[] {
        return this._cmap[pNodeType];
    }

    toJsonObject(): any {
        const o = super.toJsonObject(["signature"]);
        o.signature=[];
        this.signature.map(x => {
            o.signature.push(x.toJsonObject());
        });
        return o;
    }
}