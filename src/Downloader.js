const _path_ = require("path");
const _fs_ = require("fs");
const _url_ = require("url");
const _got_ = require("got");
const _stream_ = require("stream");
const {promisify} = require("util");

const pipeline = promisify(_stream_.pipeline);

const DexcaliburWorkspace = require('./DexcaliburWorkspace');
const Utils = require('./Utils');


/**
 * @class
 * @author Georges-B. MICHEL
 */
class Downloader
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
    static async download( pRemoteURL, pLocalPath, pOptions = { force: false } ){

        if( (_fs_.existsSync(pLocalPath) == true) && pOptions.force ){
            _fs_.unlinkSync(pLocalPath);
        }
        
        // download file
        await pipeline(
            _got_.stream(pRemoteURL),
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
    static async downloadTemp( pRemoteURL, pOptions){
        let tmp = _path_.join(
            DexcaliburWorkspace.getInstance().getTempFolderLocation(),
            Utils.randString( 16, Utils.ALPHA)
        );

        return await Downloader.download( pRemoteURL, tmp, pOptions);
    }
}

module.exports = Downloader;