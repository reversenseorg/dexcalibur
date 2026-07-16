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

import {UserAccount} from "../UserAccount.js";
import {AuthCode, AuthenticationException, Authenticator} from "./AuthTypes.js";
import {AuthenticationService} from "./AuthenticationService.js";
import * as Log from "../../Logger.js";
import {Nullable} from "@reversense/dxc-core-api";
import {OrganizationUnit, OrganizationUnitUUID} from "../../organization/OrganizationUnit.js";
import AccessControl from "../acl/AccessControl.js";
import {OrganizationAccessControl} from "../acl/rbac/OrganizationAccessContol.js";
import {AuthenticationResult} from "./PasswordAuthenticator.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * The purpose of password authenticator is to perform password-based authentication
 * for a specified a user account
 *
 * @class
 */
export class PasswordlessAuthenticator implements Authenticator{

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
     * To do authentication
     *
     * This method must catch any exception caused by authentication failure,
     * and return AuthenticationResult object
     *
     * @param {string} pUsername Username
     * @param {string} pPwd User password
     */
    async doAuthentication( pUsername:string, pToken:string,  pOrgUUID?:Nullable<OrganizationUnitUUID>):Promise<AuthenticationResult> {
        let res:AuthenticationResult;
        let account:UserAccount = null;

        try{
            // Throw error is pUsername has invalid format or if there isnot account found
            account = await this.svc.getUserService()
                .findByUsername(new UserAccount({_username:pUsername}),{autoCreate:false});

            Logger.info("[AUTH] Retrieve user by name ("+pUsername+") = "+account.getUID());
            await this.svc.verifyToken(account, pToken);


            Logger.info("[AUTH] User ("+pUsername+") authenticated by token (passwordless)");


            // if the authenticator is trigged from a form bound to an organization
            // the authentication includes a check of membership
            if(pOrgUUID!=null){
                try{
                    const org = await this.svc.getUserService()._ctx.getOrgManager().getOrganization(
                        account, pOrgUUID
                    );
                    AccessControl.isAuthorizedByAttr(
                        OrganizationAccessControl.attr.MEMBER_GRP,
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
            Logger.error("Authentication failed (passwordless). Cause : "+err.message);
            res = AuthenticationResult.failure( err.getCode(), account);
        }finally {
            // TODO : clean password from memory
            return res;
        }
    }
}