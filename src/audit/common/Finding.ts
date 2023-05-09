
export interface FindingOptions {
    node?:any;
    kb?:any;
    impact?:number;
    trust?:number;
}

/**
 * Represent a finding after a scan
 */
export class Finding  {

    node:any;

    kb:any = null;

    impact:number = 1;

    trust:number = 1;

    constructor( pConfig:FindingOptions) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

    getTrust():number {
        return this.trust;
    }

    getImpact():number {
        return this.impact;
    }

    toJsonObject():any {
        let o:any = {};

        for(const i in this){
            switch (i){
                case 'node':
                    if(this.node!=null){
                        if(this.node.toJsonObject!=null){
                            o.node = this.node.toJsonObject();
                        }else{
                            o.node = this.node;
                        }
                    }else{
                        o.node = null;
                    }
                    break;
                case 'kb':
                    o.kb = (this.kb!=null) ? this.kb.getUID() : null;
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }

        return o;
    }
}