import {UserAccount} from "../UserAccount";
import {AuthenticationException, Authenticator} from "./AuthTypes";
import {AuthenticationService} from "./AuthenticationService";
import {AuthenticationPolicy} from "./AuthenticationPolicy";
import * as Log from "../../Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class AuthenticationResult {
    _success: boolean = false;
    _account: UserAccount = null;

    constructor( pSuccess:boolean, pAcc:UserAccount = null){
        this._success = pSuccess;
        this._account = pAcc;
    }

    static successful( pAcc:UserAccount):AuthenticationResult{
        return new AuthenticationResult( true, pAcc);
    }

    static failure( pAcc:UserAccount):AuthenticationResult{

        // TODO : if activated by authentication policy, on failure, increment delay between requets and response to prevent bruteforce
        // TODO : if activated by authentication policy, the user account is locked after X attempts

        return new AuthenticationResult( false);
    }

    static isSuccess( pResult:AuthenticationResult):boolean {
        return (pResult._success === true);
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
            throw new AuthenticationException("Invalid password : password cannot be empty");
        }

        if(pAccount.isLocked()){
            throw new AuthenticationException("Account is locked");
        }

        pAccount.passwordEquals(pPwd);
    }


    doAuthentication( pUsername:string, pPwd:string):AuthenticationResult {
        let res:AuthenticationResult;
        let acc:UserAccount = null;

        try{
            acc = this.svc.findUser(pUsername);

            this.verifyPassword( acc, pPwd);

            // create session token

            res = AuthenticationResult.successful( acc);
        }catch(err){
            Logger.error("Authentication failed. Cause : "+err.message);
            res = AuthenticationResult.failure( acc);
        }finally {
            // TODO : clean password from memory
            return res;
        }
    }
}