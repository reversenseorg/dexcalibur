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