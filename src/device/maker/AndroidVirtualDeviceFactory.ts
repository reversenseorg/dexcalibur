import {DeviceTemplate} from "../template/DeviceTemplate.js";
import {Device} from "../../Device.js";
import {UserAccount} from "../../user/UserAccount.js";


export class AndroidVirtualDeviceFactory {

    constructor() {
    }

    /**
     * To allocate a new android device (virtual or physical) accordingly to the template
     * @param pTemplate
     */
    async allocateDevice( pUserAccount:UserAccount, pTemplate:DeviceTemplate):Promise<Device> {
        return null;
    }



}