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