import {Nullable} from "@dexcalibur/dxc-core-api";
import {SecurityZone} from "../../security/SecurityZone.js";
import {AuthModule, AuthModuleOptions, AuthModuleType} from "./AuthModule.js";
import {OrganizationManagerException} from "../../errors/OrganizationManagerException.js";
import {OidcAuthModule} from "./modules/OidcAuthModule.js";
import {LocalAuthModule} from "./modules/LocalAuthModule.js";

export class AuthModuleFactory {

    static from(pOptions:AuthModuleOptions):AuthModule {
        switch (pOptions.type) {
            case AuthModuleType.LOCAL_PASSWD:
                return new LocalAuthModule(pOptions);
            case AuthModuleType.OIDC:
                return new OidcAuthModule(pOptions);
            default:
                throw OrganizationManagerException.INVALID_AUTH_MOD_TYPE(pOptions.type);
        }
    }

    static fromUnsafe(pOptions:any):AuthModule {

        switch (pOptions.type) {
            case AuthModuleType.LOCAL_PASSWD:
                return new LocalAuthModule(pOptions);
            case AuthModuleType.OIDC:
                return new OidcAuthModule(pOptions);
            default:
                throw OrganizationManagerException.INVALID_AUTH_MOD_TYPE(pOptions.type);
        }
    }
}