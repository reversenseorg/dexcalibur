import {NetworkInterface} from "./NetworkInterface.js";


export interface EndpointOptions {
    interfaces?:NetworkInterface[];
    host?:string;
    port?:number;
    allowInsecureHttp?: boolean;
    allowInsecureHttpTemp?: boolean;
    minTLSVersion?: boolean;
    includeSubdomains?: boolean;
}
/**
 * Represents any endpoint.
 *
 * It is mainly used to represent remote server, but it could represent
 * devices (especially for IoT context) too.
 *
 * @class
 */
export class Endpoint {

    interfaces:NetworkInterface[] = [];

    host:string = null;
    port:number = null;

    allowInsecureHttp?: boolean;
    allowInsecureHttpTemp?: boolean;
    minTLSVersion?: boolean;
    includeSubdomains?: boolean;


    constructor(pOptions?:EndpointOptions) {
        if(pOptions!=null){
            // @ts-ignore
            for(let p of pOptions){
                this[p] = pOptions[p];
            }
        }
    }

    getHost():string {
        return this.host;
    }

    getPort():number {
        return this.port;
    }

    /**
     * To add a network interface to the endpoint
     *
     * @param {NetworkInterface} pIf Network interface
     */
    addInterface(pIf:NetworkInterface):void {
        this.interfaces.push(pIf);
    }
}