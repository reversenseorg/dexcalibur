import * as _net_ from "net";
import {AuthModule, AuthModuleOptions, AuthModuleType} from "../AuthModule.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {AuthenticationSettings} from "../AuthenticationSettings.js";
import {OrganizationManagerException} from "../../../errors/OrganizationManagerException.js";
import {Application, Router} from "express";
import {OrganizationUnit, OrganizationUnitUUID} from "../../../organization/OrganizationUnit.js";
import {Nullable} from "../../../core/IStringIndex.js";
import {LoadedAuthModule} from "./LoadedAuthModule.js";
import {LocalStrategy} from "../passport/LocalStrategy.js";
import {AuthenticationResult} from "../PasswordAuthenticator.js";
import {UserSession} from "../../session/UserSession.js";
import passport from "passport";
import {AuthenticationService, PasswordFormContext} from "../AuthenticationService.js";
import * as Log from "../../../Logger.js";
import {UserAccount, UserAccountUUID} from "../../UserAccount.js";
import * as _bodyparser_ from "body-parser";
import {SessionException} from "../../session/SessionException.js";
import {RuntimeSecurityException} from "../../../errors/RuntimeSecurityException.js";
import {TokenPurpose} from "../../../core/secrets/Token.js";
import {UserServiceException} from "../../../errors/UserServiceException.js";
import {SEND_ERROR_RESPONSE} from "../../../WebServer.js";
import {PasswordlessStrategy} from "../passport/PasswordlessStrategy.js";

const BodyParser = (_bodyparser_ as any).default;
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface PasswordlessAuthModuleOptions extends AuthModuleOptions {
    authorizedIPs?:string[];
    authorizedCIDR?:string[];
    banned?: string[];
    ttl?:number;
}

export class PasswordlessAuthModule extends AuthModule {

    static DEFAULT_TTL = 60*15;

    private _block:_net_.BlockList = new _net_.BlockList();

    authorizedIPs:string[] = [];

    authorizedCIDR:string[] = [];

    banned: string[] = [];

    ttl: number = PasswordlessAuthModule.DEFAULT_TTL;

    constructor(pOptions: PasswordlessAuthModuleOptions) {
        super({
            ...pOptions,
            type: AuthModuleType.PASSWORDLESS
        });

        this.authorizedIPs = (pOptions.authorizedIPs!=null ? pOptions.authorizedIPs : []);
        this.authorizedCIDR = (pOptions.authorizedCIDR!=null ? pOptions.authorizedCIDR : []);
        this.banned = (pOptions.banned!=null ? pOptions.banned : []);
        this.ttl = (pOptions.ttl!=null ? pOptions.ttl : PasswordlessAuthModule.DEFAULT_TTL);

        this.updateBlock();
    }

    update(pOptions: PasswordlessAuthModuleOptions | PasswordlessAuthModule) {
        super.update(pOptions);

        this.authorizedIPs = (pOptions.authorizedIPs!=null ? pOptions.authorizedIPs : []);
        this.authorizedCIDR = (pOptions.authorizedCIDR!=null ? pOptions.authorizedCIDR : []);
        this.banned = (pOptions.banned!=null ? pOptions.banned : []);

        this.updateBlock();
    }

    updateBlock() {
        const newBlock = new _net_.BlockList();
        this.authorizedIPs.map(x => {
            try{
                newBlock.addAddress(x.trim(), (x.indexOf(':')>-1?"ipv6":"ipv4"));
            }catch (err){
                throw OrganizationManagerException.INVALID_IP_ADDRESS(x);
            }
        });
        this.authorizedCIDR.map(x => {
            try{
                const o = x.trim().split('/');
                newBlock.addSubnet(o[0],parseInt(o[1],10));
            }catch (err){
                throw OrganizationManagerException.INVALID_CIDR_ADDRESS(x);
            }

        });
        this._block = newBlock;
    }

    getAuthorizedIps():string[]{
        return this.authorizedIPs;
    }

    getAuthorizedCIDR():string[]{
        return this.authorizedCIDR;
    }

    getBannedIPs():string[]{
        return this.banned;
    }

    getTTL():number{
        return this.ttl;
    }

