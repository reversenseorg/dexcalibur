import {AuthModule, AuthModuleOptions, AuthModuleType} from "./AuthModule.js";
import {OrganizationManagerException} from "../../errors/OrganizationManagerException.js";
import {OidcAuthModule} from "./modules/OidcAuthModule.js";
import {LocalAuthModule} from "./modules/LocalAuthModule.js";
import {ApikeyAuthModule} from "./modules/ApikeyAuthModule.js";
import {PasswordlessAuthModule} from "./modules/PasswordlessAuthModule.js";

export class AuthModuleFactory {

    static from(pOptions:AuthModuleOptions):AuthModule {
        switch (pOptions.type) {
            case AuthModuleType.LOCAL_PASSWD:
                return new LocalAuthModule(pOptions);
            case AuthModuleType.OIDC:
                return new OidcAuthModule(pOptions);
            case AuthModuleType.APIKEY:
                return new ApikeyAuthModule(pOptions);
            case AuthModuleType.PASSWORDLESS:
                return new PasswordlessAuthModule(pOptions);
            default:
                throw OrganizationManagerException.INVALID_AUTH_MOD_TYPE(pOptions.type);
        }
    }
}