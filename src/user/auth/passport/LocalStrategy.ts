
import * as passport from "passport";
import {RuntimeSecurityException} from "../../../errors/RuntimeSecurityException.js";
import {PasswordFormContext} from "../AuthenticationService.js";
import * as Log from "../../../Logger.js";
import {UserAccount} from "../../UserAccount.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

type VerifyFn = (vReqOrName:any, vNameOrPwd:string,vPasswdOrDoneCb:any,vDoneCb?:any)=>any;

export class LocalStrategy extends passport.Strategy {

    name:string = "local";

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
            if((vReq as any).session==null || (vReq as any).session.forms==null){
                throw RuntimeSecurityException.BROKEN_LOGIN_WORKFLOW();
            }

            const formCtx = (vReq as any).session.forms[vReq.params['antiReplayID']] as PasswordFormContext;

            delete (vReq as any).session.forms[vReq.params['antiReplayID']];

            // check anti-replay token
            if(formCtx==null){
                throw RuntimeSecurityException.AUTH_REPLAY_DETECTED(/^[a-f0-9-]+$/.test(vReq.params['antiReplayID'])?vReq.params['antiReplayID']:"...");
            }


            // check CSRF token
            const csrfToken = (vReq as any).body[formCtx.csrfField];
            if(csrfToken==null){
                throw RuntimeSecurityException.CSRF_TOKEN_IS_EMPTY("/auth/login/...");
            }
            if(csrfToken!==formCtx.csrfToken){
                throw RuntimeSecurityException.CSRF_TOKEN_IS_WRONG("/auth/login/...");
            }

            let verifiedFn = (vErr:any, vUser:UserAccount, vAuthRes:any)=>{
                if(vUser!=null){
                    // @ts-ignore
                    this.success(vUser);
                }else{
                    // @ts-ignore
                    this.error(vErr);
                }
            }

            if(this._opts.passReqToCallback){
                this._verifyFn(
                    vReq,
                    (vReq as any).body[formCtx.usernameField],
                    (vReq as any).body[formCtx.pwdField],
                    verifiedFn
                );
            }else{
                this._verifyFn(
                    (vReq as any).body[formCtx.usernameField],
                    (vReq as any).body[formCtx.pwdField],
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