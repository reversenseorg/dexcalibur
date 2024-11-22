import {AuthModule} from "../AuthModule.js";
import {OrganizationUnit} from "../../../organization/OrganizationUnit.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {AuthenticationModuleException} from "../error/AuthenticationModuleException.js";

export type AuthStrategyUUID = string;

export interface AuthenticatorGate  {
    strategy: AuthStrategyUUID,
    endpoint: string,
    failureRedirect: string,
    successRedirect: string,
    extra: any
}

/**
 * Represent the state of a loaded modules
 *
 * @class
 */
export class LoadedAuthModule {

    private _module:AuthModule;
    private _org:Nullable<OrganizationUnit> = null;
    private _stratUID:Nullable<AuthStrategyUUID> = null;
    private _gate:AuthenticatorGate;

    constructor( pModule:AuthModule, pOrg:Nullable<OrganizationUnit> = null) {
        this._module = pModule;
        if(pOrg!=null){
            this._org = pOrg;
            this.setUUID(LoadedAuthModule.generateStratUUID(pModule,pOrg));
        }
    }

    static generateStratUUID(pModule:AuthModule, pOrg:OrganizationUnit):AuthStrategyUUID {
        return `${pModule.type}_${pOrg.getUID()}_${pModule.getUID()}`;
    }

    setUUID(pUID:AuthStrategyUUID):void {
        this._stratUID = pUID;
        this._gate = {
            strategy: this._stratUID,
            endpoint: "",
            failureRedirect: "",
            successRedirect: "",
            extra: {}
        };
    }

    getUUID():AuthStrategyUUID{
        if(this._stratUID==null){
            throw AuthenticationModuleException.INVALID_STATE_UUID(this._module);
        }
        return this._stratUID;
    }

    updateGateEndpoint( pEndpoint:string):void {
        this._gate.endpoint = pEndpoint;
    }

    updateGateFailure( pEndpoint:string):void {
        this._gate.failureRedirect = pEndpoint;
    }

    updateGateSuccess( pEndpoint:string):void {
        this._gate.successRedirect = pEndpoint;
    }

    getAuthEndpoint():string {
        return this._gate.endpoint;
    }

    getFailureEndpoint():string {
        return this._gate.failureRedirect;
    }

    getSuccessEndpoint():string {
        return this._gate.successRedirect;
    }

    getExtra():any {
        return this._gate.extra;
    }

    updateExtra(pAny:any):void {
        for(let k in pAny){
            this._gate.extra[k] = pAny[k];
        }
    }
}