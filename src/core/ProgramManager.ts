import DexcaliburProject from "../DexcaliburProject.js";
import ModelFile from "../ModelFile.js";
import DataScope from "../DataScope.js";
import {UserAccount} from "../user/UserAccount.js";
import {MerlinSearchRequest} from "../search/MerlinSearchRequest.js";

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
        return this._prj.getAnalyzer().getNativeAnalyzer().getAnalyzedFiles(
            this._prj.getDataAnalyzer().getScope('PKG')
        );
    }
}