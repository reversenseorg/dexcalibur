

export enum DDVMIR_ASSIGN_POLICY {
    NO_OPT,
    IF_PASSED_AS_ARG = 1,
    IF_MULTI_ACCESSED =2
};

interface DDVM_IRPolicies {
    [pName: string] :number
}

export class DDVM_PseudoCodeConfiguration
{

    policies:DDVM_IRPolicies = {
        assign: DDVMIR_ASSIGN_POLICY.IF_MULTI_ACCESSED | DDVMIR_ASSIGN_POLICY.IF_PASSED_AS_ARG
    };

    constructor() {}

    setPolicy( pName:string, pVal:number):void{
        if(this.policies[pName]!==undefined){
            this.policies[pName] = pVal;
        }
    }

    getPolicy(pName):number{
        return this.policies[pName];
    }

}