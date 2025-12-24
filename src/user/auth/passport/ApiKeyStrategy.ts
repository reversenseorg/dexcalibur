
import * as passport from "passport";
import {RuntimeSecurityException} from "../../../errors/RuntimeSecurityException.js";
import {PasswordFormContext} from "../AuthenticationService.js";
import * as Log from "../../../Logger.js";
import {UserAccount} from "../../UserAccount.js";
import {SessionException} from "../../session/SessionException.js";
import {UserSession} from "../../session/UserSession.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

type VerifyFn = (vReqOrName:any, vNameOrPwd:string,vPasswdOrDoneCb:any,vDoneCb?:any)=>any;

export const DEFAULT_HEADER_API_KEY = 'dxc-api-key';
export const DEFAULT_HEADER_API_OID = 'dxc-api-oid';
export const DEFAULT_HEADER_API_UUID = 'dxc-api-uuid';
export const DEFAULT_HEADER_API_SID = 'dxc-api-sid';

export interface ApiKeyStrategyOptions {
    apiKeyHeader: { header: string, prefix: string },
    apiOidHeader:string,
    apiUuidHeader:string,
    apiSidHeader:string,
    passReqToCallback: boolean
}

export class ApiKeyStrategy extends passport.Strategy {

    apiKeyHeader: { header: string, prefix: string };
    apiOidHeader:string;

    name:string = "apikey";

    private _verifyFn:VerifyFn;

    /**
     * A callback where HTTP request will be forwarded
     * @private
     */
    private _callback:any;

    private _opts:ApiKeyStrategyOptions;

    constructor( pOptions:ApiKeyStrategyOptions, pVerify:VerifyFn) {
        super();

        this._opts = pOptions;
        if (typeof pOptions == 'function') {
            this._verifyFn = pOptions;
            this._opts = {
                apiKeyHeader: { header: DEFAULT_HEADER_API_KEY, prefix: '' },
                apiOidHeader: DEFAULT_HEADER_API_OID,
                apiUuidHeader: DEFAULT_HEADER_API_UUID,
                apiSidHeader: DEFAULT_HEADER_API_SID,
                passReqToCallback: false
            };
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
        this.name = 'apikey';
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
            console.log((vReq as any).headers);


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


            this._verifyFn(
                vReq,
                vReq.dxcApiUuid,
                vReq.dxcApiKey,
                verifiedFn
            );


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