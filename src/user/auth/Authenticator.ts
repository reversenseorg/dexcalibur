import {UserAccount} from "../UserAccount";
import {AuthCode, AuthenticationException, Authenticator} from "./AuthTypes";
import {AuthenticationService} from "./AuthenticationService";
import * as Log from "../../Logger";


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



export class PasswordAuthenticator implements Authenticator{

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
    doAuthentication( pUsername:string, pPwd:string):AuthenticationResult {
        let res:AuthenticationResult;
        let acc:UserAccount = null;

        try{
            acc = this.svc.findUser(pUsername);

            Logger.info("[AUTH] Retrieve user by name ("+pUsername+") = "+JSON.stringify(acc));
            this.verifyPassword( acc, pPwd);


            Logger.info("[AUTH] User ("+pUsername+") authenticated ");

            // create session token

            res = AuthenticationResult.successful( acc);
        }catch(err){
            Logger.error("Authentication failed. Cause : "+err.message);
            res = AuthenticationResult.failure( err.getCode(), acc);
        }finally {
            // TODO : clean password from memory
            return res;
        }
    }
}