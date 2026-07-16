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

import {AssuranceScanner, AssuranceScannerUID} from "../common/AssuranceScanner.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {Nullable} from "@reversense/dxc-core-api";
import {PrivacyScanner} from "./PrivacyScanner.js";
import {SecurityScanner} from "./SecurityScanner.js";


export class ScannerFactory {

    private _instances:Record<DexcaliburProjectUUID, Record<string, AssuranceScanner>> = {};


    constructor() {

    }

    /**
     * To instanciate a new scanner for a project
     * @param {DexcaliburProject} pProject
     * @param {AssuranceScannerUID} pScannerUID
     * @return {AssuranceScanner}
     * @method
     */
    createScanner(pProject:DexcaliburProject, pAUID:AssuranceScannerUID):AssuranceScanner {
        if(this._instances[pProject.getUID()]==null){
            this._instances[pProject.getUID()] = {};
        }

        let scanner:Nullable<AssuranceScanner> = null;


        switch (pAUID){
            /*case GenericScanner.DEFAULT_NAME:
                scanner = new GenericScanner({
                    project: pProject
                });
                break;*/
            case SecurityScanner.DEFAULT_NAME:
                scanner = new SecurityScanner({
                    project: pProject
                });
                break;
            case PrivacyScanner.DEFAULT_NAME:
                scanner = new PrivacyScanner({
                    project: pProject
                });
                break;
        }

        if(scanner==null){
            throw AuditManagerException.CANNOT_CREATE_SCANNER(pAUID);
        }

        return this._instances[pProject.getUID()][pAUID] = scanner;
    }

    /**
     *
     * @param {DexcaliburProjectUUID} pProjectUID
     * @param {AssuranceScannerUID} pScannerUID
     */
    getScanner(pProjectUID:DexcaliburProjectUUID, pScannerUID:AssuranceScannerUID):AssuranceScanner {
        if(this._instances[pProjectUID]==null){
            throw AuditManagerException.SCANNER_NOT_ALLOCATED(pProjectUID,pScannerUID);
        }
        if(this._instances[pProjectUID][pScannerUID]==null){
            throw AuditManagerException.SCANNER_NOT_FOUND(pScannerUID,pProjectUID);
        }

        return this._instances[pProjectUID][pScannerUID];
    }

    /**
     *
     * @param {DexcaliburProjectUUID} pProjectUID
     * @param {AssuranceScannerUID} pScannerUID
     */
    freeScanner(pProjectUID:DexcaliburProjectUUID, pScannerUID:AssuranceScannerUID):void {
        if(this._instances[pProjectUID]==null){ return;  }
        if(this._instances[pProjectUID][pScannerUID]==null){ return; }

        this._instances[pProjectUID][pScannerUID].free();

        delete this._instances[pProjectUID][pScannerUID];
    }
}