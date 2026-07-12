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

import DexcaliburProject from "../DexcaliburProject.js";
import ModelFile from "../ModelFile.js";
import {UserAccount} from "../user/UserAccount.js";
import {MerlinSearchRequest, OperationType} from "../search/MerlinSearchRequest.js";

/**
 * This class offers API to give information about anything related to code, ast, files and more
 *
 * @class
 */
export class ProgramManager {

    private _prj:DexcaliburProject;

    constructor(pProject:DexcaliburProject) {
        this._prj = pProject;
    }


    /**
     * To list all libraries (any executable) in package
     *
     * @method
     * @async
     */
    async listAllLibraries(pUser:UserAccount):Promise<ModelFile[]> {
        return this._prj.getProjectDB().getFileDB().searchExecutables(
            this._prj.getDataAnalyzer().getScope('PKG')
        );
    }

    /**
     * To list all libraries according to project context, such as selected device or
     * history
     *
     * @method
     * @async
     */
    async listProjectLibraries(pUser:UserAccount):Promise<ModelFile[]> {


        const res =  await this._prj.getProjectDB().merlinSearch(
            MerlinSearchRequest
                .fromCondition(
                    this._prj.merlin,
                    ModelFile.TYPE,
                    "@data.type.executable", { not:false })
                .addOperation({
                    type: OperationType.FILTER,
                    args: {
                        pattern: "scope:PKG"
                    }
                })
        );

        return res.getAsList();
        /*
        return this._prj.getAnalyzer().getNativeAnalyzer().getAnalyzedFiles(
            this._prj.getDataAnalyzer().getScope('PKG')
        );*/
    }
}