    isIpAuthorized(pIncomingIP:string):boolean{
        return this._block.check(pIncomingIP);
    }

    addAuthorizedIP( pIpAddress:string ):void {
        this.authorizedIPs.push(pIpAddress);
    }

    addAuthorizedCIDR( pCIDR:string ):void {
        this.authorizedCIDR.push(pCIDR);
    }


    async testConnection(pAuthSettings:AuthenticationSettings):Promise<boolean> {
        return true;
    }

    /**
     * To validate form and update session
     *
     * @param pReq
     * @param pRes
     * @param pNext
     * @private
     */
    private _readUsernameFromForm(pReq:any,pRes:any,pNext:any):{username:string, antiReplayID:string } {

        if((pReq as any).session==null){
            throw SessionException.INVALID_SESSION();
        }

        const sessForms = ((pReq as any).session as UserSession).getData('forms');

        if(sessForms==null){
            throw RuntimeSecurityException.BROKEN_LOGIN_WORKFLOW();
        }

        // don't remove antiReplayID, it ll be use during step2 to retrieve username from session
        const formCtx = sessForms[pReq.params['antiReplayID']] as PasswordFormContext;

        ((pReq as any).session as UserSession).addData('forms', sessForms);

        // check anti-replay token
        if(formCtx==null){
            throw RuntimeSecurityException.AUTH_REPLAY_DETECTED(/^[a-f0-9-]+$/.test(
                pReq.params['antiReplayID'])?pReq.params['antiReplayID']:"...");
        }

        // check CSRF token
        const csrfToken = (pReq as any).body[formCtx.csrfField];
        if(csrfToken==null){
            throw RuntimeSecurityException.CSRF_TOKEN_IS_EMPTY("/auth/login/...");
        }
        if(csrfToken!==formCtx.csrfToken){
            throw RuntimeSecurityException.CSRF_TOKEN_IS_WRONG("/auth/login/...");
        }


        ((pReq as any).session as UserSession).addData('username', (pReq as any).body[formCtx.usernameField]);

        return {
            username: (pReq as any).body[formCtx.usernameField],
            antiReplayID: pReq.params['antiReplayID']
        };
    }


    /**
     * To check account eligibility and return verified email
     *
     * @param pAccount
     */
    checkAccountEligible(pAccount:UserAccount):string {

        let email = pAccount.getEmail();
        if(!UserAccount.VALIDATE._email.test(email)){
            email = pAccount.username;
            if(!UserAccount.VALIDATE._email.test(email)){
                throw UserServiceException.ACCOUNT_NOT_ELIGIBLE_PWDL(pAccount.getUID(), "no email address available");
            }
        }

        return email;
    }


    /**
     * To process form submission, generate token and send link
     *
     * @param pReq
     * @param pRes
     * @param pNext
     */
    async processStep1(pAuthSvc:AuthenticationService, pOrg:OrganizationUnitUUID, pDestURI:string, pReq:any,pRes:any,pNext:any):Promise<void> {

        // validate form and retrieve username
        const usernameSess = this._readUsernameFromForm(pReq,pRes,pNext);

        // find user account (include validate username format and account not found)
        const account = await pAuthSvc.getUserService().findByUsername(
            new UserAccount({ _username: usernameSess.username}),{autoCreate:false});

        // check if user account is eligible to passwordless authentication
        const verifiedEmail = this.checkAccountEligible(account);

        // generate token, update and save account
        const token = await pAuthSvc.getUserService().createAccountToken(account, {
            purpose: TokenPurpose.ACCOUNT_PWDL_AUTH,
            ttl: this.ttl,
            token: null
        });

        // send email
        await pAuthSvc.sendPasswordlessAuthMail(account, verifiedEmail, pOrg, token, this.ttl, usernameSess.antiReplayID);

        // redirect to message
        pRes.status(200).redirect(pDestURI);
    }

