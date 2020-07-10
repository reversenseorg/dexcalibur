import {EncodedDataType} from "./FileTypes";

/**
 * Represent a file which exists into Application data,
 * at rest or at runtime
 *
 * @class
 */
export default class ModelFile
{

    name:string = null;
    type:EncodedDataType = null;
    size:number = -1;
    path:string = null;
    location:string = null;
    trueFile:boolean = false;


    /**
     *
     * @param {Object} pConfig
     * @constructor
     */
    constructor(pConfig:any=null){

        this.trueFile = false;

        if(pConfig != null){
            for(let i in pConfig){
                if(i!=="type")
                    this[i] = pConfig[i];
                else{
                    if(pConfig.type instanceof EncodedDataType)
                        this.type = pConfig.type;
                    else
                        this.type = new EncodedDataType(pConfig.type);
                }
            }
        }
    }


    getSize():number{
        return this.size;
    }

    getPath():string{
        return this.path;
    }

    getName():string{
        return this.name;
    }

    getType():EncodedDataType{
        return this.type;
    }

    hasExt(ext:string):boolean{
        return (this.type != null)&&(this.type.ext==ext);
    }

    hasMIME(mime:string):boolean{
        return (this.type != null)&&(this.type.mime==mime);
    }
}
