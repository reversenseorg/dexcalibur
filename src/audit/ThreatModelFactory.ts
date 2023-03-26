import SecurityThreatModel from "./common/SecurityThreatModel.js";

export enum ThreatCategory {
    STRIDE="STRIDE",
    DREAD="DREAD",
    CIA="CIA"
}

export default class ThreatModelFactory {

    tag:number[];

    constructor(pConfig:any=null) {

    }

    static newSecurityThreatModel( pThreatCategory:ThreatCategory):SecurityThreatModel {
        switch(pThreatCategory){
            case ThreatCategory.DREAD:
                break;
            case ThreatCategory.DREAD:
                break;
        }

        return null;
    }
}