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

import {Email} from "../core/email/Email.js";
import {OrganizationManager} from "./OrganizationManager.js";
import {UserAccount} from "../user/UserAccount.js";
import {Nullable} from "@reversense/dxc-core-api";
import {OrganizationUnit} from "./OrganizationUnit.js";
import * as _fs_ from "fs";
import * as _path_ from "path";
import Util from "../Utils.js";

export class OrganizationEmailBuilder {

    private _ctx:OrganizationManager;

    constructor(pContext:OrganizationManager) {
        this._ctx = pContext;
    }


    /**
     * To build the content of activation email
     * @param pUserAccount
     * @param pToken
     * @param pTokenLifetime
     * @param pOrg
     */
    buildActivationEmail(pUserAccount:UserAccount, pToken:string, pTokenLifetime:number, pOrg:Nullable<OrganizationUnit>):Email {

        const link = `${process.env.DXC_SCHEMA!=null?process.env.DXC_SCHEMA:'http'}://${process.env.DXC_HOSTNAME!=null?process.env.DXC_HOSTNAME:'127.0.0.1:8080'}/activate/account/?token=${encodeURIComponent(pToken)}`;
        let expire:string = (pTokenLifetime>=3600)? (pTokenLifetime/3600)+" hours" : (pTokenLifetime/60)+" minutes" ;

        return new Email({
            subject: 'Activate your Reversense account',
            raw: `

Hi ${pUserAccount.username},

Thank you for signing up for Reversense. Click on the link below to verify your email:

${link}

This link will expire in ${expire}.

Best,

The Reversense Team
            `,
            html: _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),'..','..','assets','emails',
                    'activate_account.tpl.html'
                )).toString()
                    .replaceAll('%%_ACTIVATION_LINK_%%',link)
                    .replaceAll('%%_EXPIRE_%%',expire)
        })
    }


    /**
     * To build the content of activation email
     * @param pUserAccount
     * @param pToken
     * @param pTokenLifetime
     * @param pOrg
     */
    buildResetPasswordEmail(pUserAccount:UserAccount, pToken:string, pTokenLifetime:number, pOrg:Nullable<OrganizationUnit>):Email {

        const link = `${process.env.DXC_SCHEMA!=null?process.env.DXC_SCHEMA:'http'}://${process.env.DXC_HOSTNAME!=null?process.env.DXC_HOSTNAME:'127.0.0.1:8080'}/reset/account/?token=${encodeURIComponent(pToken)}`;
        let expire:string = (pTokenLifetime>=3600)? (pTokenLifetime/3600)+" hours" : (pTokenLifetime/60)+" minutes" ;

        return new Email({
            subject: 'Reset your Reversense password',
            raw: `

Hi ${pUserAccount.username},

We received a request to reset your password. Click the button below and you’ll be on your way.

${link}

This link will expire in ${expire}.

If you have received this message by mistake, ignore this email. 
If you think someone else is using your account without your consent, please contact us.

Best,

The Reversense Team
            `,
            html: _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),'..','..','assets','emails',
                    'reset_password.tpl.html'
                )).toString()
                .replaceAll('%%_ACTIVATION_LINK_%%',link)
                .replaceAll('%%_EXPIRE_%%',expire)
        })
    }



    /**
     * To build the content of activation email
     * @param pUserAccount
     * @param pToken
     * @param pTokenLifetime
     * @param pOrg
     */
    static buildPasswordlessAuthEmail(pUserAccount:UserAccount, pLink:string, pTokenLifetime:number, pIssuerIp:string = ""):Email {

        let expire:string = new Date( (new Date()).getTime()  + (pTokenLifetime*1000)).toUTCString()

        return new Email({
            subject: 'Passwordless authentication',
            raw: `

Hello ${pUserAccount.username},

You asked for a passwordless authentication (requested from %%_ISSUER_IP_%%).
To authenticate yourself you will need to click on the link below before %%_EXPIRE_DATE_%%.

${pLink}

This link will expire in ${expire}.

If you have received this message by mistake, ignore this email. 
If you think someone else is using your account without your consent, please contact us.

Best,

The Reversense Team
            `,
            html: _fs_.readFileSync(
                _path_.join(
                    Util.__dirname(import.meta.url),'..','..','assets','emails',
                    'passwordless_auth.tpl.html'
                )).toString()
                .replaceAll('%%_AUTH_LINK_%%',pLink)
                .replaceAll('%%_EXPIRE_DATE_%%',expire)
                .replaceAll('%%_ISSUER_IP_%%',pIssuerIp)
        })
    }
}