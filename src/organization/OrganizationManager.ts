import DexcaliburEngine from "../DexcaliburEngine.js";
import {OrganizationUnit} from "@dexcalibur/dxc-orgs";
import {UserAccount} from "../user/UserAccount.js";


export class OrganizationManager {

    private _ctx:DexcaliburEngine;

    constructor( pInstance:DexcaliburEngine) {
        this._ctx = pInstance;
    }

    async listOrganizations(pUserAccount:UserAccount):Promise<OrganizationUnit[]> {
        //this._ctx.getEngineDB().
        return []
    }

    async createOrganizations(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<OrganizationUnit> {
        return null;
    }
}