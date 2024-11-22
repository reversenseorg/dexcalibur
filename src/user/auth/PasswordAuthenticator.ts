import {UserAccount} from "../UserAccount.js";
import {AuthCode, AuthenticationException, Authenticator} from "./AuthTypes.js";
import {AuthenticationService} from "./AuthenticationService.js";
import * as Log from "../../Logger.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {OrganizationUnit, OrganizationUnitUUID} from "../../organization/OrganizationUnit.js";
import AccessControl from "../acl/AccessControl.js";
import {OrganizationAccessControl} from "../acl/rbac/OrganizationAccessContol.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export class AuthenticationResult {
    _code:AuthCode = AuthCode.NONE;
    _success: boolean = false;
    _account: UserAccount = null;

    constructor( pSuccess:boolean, pAcc:UserAccount = null, pCode:AuthCode = AuthCode.NONE){
        this._success = pSuccess;
        this._account = pAcc;
        this._code = pCode;
    }

    static successful( pAcc:UserAccount):AuthenticationResult{
        return new AuthenticationResult( true, pAcc);
    }

    static failure( pCode:AuthCode, pAcc:UserAccount):AuthenticationResult{

        // TODO : if activated by authentication policy, on failure, increment delay between requets and response to prevent bruteforce
        // TODO : if activated by authentication policy, the user account is locked after X attempts

        return new AuthenticationResult( false, null, pCode);
    }

    static isSuccess( pResult:AuthenticationResult):boolean {
        return (pResult._success === true);
    }

    getCode():AuthCode {
        return this._code;
    }

    getAccount():UserAccount {
        return this._account;
    }
}


/**
 * The purpose of password authenticator is to perform password-based authentication
 * for a specified a user account
 *
 * @class
 */
export class PasswordAuthenticator implements Authenticator{

    /**
     * Authentication service
     *
     * @field
     */
    svc: AuthenticationService;


    constructor( pAuthSvc:AuthenticationService) {
        this.svc = pAuthSvc;
    }

    /**
     * To verify password
     *
     * @param pAccount
     * @param pPwd
     */
    verifyPassword( pAccount:UserAccount, pPwd:string){
        if(pPwd==null || pPwd.length==0 || typeof pPwd !== 'string'){
            throw new AuthenticationException("Invalid password : password cannot be empty", AuthCode.EMPTY_PASSWORD);
        }

        if(pAccount.isLocked()){
            throw new AuthenticationException("Account is locked", AuthCode.ACCOUNT_LOCKED);
        }

        pAccount.passwordEquals(pPwd);
    }


    /**
     * To do authentication
     *
     * This method must catch any exception caused by authentication failure,
     * and return AuthenticationResult object
     *
     * @param {string} pUsername Username
     * @param {string} pPwd User password
     */
    async doAuthentication( pUsername:string, pPwd:string, pOrgUUID?:Nullable<OrganizationUnitUUID>):Promise<AuthenticationResult> {
        let res:AuthenticationResult;
        let account:UserAccount = null;

        try{

            if(pUsername==null || pUsername.length==0 || typeof pUsername !== 'string' || /^[\s\t]*$/.test(pUsername)){
                throw new AuthenticationException("Invalid username", AuthCode.EMPTY_USERNAME);
            }


            account = await this.svc.getUserService()
                .find(new UserAccount({_username:pUsername}),{autoCreate:false});


            if(account==null){
                throw new AuthenticationException("Invalid username", AuthCode.INVALID_USERNAME);
            }

            Logger.info("[AUTH] Retrieve user by name ("+pUsername+") = "+account.getUID());
            this.verifyPassword( account, pPwd);


            Logger.info("[AUTH] User ("+pUsername+") authenticated ");


            // if the authenticator is trigged from a form bound to an organization
            // the authentication includes a check of membership
            if(pOrgUUID!=null){
                try{
                    const org = await this.svc.getUserService()._ctx.getOrgManager().getOrganization(
                        account, pOrgUUID
                    );
                    AccessControl.isAuthorizedByAttr(
                        OrganizationAccessControl.attr.ORG_MEMBER,
                        org,
                        account
                    );
                }catch (e){
                    // if the user is not a member of target org, then check if the user has a role
                    // with server admin permissions
                    try{
                        AccessControl.isAuthorized(
                            AccessControl.access.SRV_INSTANCE_MGT,
                            account
                        );
                    }catch (ee){
                        throw e;
                    }
                }
            }

            // create session token

            res = AuthenticationResult.successful( account);
        }catch(err){
            Logger.error("Authentication failed. Cause : "+err.message);
            res = AuthenticationResult.failure( err.getCode(), account);
        }finally {
            // TODO : clean password from memory
            return res;
        }
    }
}