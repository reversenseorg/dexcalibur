import {AuthType} from "./AuthTypes.js";
import {AuthenticationOptions, AuthenticationSettings} from "./AuthenticationSettings.js";


function getValueFrom( pObject:any, pField:string, pDefaultValue:any):any {
    return (pObject.hasOwnProperty(pField)? pObject[pField] : pDefaultValue);
}

export interface AuthenticationPolicyOptions {
    enforced?:boolean;
    delayOnFail?:boolean;
    delay?:number;
    resetAfter?:number;
    maxAttempts?:number;
    defaultType?:AuthType;
}

/**
 * Represent an authentication policy
 */
export class AuthenticationPolicy {

    enforced:boolean = true;
    delayOnFail:boolean = false;
    delay:number = 0;
    resetAfter:number = 3600;
    maxAttempts:number = -1;
    supported: AuthType[] = [];
    defaultType: AuthType = null;

    constructor( pSettings:AuthenticationOptions) {
        let p = pSettings.policy;
        this.enforced = getValueFrom(p, 'enforced', true);
        this.delayOnFail = getValueFrom(p, 'delayOnFail', true);
        this.delay = getValueFrom(p, 'delay', 30);
        this.resetAfter = getValueFrom(p, 'resetAfter', 3600);
        this.maxAttempts = getValueFrom(p, 'maxAttempts', -1);
        this.supported = pSettings.supported;
        this.defaultType = getValueFrom(p, 'defaultType', AuthType.NONE);

        if(this.supported==null || this.supported.indexOf(this.defaultType)==-1){
            this.defaultType = null;
        }
    }

    isEnforced():boolean {
        return this.enforced;
    }

    isSupported( pType:AuthType):boolean {
        return (this.supported.indexOf(pType)>-1);
    }



    hasMaxAttempts():boolean {
        return this.maxAttempts>0;
    }

    hasDelayOnFail():boolean {
        return this.delayOnFail===true;
    }

    explains(pIndent = 2):string {
        return `
${"\t".repeat(pIndent)}enforced = ${this.enforced}  
${"\t".repeat(pIndent)}delayOnFail = ${this.delayOnFail}
${"\t".repeat(pIndent)}delay = ${this.delay}
${"\t".repeat(pIndent)}resetAfter = ${this.resetAfter}
${"\t".repeat(pIndent)}maxAttempts = ${this.maxAttempts}
${"\t".repeat(pIndent)}supported = ${this.supported}
${"\t".repeat(pIndent)}defaultType = ${this.defaultType}          
`;
    }

    toObject():AuthenticationPolicyOptions {
        return {
            enforced: this.enforced,
            defaultType: this.defaultType,
            resetAfter: this.resetAfter,
            maxAttempts: this.maxAttempts,
            delay: this.delay,
            delayOnFail: this.delayOnFail,
        };
    }
}