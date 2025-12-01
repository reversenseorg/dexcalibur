import {External} from "../external/External.js";
import * as _proc_ from "child_process";
import * as _fs_ from "fs";
import * as _path_ from "path";

import {Connection, ConnectionProtocol} from "../organization/conn/Connection.js";
import {UserAccount} from "../user/UserAccount.js";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import Util from "../Utils.js";
import {RuntimeSecurityException} from "../errors/RuntimeSecurityException.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import * as Log from "../Logger.js";
import {DownloadedProjectInput, ProjectInputPurpose} from "../analyzer/ProjectInput.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;



export interface ApkDownloaderOptions {
    username:string;
    token:string;
    store?:string;
    destFolder:string;
    device?:string;
    split_apk?:string
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
    downloadWith( pUser:UserAccount, pPackageID:string, pOrg:OrganizationUnit, pConnection:Connection, pDest:string):DownloadedProjectInput[]{

        const opts:ApkDownloaderOptions = {
            store: "",
            username: "",
            token: "",
            destFolder: pDest,
            device: null,
            split_apk: null
        };


        // authentication
        if(pConnection.hasField("account_username")){
            opts.username =  (pConnection.getField("account_username") as any).field;
        }

        if(pConnection.hasField("device")){
            opts.device =  (pConnection.getField("device") as any).field;
        }

        if(pConnection.hasField("split_apk")){
            opts.split_apk =  (pConnection.getField("split_apk") as any).field;
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
    download( pUser:UserAccount, pPackageID:string, pOptions:ApkDownloaderOptions):DownloadedProjectInput[] {
        let args:string[] = [];

        const pkgid = Util.trim(pPackageID,false,true);
        /*if(/^[a-zA-Z0-9_][a-zA-Z0-9._]+(@[0-9]+\.[0-9]+\.[0-9]+)?$/.test(pkgid)===false){
            throw new Error("Package ID has invalid format.")
        }*/

        // package
        args.push(`-a`);
        args.push(pkgid);

        // store
        args.push(`-d`);
        args.push(pOptions.store);

        if(pOptions.username){
            args.push('-e');
            args.push(pOptions.username);
        }

        const extr:string[] = [];
        let mult = false;

        if(pOptions.device!=null){
            if(pOptions.device.match(/^[a-zA-Z0-9_]+$/)===null){
                throw RuntimeSecurityException.FORBIDDEN_IN_COMMAND("Invalid device name");
            }
            extr.push(`device=${pOptions.device}`);
        }
        if(pOptions.split_apk!=null){
            if(!ValidationRule.newPinklistAssert(["true","false"]).test(pOptions.split_apk)){
                throw RuntimeSecurityException.FORBIDDEN_IN_COMMAND("Invalid value for split_apk option");
            }
            extr.push(`split_apk=${pOptions.split_apk}`);
            mult = true;
        }

        if(extr.length>0){
            args.push("-o");
            args.push(extr.join(","));
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
            stdio: ['ignore', process.stdout, process.stderr /*'pipe', 'pipe'*/ ],
        });

        if(mult){
            // split APKs mode
            const dest = _path_.join(pOptions.destFolder,pPackageID)
            const entries = _fs_.readdirSync(dest);
            let res:DownloadedProjectInput[] = [];

            entries.map((vEntry:string)=>{
                if(vEntry.endsWith('.apk')){
                    res.push({
                        path: _path_.join(dest,vEntry),
                        purpose: (vEntry===pPackageID+".apk" ? ProjectInputPurpose.MAIN : ProjectInputPurpose.EXTRA)
                    });

                    Logger.info("[*] Split APK : "+vEntry+" downloaded.");
                }
            })

            if(res.length==0){
                throw new Error("Application packages cannot be downloaded.")
            }


            return res;
        }else{
            // single APK mode
            const apk = _path_.join(pOptions.destFolder,pPackageID+".apk");
            if(!_fs_.existsSync(apk)){
                throw new Error("Application package cannot be downloaded.")
            }


            Logger.info("[*] Single APK : "+apk+" downloaded.");
            return [{ path:apk, purpose: ProjectInputPurpose.MAIN }];
        }

    }
}
const p = Util.whereIs(ApkeepHelper.BIN);
if(p!=null){
    ApkeepHelper.BIN = p;
}
