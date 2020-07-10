// add xml, yaml, properties, jks, bks (...)  parsers
// add file type identifier

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



// TODO : provide better file detection (binwalk, file, yara, r2, ...)
export class TypeDetector{
    /*this.reader = null;
    this.writer = null;
    this.dumper = null;
    this.new = null;
    */
    stats:any = {};


    constructor(pConfig:any=null){
        /*this.reader = null;
        this.writer = null;
        this.dumper = null;
        this.new = null;
        */
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }


    search(extension:string):EncodedDataType{
        let type:EncodedDataType=null;
        for(let i in TYPES){
            if(extension==TYPES[i].ext){
                type = TYPES[i];
                this.stats[type.ext]++;
                break;
            }
        }

        return type;
    }

    getStats():any{
        return this.stats;
    }
}
