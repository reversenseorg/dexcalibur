import {Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";

let gInstance:Nullable<OperatingSystemHelper> = null;


export class OperatingSystemHelper {

    private constructor(){}

    static getInstance():OperatingSystemHelper{
        if(gInstance==null) gInstance = new OperatingSystemHelper();
        return gInstance;
    }

    getSupportedOS():OperatingSystem[] {
        return []
    }
}