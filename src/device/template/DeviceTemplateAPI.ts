/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {DeviceTemplate, DeviceTemplateUUID} from "./DeviceTemplate.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import {UserAccount} from "../../user/UserAccount.js";
import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {DeviceManagerException} from "../../errors/DeviceManagerException.js";
import AccessControl from "../../user/acl/AccessControl.js";
import {DeviceAccessControl} from "../../user/acl/rbac/DeviceAccessControl.js";
import {randomUUID} from "crypto";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {OrganizationManagerException} from "../../errors/OrganizationManagerException.js";
import {ProjectAccessControl} from "../../user/acl/rbac/ProjectAccessContol.js";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";
import {AndroidImgType, DevicePurpose, DeviceTemplateFactory} from "./DeviceTemplateFactory.js";
import {Architecture} from "../../Architecture.js";


/**
 * Internal API to manage Device templates
 *
 * @class
 */
export class DeviceTemplateAPI {

    private _ctx:DexcaliburEngine;

    constructor(pContext:DexcaliburEngine) {
        this._ctx = pContext;
    }

    /**
     * To import built-in hardcoded device template in the database
     *
     */
    async importBuiltIn():Promise<void> {

        const builtins = [
            DeviceTemplateFactory.newAndroidArm64("34", true, AndroidImgType.AOSP, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("33", true, AndroidImgType.AOSP, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("32", false, AndroidImgType.AOSP, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("36", true, AndroidImgType.GOOGLE_APIS_PLAYSTORE, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("36", true, AndroidImgType.GOOGLE_APIS, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("36.1", true, AndroidImgType.GOOGLE_APIS_PLAYSTORE, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("35", false, AndroidImgType.AOSP, DevicePurpose.PHONE),
            DeviceTemplateFactory.newAndroidArm64("32", true, AndroidImgType.AOSP, DevicePurpose.TV),
            DeviceTemplateFactory.newIosArm64("32", false),
            DeviceTemplateFactory.newLinux("5.5", true, DevicePurpose.DESKTOP),
            DeviceTemplateFactory.newTizen("8.0.0", true, DevicePurpose.TV), // M2
            DeviceTemplateFactory.newTizen("10.0.0", true, DevicePurpose.ANY),
            DeviceTemplateFactory.newUnicorn("v8a", true, Architecture.AARCH64, DevicePurpose.IOT),
            DeviceTemplateFactory.newUnicorn("v7", true, Architecture.AARCH32, DevicePurpose.IOT),
        ];

        // retrieve list
        const all = await this._ctx.getEngineDB().getDeviceTemplates(-1);
        let res:DeviceTemplate;

        for(let i=0;i<builtins.length;i++){
            res = all.find(dt => {
                return ((dt.os === builtins[i].os)
                    &&
                    (dt.extra?.version === builtins[i].extra?.version)
                    &&
                    (dt.name === builtins[i].name))
            });

            if(res==null){
                await this.createTemplate(
                    this._ctx.getInternalAcc(),
                    builtins[i]
                );
            }
        }
    }

    // @PrivateAPI
    /**
     * To retrieve devie template from its UUID and check owner
     *
     * @param {UserAccount} pUserAccount
     * @param {DeviceTemplateUUID} pDevTplUID
     * @returns {Promise<DeviceTemplate>}
     * @method
     */
    async getTemplate(pUserAccount:UserAccount, pDevTplUID:DeviceTemplateUUID):Promise<DeviceTemplate> {

        // retrieve device template
        const devTpl = await (this._ctx.getEngineDB()
            .getCollectionOf(NodeInternalType.DEVICE_TPL) as MongodbDbCollection)
            .asyncGetEntry({ uuid: pDevTplUID });

        if(devTpl==null){
            throw DeviceManagerException.DEVTPL_NOT_FOUND(pDevTplUID)
        }

        // check acl
        /*AccessControl.isAuthorizedByAttr(
            DeviceAccessControl.attr.OWNER,
            devTpl,
            pUserAccount
        );*/

        return devTpl;
    }

    /**
     * To retrieve devie template from its UUID and check owner
     *
     * @param {UserAccount} pUserAccount
     * @param {DeviceTemplateUUID} pDevTplUID
     * @returns {Promise<DeviceTemplate>}
     * @method
     */
    async listTemplates(pUserAccount:UserAccount, pOrgUnit:Nullable<OrganizationUnit> = null):Promise<DeviceTemplate[]> {

        // retrieve device template
        const devTpls = await (this._ctx.getEngineDB()
            .getCollectionOf(NodeInternalType.DEVICE_TPL) as MongodbDbCollection)
            .getAsList();

        if(devTpls==null){
            throw DeviceManagerException.CANNOT_LIST_TPL(pOrgUnit!=null? pOrgUnit.getUID():null)
        }

        // TODO : later, filter orgs / ACL

        return devTpls;
    }

    /**
     * To check if the UUID is free
     *
     * @param pType
     * @param pUUID
     */
    async isUuidFree(pType:NodeInternalType, pUUID:string):Promise<boolean> {

        let coll:Nullable<IDbCollection> = null;
        switch (pType){
            case NodeInternalType.DEVICE_TPL:
                coll = await (this._ctx.getEngineDB().getCollectionOf(pType) as MongodbDbCollection);
                break;
        }

        if(coll==null){
            throw OrganizationManagerException.CANNOT_CHECK_UUID();
        }

        const res = await (coll as MongodbDbCollection).asyncGetEntry({ uuid:pUUID });
        return (res == null);
    }

    // @PrivateAPI
    /**
     * To retrieve devie template from its UUID and check owner
     *
     * @param {UserAccount} pUserAccount
     * @param {DeviceTemplateUUID} pDevTplUID
     * @returns {Promise<DeviceTemplate>}
     * @method
     */
    async createTemplate(pUserAccount:UserAccount, pDevTpl:DeviceTemplate):Promise<DeviceTemplate> {

        // find free uuid
        let uuid:DeviceTemplateUUID;
        do{
            uuid = randomUUID();
        }while(!this.isUuidFree(NodeInternalType.DEVICE_TPL, uuid))

        pDevTpl.uuid = uuid;

        // add attribute
        pDevTpl.appendToAccessAttribute(ProjectAccessControl.attr.OWNER, pUserAccount.getUID());

        // retrieve device template
        const devTpl = await (this._ctx.getEngineDB()
            .getCollectionOf(NodeInternalType.DEVICE_TPL) as MongodbDbCollection)
            .asyncAddEntry(pDevTpl.getUID(), pDevTpl);


        return devTpl;
    }

    /**
     * To update a device template from its UUID and check owner
     *
     * @param {UserAccount} pUserAccount
     * @param {DeviceTemplateUUID} pDevTplUID
     * @returns {Promise<DeviceTemplate>}
     * @method
     */
    async updateTemplate(pUserAccount:UserAccount, pDevTpl:DeviceTemplate):Promise<DeviceTemplate> {

        // check acl
        AccessControl.isAuthorized(
            AccessControl.access.DEV_TPL_UPDATE,
            pUserAccount,
            pDevTpl,
            [
                DeviceAccessControl.attr.OWNER
            ]
        );

        // add attribute
        pDevTpl.appendToAccessAttribute(ProjectAccessControl.attr.OWNER, pUserAccount.getUID());

        // retrieve device template
        const devTpl = await (this._ctx.getEngineDB()
            .getCollectionOf(NodeInternalType.DEVICE_TPL) as MongodbDbCollection)
            .asyncAddEntry(pDevTpl.getUID(), pDevTpl);


        return devTpl;
    }
}