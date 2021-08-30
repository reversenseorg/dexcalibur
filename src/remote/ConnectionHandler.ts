
import {DexcaliburConnectionParams} from "./DexcaliburConnectionParams";
import {ConnectionToken} from "./ConnectionToken";
import {ConnectionCredentials} from "./ConnectionCredentials";

export interface ConnectionHandlerMap {
    [name:string] :ConnectionHandler
}

export class ConnectionHandler {

    hostname:string = "";
    port:string = "";
    token: ConnectionToken;

    constructor(pParam:DexcaliburConnectionParams) {

        try{
            this.hostname = pParam.getIpAddress();
        }catch (err) {
            try{
                this.hostname = pParam.getHostname();
            }catch(e){}
        }

        try{
            this.port = pParam.getPort()+"";
        }catch (e) {
            this.port = "";
        }
    }

    doAuthentication( pCred:ConnectionCredentials ):void {

    }

    doApiRequest():void {

    }


}