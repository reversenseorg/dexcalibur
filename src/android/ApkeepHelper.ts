import {External} from "../external/External.js";
import * as _proc_ from "child_process";
import * as _fs_ from "fs";
import * as _path_ from "path";

import {Connection, ConnectionProtocol} from "../organization/conn/Connection.js";
import {UserAccount} from "../user/UserAccount.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";


export interface ApkDownloaderOptions {
    username:string;
    token:string;
    store?:string;
    destFolder:string;
}

export class ApkeepHelper extends  External.ExternalHelper {


    static BIN = "apkeep";

    /**
     *
     */
    duration:number = -1;

    opts:any  = {
        store: ""
    }


    constructor() {
        super()
    }

    /**
     *
     * @param pUser
     * @param pPackageID
     * @param pOrg
     * @param pConnection
     * @param pDest
     */
    downloadWith( pUser:UserAccount, pPackageID:string, pOrg:OrganizationUnit, pConnection:Connection, pDest:string):string{

        const opts:ApkDownloaderOptions = {
            store: "",
            username: "",
            token: "",
            destFolder: pDest
        };


        // authentication
        if(pConnection.hasField("account_username")){
            opts.username =  (pConnection.getField("account_username") as any).field;
        }

        if(pConnection.hasSecret("aas_token")){
            opts.token = pOrg.readSecret(pUser, pConnection.getSecretByName("aas_token")).toString();
        }

        switch (pConnection.type){
            case ConnectionProtocol.PLAYSTORE: opts.store = 'google-play'; break;
            case ConnectionProtocol.APKPURE:opts.store = 'apk-pure'; break;
            case ConnectionProtocol.FDROID: opts.store = 'f-droid'; break;
            case ConnectionProtocol.HUAWAIAPPG: opts.store = 'huawei-app-gallery'; break;
            default: throw new Error("Application store not supported.");
        }

        return this.download( pUser, pPackageID, opts);
    }

    /**
     * To download a package to a temporary location and return path
     *
     * @param pPackageID
     * @param pConnection
     */
    download( pUser:UserAccount, pPackageID:string, pOptions:ApkDownloaderOptions):string {
        let args:string[] = [];

        if(/^[a-zA-Z0-9_][a-zA-Z0-9._]+(@[0-9]+\.[0-9]+\.[0-9]+)?$/.test(pPackageID)===false){
            throw new Error("Package ID has invalid format.")
        }

        // package
        args.push(`-a`);
        args.push(pPackageID);

        // store
        args.push(`-d`);
        args.push(pOptions.store);

        if(pOptions.username){
            args.push('-e');
            args.push(pOptions.username);
        }

        if(pOptions.token){
            args.push('-t');
            args.push(pOptions.token);
        }

        if(!_fs_.existsSync(pOptions.destFolder)){
            _fs_.mkdirSync(pOptions.destFolder);
        }

        args.push(pOptions.destFolder);

        const result = _proc_.spawnSync(ApkeepHelper.BIN, args, {
            stdio: ['ignore', 'pipe', 'pipe'],
        });

        const output = _path_.join( pOptions.destFolder, pPackageID+'.apk');
        if(!_fs_.existsSync(output)){
            throw new Error("Application package cannot be downloaded.")
        }

        return output;
    }




}