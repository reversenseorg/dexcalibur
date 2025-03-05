import got, {Options} from "got";
import DexcaliburEngine from "../DexcaliburEngine.js";
import Control from "../audit/common/Control.js";
import {HttpClient} from "../core/HttpClient.js";
import {DeviceManagerClientException} from "./error/DeviceManagerClientException.js";

const GOT = got.default;

/**
 *
 */
export class DeviceManagerClient extends HttpClient {

    sshPort:string;
    sshUser:string;
    sshKey:string;

    private _ctx:DexcaliburEngine;

    constructor( pEngine:DexcaliburEngine) {
        super({
            host: process.env.DXC_VDM_HOST,
            port: process.env.DXC_VDM_PORT,
            ctx: pEngine
        });

        this._updateSettings();
    }


    private _updateSettings():void {

        if(process.env.DXC_VDM_SSH_PORT!=null){
            this.sshPort = process.env.DXC_VDM_SSH_PORT;
        }
        if(process.env.DXC_VDM_SSH_USER!=null){
            this.sshUser = process.env.DXC_VDM_SSH_USER;
        }
        if(process.env.DXC_VDM_SSH_KEY!=null){
            this.sshKey = process.env.DXC_VDM_SSH_KEY;
        }
    }

    async testHttpConnection():Promise<boolean> {

        const response = await this.perform(this.baseURL+"api/health/status");

        const raw = JSON.parse(response.body);
        const ctrls:Control[] = [];

        if(raw.success){
            raw.data.map( x => {
                ctrls.push( Control.fromJsonObject(x));
            });
        }

        return false;
    }

    async testSshConnection():Promise<boolean> {
        return false;
    }

    async startRemoteVDM():Promise<any>{
        if(this.sshKey==null){
            throw DeviceManagerClientException.CANNOT_INIT_SSH();
        }
    }
}