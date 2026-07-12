/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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