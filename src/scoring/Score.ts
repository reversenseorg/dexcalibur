
export enum TrustLevel {
    ESTIMATED,
    VERIFIED
}

export default class Score {

    /**
     * Score type (privacy, security, ...)
     */
    type:string;
    uid:string;
    value:number;
    weight:number;
    evidences:any[];
    trust:TrustLevel = TrustLevel.ESTIMATED;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    getType():string {
        return this.type;
    }

    getUID():string {
        return this.uid;
    }

    getValue():number {
        return this.value;
    }

    getWeight():number {
        return this.weight;
    }

    getEvidences():any[] {
        return this.evidences;
    }

    isVerified():boolean {
        return (this.trust===TrustLevel.VERIFIED);
    }
}
