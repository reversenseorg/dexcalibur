// add xml, yaml, properties, jks, bks (...)  parsers
// add file type identifier

import * as Log from './Logger.js';
let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class EncodedDataType
{
    mime:string = null;
    ext:string = null;

    constructor(pConfig:any){
        if(pConfig!=null)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }


    isMIME(format:string):boolean{
        return this.mime===format;
    }

    isExt(format:string):boolean{
        return this.ext===format;
    }
}


export const TYPES = {
    BKS: new EncodedDataType({ ext: "bks" }),
    XML: new EncodedDataType({ ext: "xml" }),
    JSON: new EncodedDataType({ ext: "json" }),
    YAML: new EncodedDataType({ ext: "yml" }),
    PROP: new EncodedDataType({ ext: "properties" })
};

