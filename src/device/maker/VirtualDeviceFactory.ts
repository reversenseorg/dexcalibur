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

import DeviceManager from "../../DeviceManager.js";
import {UserAccount} from "../../user/UserAccount.js";
import {DeviceTemplate} from "../template/DeviceTemplate.js";
import {Device, DeviceUUID} from "../../Device.js";
import {AndroidVirtualDeviceFactory} from "./AndroidVirtualDeviceFactory.js";
import AccessControl from "../../user/acl/AccessControl.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";
import {Observable, Subject} from "rxjs";
import {VdevEvent} from "./VdevEvent.js";
import {DeviceInstance} from "./DeviceInstance.js";
import {Nullable} from "../../core/IStringIndex.js";
import {OrganizationUnit} from "../../organization/OrganizationUnit.js";

/**
 * The main API to allocate and destroy virtual devices
 */
export class VirtualDeviceFactory {

    private _pool:Record<DeviceUUID, Device> = {};
    private _dm:DeviceManager;
    private _avdf:AndroidVirtualDeviceFactory;

    constructor(pCtx:DeviceManager) {
        this._dm = pCtx;
        this._avdf = new AndroidVirtualDeviceFactory(this._dm);
    }

    /**
     * To provision a device
     *
     * @param {UserAccount} pUserAccount
     * @param {DeviceTemplate} pTemplate
     * @returns
     */
    async provisionDevice(pUserAccount:UserAccount,
                          pTemplate:DeviceTemplate,
                          pOrg:Nullable<OrganizationUnit>):Promise<Observable<VdevEvent>> {

        AccessControl.isAuthorized(
            (pTemplate.isVirtual()? AccessControl.access.DEV_ALLOC_VIRT : AccessControl.access.DEV_ALLOC_PHY),
            pUserAccount
        );

        let vdev:Observable<VdevEvent> = null;
        switch (pTemplate.getOS()){
            case OperatingSystem.ANDROID:
                vdev = await this._avdf.allocateDevice(pUserAccount, pTemplate);
                await this._dm.save();
                break;
            default:
                throw VirtualDeviceFactoryException.OS_NOT_SUPPORTED(pUserAccount.getUID(),pTemplate.getOS());
                break;
        }

        return vdev;
    }

    async destroyDevice(pUserAccount:UserAccount, pDevice:Device):Promise<boolean> {
        if(pDevice.isEmulated){
            AccessControl.isAuthorized(
                AccessControl.access.DEV_DESTROY_VIRT,
                pUserAccount
            );
        }else{
            AccessControl.isAuthorized(
                AccessControl.access.DEV_DESTROY_PHY,
                pUserAccount
            );
        }

        return false;
    }

    /**
     * To start a device
     *
     * @param {UserAccount} pUserAccount
     * @param {Device} pDevice
     * @returns
     */
    async startDevice(pUserAccount:UserAccount, pDevice:Device):Promise<Observable<VdevEvent>> {


        AccessControl.isAuthorized(
            AccessControl.access.DEV_INS_START,
            pUserAccount
        );


        let vdev:Observable<VdevEvent> = null;
        switch (pDevice.getTemplate().getOS()){
            case OperatingSystem.ANDROID:
                vdev = await this._avdf.startDevice(pUserAccount, pDevice);
                break;
            default:
                throw VirtualDeviceFactoryException.OS_NOT_SUPPORTED(pUserAccount.getUID(),pDevice.getTemplate().getOS());
                break;
        }

        return vdev;
    }

    /**
     * To stop a device
     *
     * @param {UserAccount} pUserAccount
     * @param {Device} pDevice
     * @param {DeviceInstance} pInstance
     * @returns
     */
    async stopDevice(pUserAccount:UserAccount, pDevice:Device, pInstance:DeviceInstance):Promise<number> {

        AccessControl.isAuthorized(
            AccessControl.access.DEV_INS_KILL,
            pUserAccount
        );

        let vdev:Observable<VdevEvent> = null;
        switch (pDevice.getTemplate().getOS()){
            case OperatingSystem.ANDROID:
                return await this._avdf.stopDevice(pUserAccount, pDevice, pInstance);
            default:
                throw VirtualDeviceFactoryException.OS_NOT_SUPPORTED(pUserAccount.getUID(),pDevice.getTemplate().getOS());
                break;
        }

    }
}