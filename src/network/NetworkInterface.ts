import {IStringIndex} from "../core/IStringIndex.js";

export type IpVersion = "ipv4" | "ipv6";

export interface NetworkInterfaceOptions {
    ip:string;
    version:IpVersion;
    port?:number;
    domain?:URL;
}

/**
 * Represent any network interface
 */
export class NetworkInterface {
    ip:string;
    version:IpVersion;
    port:number = -1;

    /**
     * The domain mapped to this interface
     * @type {URL}
     */
    domain:URL;


    constructor(pOptions:NetworkInterfaceOptions) {
        for(let i in pOptions){
            (this as IStringIndex<any>)[i] = pOptions[i];
        }
    }

}