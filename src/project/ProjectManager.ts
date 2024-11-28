import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount} from "../user/UserAccount.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {ApplicationUnit} from "../organization/ApplicationUnit.js";
import AccessControl from "../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";

/**
 *
 */
export class ProjectManager {

    private _ctx:DexcaliburEngine;

    constructor(pCtx:DexcaliburEngine) {
        this._ctx = pCtx;
    }

    async listProjectByUser( pAccount:UserAccount):Promise<DexcaliburProject[]> {
        const all = this._ctx.getEngineDB().getCollectionOf(DexcaliburProject.TYPE.getType()).getAsList();

        return [];
    }

    async listProjectByOrgUnit( pAccount:UserAccount, pOrg:OrganizationUnit):Promise<DexcaliburProject[]> {
        return [];
    }

    async newProject( pAccount:UserAccount, pAppUnit:ApplicationUnit, pOptions:any):Promise<DexcaliburProject> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AU_NEW_PROJ,
            pAccount,
            pAppUnit,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.APP_MEMBER,
            ]
        );

        const proj = await this._ctx.newProject(
            pOptions.uid,
            pOptions.inputs,
            pOptions.device,
            pAccount,
            pOptions.platform,
            pOptions.analyzerOpts
        );

        pAppUnit.attachProject(proj);
        //this._ctx.getOrgManager().updateApplication(pAccount, pAppUnit);

        return proj;
    }
}