import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";


export type DeviceTemplateUUID = string;

export interface DeviceTemplateOptions {
    uuid?:DeviceTemplateUUID;
    os?:OperatingSystem;
}

/**
 *
 */
export class DeviceTemplate {

    uuid:DeviceTemplateUUID;
    os:OperatingSystem = OperatingSystem.NONE;

    constructor(pOptions:Nullable<DeviceTemplateOptions> = null) {
        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.os = (pOptions.os!=null ? pOptions.os : OperatingSystem.NONE);
        }
    }

    toJsonObject():any {
        return {
            uuid: this.uuid,
            os: this.os
        }
    }
}