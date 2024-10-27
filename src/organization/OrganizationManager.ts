import DexcaliburEngine from "../DexcaliburEngine.js";
import {ApplicationUnit, OrganizationUnit} from "@dexcalibur/dxc-orgs";
import {UserAccount} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {randomUUID} from "crypto";


export class OrganizationManager {

    private _ctx:DexcaliburEngine;

    constructor( pInstance:DexcaliburEngine ) {
        this._ctx = pInstance;
    }

    async listOrganizations(pUserAccount:UserAccount):Promise<OrganizationUnit[]> {
        AccessControl.check(
            AccessZone.ORGANIZATION,
            OrganizationAccessControl.access.ORG_OU_READ,
            null,
            pUserAccount
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .getAsList();
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getOrganization(pUserAccount:UserAccount, pUID:string):Promise<OrganizationUnit> {

        AccessControl.check( AccessZone.ORGANIZATION, OrganizationAccessControl.access.ORG_OU_READ, null, pUserAccount);

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncGetEntry(pUID);

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);

        return org;
    }

    async isUuidFree(pType:NodeInternalType, pUUID:string):Promise<boolean> {
        let exists = false;
        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.ORG_UNIT:
                coll = await this._ctx.getEngineDB().getCollectionOf(pType).search({ uuid:pUUID });
                break;
            case NodeInternalType.APP_UNIT:
                coll = await this._ctx.getEngineDB().getCollectionOf(pType).search({ uuid:pUUID });
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        const res = await coll.search({ uuid:pUUID })
        console.log("isUuidFree ",res);
        return (res.length==0)
    }

    async createOrganizations(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<OrganizationUnit> {
        AccessControl.check( AccessZone.ORGANIZATION, OrganizationAccessControl.access.ORG_OU_WRITE, null, pUserAccount);

        let uuid:string;
        do {
            uuid = randomUUID();
        }while(await this.isUuidFree(OrganizationUnit.TYPE.getType(), uuid)==false)

        pOrg.uuid = uuid;

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pOrg);


        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);

        return org;
    }

}