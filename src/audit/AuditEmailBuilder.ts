import DexcaliburProject from "../DexcaliburProject.js";
import DexcaliburEngine from "../DexcaliburEngine.js";
import {OrganizationEmailBuilder} from "../organization/OrganizationEmailBuilder.js";
import {UserAccount} from "../user/UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationUnit} from "../organization/OrganizationUnit.js";
import {Email} from "../core/email/Email.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../Utils.js";

export class AuditEmailBuilder{
    constructor() {

    }




    /**
     * To build the content of activation email
     * @param pUserAccount
     * @param pToken
     * @param pTokenLifetime
     * @param pOrg
     */
    notifyMatch(pUserAccount:UserAccount, pSender:UserAccount,  pInfo:any):Email {

        let htmlBody = _fs_.readFileSync(
            _path_.join(
                Util.__dirname(import.meta.url),'..','..','assets','emails',
                'notify_findings.tpl.html'
            )).toString();

        const tokens = {
            '%%_DEST_USERNAME_%%': pUserAccount.username,
            '%%_SENDER_USERNAME_%%': pSender.username,
            '%%_OS_%%': pInfo.os,
            '%%_APP_%%': pInfo.app,
            '%%_PKG_%%': pInfo.package,
            '%%_VER_%%': pInfo.version,
            '%%_OBJ_%%': pInfo.obj,
            '%%_REPORT_LNK_%%': pInfo.reportUri,
            '%%_OBJ_LINK_%%': pInfo.objUri
        };

        for(let k in tokens) {
            while(htmlBody.indexOf(k)>-1){
                htmlBody = htmlBody.replace(k, tokens[k]);
            }
        }

        return new Email({
            subject: `Reversense [${pInfo.package}] : You have been notified`,
            raw: `
            
Hi ${pUserAccount.username},

${pSender.person.firstname} invite you to investigate the finding(s) below. You need to have an account to access to results.

Application :  ${pInfo.app} (v ${pInfo.version} )
Operating System : ${pInfo.os}
Report: ${pInfo.reportUri}
Object: ${pInfo.obj}

Show notification : ${pInfo.objUri}

Best,

The Reversense Team
            `,
            html: htmlBody
        });
    }

}