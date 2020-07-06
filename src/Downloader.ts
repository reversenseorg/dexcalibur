import * as _path_ from "path";
import * as _fs_ from "fs";
import * as _url_ from "url";
import got from "got";
import * as _stream_ from "stream";
import {promisify} from "util";

const pipeline = promisify(_stream_.pipeline);

import DexcaliburWorkspace from './DexcaliburWorkspace';
import Util from './Utils';


/**
 * @class
 * @author Georges-B. MICHEL
 */
export default class Downloader
{

    /**
     * 
     * @param {*} pRemoteURL 
     * @param {*} pLocalPath 
     * @param {*} pOptions 
     * @static
     * @method
     * @async
     */
    static async download( pRemoteURL:string, pLocalPath:string, pOptions:any = { force: false } ):Promise<string>{

        if( (_fs_.existsSync(pLocalPath) == true) && pOptions.force ){
            _fs_.unlinkSync(pLocalPath);
        }
        
        // download file
        await pipeline(
            got.stream(pRemoteURL),
            _fs_.createWriteStream( pLocalPath, {
                flags: 'w+',
                mode: pOptions.mode!=null ? pOptions.mode : 0o666,
                encoding: pOptions.encoding!=null ? pOptions.encoding : 'binary' 
            } )
        );

        if(_fs_.existsSync(pLocalPath) == true){
            return pLocalPath;
        }else{
            return null;
        }
    }

    /**
     * 
     * @param {*} pRemoteURL 
     * @param {*} pOptions 
     * @returns {Path|String} Path of downloaded file
     * @static
     * @async
     * @method
     */
    static async downloadTemp( pRemoteURL:string, pOptions:any):Promise<string>{
        let tmp = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            Util.randString( 16, Util.ALPHA)
        );

        return await Downloader.download( pRemoteURL, tmp, pOptions);
    }
}
