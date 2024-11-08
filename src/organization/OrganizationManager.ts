import DexcaliburEngine from "../DexcaliburEngine.js";
import {UserAccount} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {AccessZone} from "../user/acl/Zones.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {randomUUID} from "crypto";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {SsoOptions} from "../user/auth/AuthenticationService.js";

import * as Log from '../Logger.js';
import {OrganizationUnit} from "./OrganizationUnit.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class OrganizationManager {

    private _ctx:DexcaliburEngine;

    constructor( pInstance:DexcaliburEngine ) {
        this._ctx = pInstance;
    }

    async listOrganizations(pUserAccount:UserAccount):Promise<OrganizationUnit[]> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_READ,
            pUserAccount
        );

        const all = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .getAsList() as OrganizationUnit[];

        const userOrg:OrganizationUnit[] = all.filter((vOrgUnit:OrganizationUnit):boolean => {
            try{
                AccessControl.isAuthorized(
                    AccessControl.access.ORG_OU_READ,
                    pUserAccount,
                    vOrgUnit,
                    [
                        OrganizationAccessControl.attr.ORG_MEMBER,
                        OrganizationAccessControl.attr.OWNER
                    ]
                );

                return true;
            }catch (err){
                return false
            }
        });

        return userOrg;
    }

    /**
     * Get anb organization by its uid
     *
     * @param pUserAccount
     * @param pUID
     */
    async getOrganization(pUserAccount:UserAccount, pUID:string):Promise<OrganizationUnit> {

        AccessControl.check( AccessZone.ORGANIZATION, AccessControl.access.ORG_OU_READ, null, pUserAccount);

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncGetEntry(pUID);

        //AccessControl.checkAttr( AccessZone.ORGANIZATION, OrganizationAccessControl.attr.member, org,  pUserAccount);

        return org;
    }

    async isUuidFree(pType:NodeInternalType, pUUID:string):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.ORG_UNIT:
            case NodeInternalType.APP_UNIT:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        const res = await (coll as MongodbDbCollection).asyncGetEntry({ uuid:pUUID });
        console.log("isUuidFree ",res);
        return (res == null);
    }

    async isUnitFree(pType:NodeInternalType, pField:string, pValue:any):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.ORG_UNIT:
            case NodeInternalType.APP_UNIT:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }


        switch (pField){
            case "uuid":
            case "name":
            case "companyName":
                const filter = {};
                Object.defineProperty(filter, pField, { value:pValue, writable:false });
                const res = await (coll as MongodbDbCollection).asyncGetEntry(filter);
                return (res != null)
            default:
                throw OrganizationManagerException.CANNOT_CHECK_PPT_UNIQ(pType,pField);
        }
    }

    async createOrganizations(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<OrganizationUnit> {

        AccessControl.isAuthorized( AccessControl.access.ORG_OU_MODIFY, pUserAccount);

        // generate UUID
        let uuid:string;
        do {
            uuid = randomUUID();
        }while(await this.isUuidFree(OrganizationUnit.TYPE.getType(), uuid)==false)
        pOrg.uuid = uuid;

        if(!this.isUnitFree(OrganizationUnit.TYPE.getType(), "name", pOrg.name)){
            throw OrganizationManagerException.DUPLICATED_ORG_NAME();
        }

        // append user to owner list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.OWNER,
            pUserAccount.getUID()
        );

        // append user to member list
        pOrg.appendToAccessAttribute(
            OrganizationAccessControl.attr.ORG_MEMBER,
            pUserAccount.getUID()
        );

        const org = await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncAddEntry({ uuid: uuid}, pOrg);


        return org;
    }

    async updateOrganization(pUserAccount:UserAccount, pOrg:OrganizationUnit):Promise<boolean> {

        AccessControl.isAuthorized(
            AccessControl.access.ORG_OU_MODIFY,
            pUserAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER
            ]
        );

        return await this._ctx.getEngineDB()
            .getCollectionOf(OrganizationUnit.TYPE.getType())
            .asyncUpdateEntry(pOrg, {replace:false});;
    }


    async testSsoConnection(pAccount:UserAccount, pConnSettings:SsoOptions):Promise<boolean> {
        AccessControl.isAuthorized(AccessControl.access.ORG_AUTH_MGT, pAccount)

        return await this._ctx.getUserService().getAuthenticationService().testSsoConnection(pConnSettings)
    }


    async saveSsoConnection(pAccount:UserAccount, pOrg:OrganizationUnit, pConnSettings:SsoOptions):Promise<boolean> {
        AccessControl.isAuthorized(
            AccessControl.access.ORG_AUTH_MGT,
            pAccount,
            pOrg,
            [
                OrganizationAccessControl.attr.OWNER,
                OrganizationAccessControl.attr.ORG_MEMBER,
            ]
        );

        return false; //await this._ctx.getUserService().getAuthenticationService().saveSsoConnection(pConnSettings)
    }

}