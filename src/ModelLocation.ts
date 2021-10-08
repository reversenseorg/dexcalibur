import ModelFile from "./ModelFile";
import {NodeInternalType} from "./NodeInternalType";

export enum LocationType {
    FILE,
    MEM
}

/**
 * @class
 */
export class ModelLocation {

    _t:LocationType = LocationType.FILE;
    _p:any = {};


    constructor(pConfig:any=null) {
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    set file(pFile:ModelFile) {
        this._p.file = pFile;
    }

    get file():ModelFile {
        return this._p.file;
    }

    static fromFile(pFile:ModelFile):ModelLocation {
        let o:ModelLocation = new ModelLocation();
        o.file = pFile;
        return o;
    }

    /**
     *
     */
    isFileBased():boolean {
        return (this._t == LocationType.FILE);
    }

    /**
     *
     */
    toJsonObject(){
        if(this._t === LocationType.FILE){
            return {
                _t: NodeInternalType.FILE,
                _f: this.file.toJsonObject()
            };
        }else{
            return {
                _t: null,
                _f: null
            };
        }
    }
}