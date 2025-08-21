import {AuditManager} from "./AuditManager.js";
import {UserAccount} from "../user/UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {CryptoUtils} from "../CryptoUtils.js";
import {TokenPurpose} from "../core/secrets/Token.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";
import {OrganizationManagerException} from "../errors/OrganizationManagerException.js";
import AssuranceReport from "./common/AssuranceReport.js";
import {EmailSender} from "../core/email/EmailSender.js";
import {AuditEmailBuilder} from "./AuditEmailBuilder.js";
import DexcaliburProject from "../DexcaliburProject.js";


export class AuditManagerMailer {

    private _ctx:AuditManager;
    private _sender:EmailSender;
    private _builder:AuditEmailBuilder;

    constructor(pMgr:AuditManager) {
        this._ctx = pMgr;
        this._sender = new EmailSender(pMgr.engine);
        this._builder = new AuditEmailBuilder();

    }

    async notifyMatch(pSender:UserAccount, pTarget:(UserAccount|string)[], pReport:AssuranceReport,
                      pProject:DexcaliburProject, pFindings:any[]):Promise<void> {
        // generate activation token
        const token = Buffer.from(CryptoUtils.randomChunk(256)).toString('base64');

        //const link = `${process.env.DXC_SCHEMA!=null?process.env.DXC_SCHEMA:'http'}://${process.env.DXC_HOSTNAME!=null?process.env.DXC_HOSTNAME:'127.0.0.1:8080'}/activate/account/?token=${encodeURIComponent(token)}`;
        let emailAddr:string = null;
        // let expire:string = (pTokenLifetime>=3600)? (pTokenLifetime/3600)+" hours" : (pTokenLifetime/60)+" minutes" ;


        // validate email address
        let mails:string[] = [];
        for(let i=0; i<pTarget.length;i++){
            if(pTarget[i] instanceof UserAccount){
                if(ValidationRule.email().test((pTarget[i] as UserAccount).getEmail())){
                    mails.push((pTarget[i] as UserAccount).getEmail())
                    await this._sender.sendPreparedMail(
                        (pTarget[i] as UserAccount).getEmail(),
                        this._builder.notifyMatch(
                            pSender,
                            pTarget[i] as UserAccount,
                            {
                                os: pProject.os,
                                app: pProject.meta.name,
                                package: pProject.getPackageName(),
                                version: pProject.meta.versionName,
                                findings: pFindings

                        })
                    );
                }
            }else{
                mails.push(pTarget[i] as string);
            }
        }

    }
}