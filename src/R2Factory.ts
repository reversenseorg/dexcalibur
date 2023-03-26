
import * as _stream_ from 'stream';
import {promisify} from 'util';


import * as Log from './Logger.js';
import RadareHelper, {R2_TYPE} from "./R2Helper.js";
import DexcaliburProject from "./DexcaliburProject.js";
import ModelFile from "./ModelFile.js";
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

const pipeline = promisify(_stream_.pipeline);

interface R2HelperMap {
    [pBinID:string] :RadareHelper
}

export default class RadareFactory
{
    helpers: R2HelperMap = {}
    ctx:DexcaliburProject = null;

    constructor( pProject:DexcaliburProject) {
        this.ctx = pProject;
    }



    /**
     * To create an instance of RadareHelper connected to r2 over HTTP
     * @param pURL
     */
    newRemoteInstance( pBinary:ModelFile, pURL:string): RadareHelper {
        return this.helpers[pBinary.getUID()] = new RadareHelper( pBinary, R2_TYPE.HTTP, { url:pURL, ctx:this.ctx });
    }

    /**
     * To create an instance of RadareHelper spawning a local r2 process
     * @param pBinary
     */
    newLocalInstance( pBinary:ModelFile): RadareHelper {
        return this.helpers[pBinary.getUID()] = new RadareHelper( pBinary, R2_TYPE.LOCAL, { ctx:this.ctx });
    }

    /**
     * To get the helper associated to a file
     *
     * @param {string} pBinary Analyzed file
     * @return {RadareHelper}
     */
    getHelperFor(pBinary:ModelFile):RadareHelper {
        Logger.raw(Object.keys(this.helpers).join(";"),"          '",pBinary.getUID(),"'")
        return this.helpers[pBinary.getUID()];
    }

    /**
     * To check if an helper exists for the target file
     *
     * @param pBinary
     */
    isOpened(pBinary:ModelFile):boolean {
        //Logger.raw(Object.keys(this.helpers).join(";"),"          ",pBinary.getUID())
        //return this.helpers.hasOwnProperty(pBinary.getUID());
        return (Object.keys(this.helpers).indexOf(pBinary.getUID())>-1);
    }

}
