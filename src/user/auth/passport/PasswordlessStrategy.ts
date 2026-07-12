
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

import * as passport from "passport";
import {RuntimeSecurityException} from "../../../errors/RuntimeSecurityException.js";
import {PasswordFormContext} from "../AuthenticationService.js";
import * as Log from "../../../Logger.js";
import {UserAccount} from "../../UserAccount.js";
import {SessionException} from "../../session/SessionException.js";
import {UserSession} from "../../session/UserSession.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

type VerifyFn = (vReqOrName:any, vNameOrPwd:string,vPasswdOrDoneCb:any,vDoneCb?:any)=>any;

export class PasswordlessStrategy extends passport.Strategy {

    name:string = "passwordless";

    private _verifyFn:VerifyFn;

    /**
     * A callback where HTTP request will be forwarded
     * @private
     */
    private _callback:any;

    private _opts:any={};

    constructor( pOptions:any, pVerify:VerifyFn) {
        super();

        this._opts = pOptions;
        if (typeof pOptions == 'function') {
            this._verifyFn = pOptions;
            this._opts = {};
        }

        this._verifyFn = pVerify;

        if (!this._verifyFn) {
            throw new Error('Verify method is required.');
        }

        /** The name of the strategy, which is set to `'local'`.
         *
         * @type {string}
         * @readonly
         */
        this.name = 'local';
        this._callback = this._opts.passReqToCallback;
    }


    /**
     *
     * @param vReq
     * @param vOptions
     */
    authenticate(vReq: any, vOptions: any = {}): any {

        const opts = vOptions;

        // retrieve form context from sessions

        Logger.info(` [AUTH SERVICE][Passport][strategy=${this.name}][path=${vReq.path}][ip=${vReq.ip}] Authenticate `);

        try{
            if((vReq as any).session==null){
                throw SessionException.INVALID_SESSION();
            }

            const sessForms = ((vReq as any).session as UserSession).getData('forms');
            const antireplay = vReq.query.ar;


            if(sessForms==null || antireplay==null){
                throw RuntimeSecurityException.BROKEN_LOGIN_WORKFLOW();
            }

            const formCtx = sessForms[antireplay] as PasswordFormContext;

            delete sessForms[antireplay];
            ((vReq as any).session as UserSession).addData('forms', sessForms);

            // check anti-replay token
            if(formCtx==null){
                throw RuntimeSecurityException.AUTH_REPLAY_DETECTED(/^[a-f0-9-]+$/.test(vReq.params['antiReplayID'])?vReq.params['antiReplayID']:"...");
            }


            let verifiedFn = (vErr:any, vUser:UserAccount, vAuthRes:any)=>{
                if(vUser!=null){
                    ((vReq as any).session as UserSession).setUserAccount(vUser);
                    ((vReq as any).session as UserSession).passport.user = vUser;
                    ((vReq as any).session as UserSession).save((err)=>{
                        if(err==null){
                            // @ts-ignore
                            this.success(vUser);
                        }else{
                            // @ts-ignore
                            this.error(vErr);
                        }
                    })
                }else{
                    // @ts-ignore
                    this.error(vErr);
                }
            }

            const username = ((vReq as any).session as UserSession).getData('username');

            if(this._opts.passReqToCallback){
                this._verifyFn(
                    vReq,username,
                    null,
                    verifiedFn
                );
            }else{
                this._verifyFn(username,
                    null,
                    verifiedFn
                );
            }


            // perform authentication
            /*const authRes = await this.newPasswordAuthenticator().doAuthentication(
                (vReq as any).body[formCtx.usernameField],
                (vReq as any).body[formCtx.pwdField]
            );*/

            return;
        }catch (err){
            Logger.error(err.message,err.stack);

            // @ts-ignore
            this.fail();
            return;
        }
    }
}