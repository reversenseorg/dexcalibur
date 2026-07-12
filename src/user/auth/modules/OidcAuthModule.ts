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

import {AuthModule, AuthModuleOptions, AuthModuleType} from "../AuthModule.js";
import {SecurityZone} from "../../../security/SecurityZone.js";
import {Issuer} from "openid-client";
import {AuthenticationSettings} from "../AuthenticationSettings.js";
import {OrganizationUnit} from "../../../organization/OrganizationUnit.js";

export interface OidcAuthModuleOptions extends AuthModuleOptions {
    discoverUri?:string;
    clientId?:string;
    serviceSecret?: string;
    mapping?:Record<string, string>;
}

export class OidcAuthModule extends AuthModule {

    discoverUri:string;
    clientId:string;
    serviceSecret: string;



    mapping:Record<string, string> = {};

    constructor(pOptions: OidcAuthModuleOptions) {
        super({
            ...pOptions,
            type: AuthModuleType.OIDC
        });

        this.discoverUri = pOptions.discoverUri!;
        this.clientId = pOptions.clientId!;
        this.serviceSecret = pOptions.serviceSecret!;
        this.mapping = (pOptions.mapping!=null ? pOptions.mapping : {});
    }

    getDiscoverUri():string{
        return this.discoverUri;
    }

    getClientID():string{
        return this.clientId;
    }

    getClientSecret():string{
        return this.serviceSecret;
    }

    getCallbackURL(pBase:string, pOrg:OrganizationUnit):string {
        return pBase+'/'+pOrg.getUID()+'/'+this.getUID();
    }

    addMapping(pIdpPpt:string, pLocalPpt:string):void {
        if(this.mapping==null){
            this.mapping[pIdpPpt] = pLocalPpt;
        }
    }

    async testConnection(pAuthSettings:AuthenticationSettings):Promise<boolean> {

        try {
            const issuer = await Issuer.discover(this.discoverUri);

            //Logger.debugRAW(issuer);
            const _oidClientCfg = {
                issuer: issuer,
                settings: {
                    discoverUri: this.discoverUri,
                    client_id: this.clientId,
                    client_secret: this.serviceSecret,
                    redirect_uris: pAuthSettings.getOidcRedirectUris(),
                    post_logout_redirect_uris: pAuthSettings.getOidcLogoutUris(),
                    response_types: pAuthSettings.getOidcResponseType()
                },
                extra: {
                    authorizationURL: issuer.authorization_endpoint,
                    tokenURL: issuer.token_endpoint,
                    userInfoURL: issuer.userinfo_endpoint
                }
            };

            return (issuer!=null)
                && (_oidClientCfg.extra.authorizationURL!=null)
                && (_oidClientCfg.extra.tokenURL!=null)
                && (_oidClientCfg.extra.userInfoURL!=null);

        }catch(err){
            console.log(err.message,err.stack);
            return false;
        }
    }

    toJsonObject(pZone: SecurityZone = SecurityZone.PUBLIC): any {
        let o = super.toJsonObject(pZone);
        o.discoverUri = this.discoverUri;
        o.clientId = this.clientId;
        o.serviceSecret = this.serviceSecret;
        return o;
    }
}