    /**
     * Setup local authentication, and authentication endpoint
     *
     * @param pApp
     * @param pCfg
     * @private
     */
    setupAuthStrategy(pAuthSvc:AuthenticationService, pApp:Application|Router, pBasePath:string, pOrg:OrganizationUnit, pState:Nullable<LoadedAuthModule> = null):LoadedAuthModule {

        let state = pState;

        if(state==null){
            state = new LoadedAuthModule(this,pOrg);
            state.updateGateEndpoint(pAuthSvc._getOrgAuthEndpointRoute(pOrg)+"/pwdl");
            state.updateGateFailure(pAuthSvc._getOrgAuthLongLoginRoute(pBasePath,pOrg));
            state.updateGateSuccess(pAuthSvc._getOrgHomeLongRoute(pBasePath,pOrg));
        }else {
            // trigger update
        }


        const str = new PasswordlessStrategy(
            {
                passReqToCallback: true
            },
            (vReq, vUsername:string, vPasswd:string, vVerifiedCB:any)=> {

                // IMPORTANT : vPasswd IS ALWAYS EMPTY HERE
                let incomingToken = vReq.query.token;
                if(incomingToken==null || (typeof incomingToken!=='string')){
                    throw UserServiceException.INVALID_TOKEN("Missing token (passwordless)");
                }

                ((pAuthSvc.newPasswordlessAuthenticator()
                    .doAuthentication(vUsername,decodeURIComponent(incomingToken),pOrg.getUID()))  as Promise<AuthenticationResult>)
                    .then((vAuthRes)=>{
                        if(vAuthRes._success){
                            (vReq.session as UserSession).setUserAccount(vAuthRes.getAccount());
                            (vReq.session as UserSession).passport.user = vAuthRes.getAccount();
                            (vReq.session as UserSession).addData('org',pOrg.getUID());
                            (vReq.session as UserSession).save(()=>{
                                vVerifiedCB.apply(null, [null, vAuthRes.getAccount(), vAuthRes]);
                            });
                            //vVerifiedCB.apply(null, [null, vRes.getAccount(), vRes]);
                        }else{
                            vVerifiedCB.apply(null, [null, null, vAuthRes]);
                        }
                    },(err)=>{
                        vVerifiedCB.apply(null, [err, null, null]);
                    }).catch((err)=>{
                    vVerifiedCB.apply(null, [err, null, null]);
                })
            }
        );
        passport.use(state.getUUID(), str);

        // PROCESS AUTH FORM (Step 1) ENDPOINT
        (pApp as Application).post(
            state.getAuthEndpoint(),
            BodyParser.urlencoded({ extended: false }),
            (vReq, vRep, vNext):void=>{
                (async ()=>{
                    try{
                        await this.processStep1(
                            pAuthSvc,
                            pOrg.getUID(),
                            pAuthSvc._getOrgAuthShortLoginRoute(pBasePath,pOrg)+"?err=pwdl_check_mailbox",
                            vReq,
                            vRep,
                            vNext);
                    }catch(e){
                        // redirect to message
                        vRep.status(200)
                            .redirect(
                                pAuthSvc._getOrgAuthShortLoginRoute(pBasePath,pOrg)+"?err=noteligible"
                            );
                    }
                })();
            }
        );

        // PROCESS TOKEN (Step 2) ENDPOINT
        (pApp as Application).get(
            pAuthSvc._getOrgAuthVerifyRoute(pOrg),
            passport.authenticate(state.getUUID(), {
                successMessage: true,
                failureMessage:true,
                failureRedirect: state.getFailureEndpoint(),
                successReturnToOrRedirect: state.getSuccessEndpoint(),
            })
        );

        Logger.info(`[AUTH SERVICE][org=${pOrg.getUID()}][mod=${this.getUID()}] Serve local auth over ${state.getAuthEndpoint()}`);

        return state;
    }

    /**
     *
     * @param pAccount
     * @param pOrg
     */
    generateToken(pAccount:UserAccountUUID, pOrg:OrganizationUnitUUID):string {
        return "";
    }

    toJsonObject(pZone: SecurityZone = SecurityZone.PUBLIC): any {
        let o = super.toJsonObject(pZone);
        o.authorizedCIDR = this.authorizedCIDR;
        o.authorizedIPs = this.authorizedIPs;
        o.banned = this.banned;
        o.ttl = this.ttl;
        return o;
    }
}