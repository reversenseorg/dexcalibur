import DeviceManager from "../../DeviceManager.js";
import {UserAccount} from "../../user/UserAccount.js";
import {DeviceTemplate} from "../template/DeviceTemplate.js";
import {Device} from "../../Device.js";
import {AndroidVirtualDeviceFactory} from "./AndroidVirtualDeviceFactory.js";
import AccessControl from "../../user/acl/AccessControl.js";
import {OrganizationAccessControl} from "../../user/acl/rbac/OrganizationAccessContol.js";

/**
 * The main API to allocate and destroy virtual devices
 */
export class VirtualDeviceFactory {

    private _dm:DeviceManager;
    private _avdf:AndroidVirtualDeviceFactory;

    constructor(pCtx:DeviceManager) {
        this._dm = pCtx;
    }

    async provisionDevice(pUserAccount:UserAccount, pTemplate:DeviceTemplate):Promise<Device> {
        if(pTemplate.isVirtual()){
            AccessControl.isAuthorized(
                AccessControl.access.DEV_ALLOC_VIRT,
                pUserAccount
            );
        }else{
            AccessControl.isAuthorized(
                AccessControl.access.DEV_ALLOC_PHY,
                pUserAccount
            );
        }

        return null;
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
}