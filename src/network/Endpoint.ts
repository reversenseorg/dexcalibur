import {NetworkInterface} from "./NetworkInterface.js";

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


    constructor() {

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