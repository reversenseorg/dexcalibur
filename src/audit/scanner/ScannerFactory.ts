import {AssuranceScanner, AssuranceScannerUID} from "../common/AssuranceScanner.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import {AuditManagerException} from "../errors/AuditManagerException.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {GenericScanner} from "../common/GenericScanner.js";


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
            case GenericScanner.DEFAULT_NAME:
                scanner = new GenericScanner({
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