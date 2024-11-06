import DexcaliburEngine from "./DexcaliburEngine.js";
import {UserAccount} from "./user/UserAccount.js";
import {OrganizationUnit} from "@dexcalibur/dxc-orgs";
import DexcaliburProject from "./DexcaliburProject.js";

/**
 *
 */
export class ProjectManager {

    private _ctx:DexcaliburEngine;

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    async listProjectByUser( pAccount:UserAccount):Promise<DexcaliburProject[]> {
        return [];
    }

    async listProjectByOrgUnit( pAccount:UserAccount, pOrg:OrganizationUnit):Promise<DexcaliburProject[]> {
        return [];
    }
}