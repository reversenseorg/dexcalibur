import {AuthType} from "./AuthTypes";
import {AuthenticationSettings} from "./AuthenticationSettings";


function getValueFrom( pObject:any, pField:string, pDefaultValue:any):any {
    return (pObject.hasOwnProperty(pField)? pObject[pField] : pDefaultValue);
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

    constructor( pSettings:AuthenticationSettings) {
        let p = pSettings.policy;
        this.enforced = getValueFrom(p, 'enforced', true);
        this.delayOnFail = getValueFrom(p, 'delayOnFail', true);
        this.delay = getValueFrom(p, 'delay', true);
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
}