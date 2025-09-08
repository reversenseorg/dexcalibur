import {Nib} from "../parser/NibParser.js";
import UINibArchiveHeader = Nib.UINibArchiveHeader;
import {Nullable} from "@dexcalibur/dxc-core-api";
import UINibArchiveClassName = Nib.UINibArchiveClassName;
import {DataLocation} from "../DataLocation.js";
import ModelResource from "../ModelResource.js";

export interface NibArchiveOptions {
    header?:Nullable<UINibArchiveHeader>;
    objTable?:Nullable<Nib.UINibArchiveObject[]>;
    keyTable?:Nullable<Nib.UINibArchiveKey[]>;
    coderTable?:Nullable<Nib.UINibArchiveCoderValue[]>;
    clsTable?:Nullable<Nib.UINibArchiveClassName[]>;
}
export class NibArchive {

    header:Nullable<UINibArchiveHeader> = null;
    objTable:Nullable<Nib.UINibArchiveObject[]> = null;
    keyTable:Nullable<Nib.UINibArchiveKey[]> = null;
    coderTable:Nullable<Nib.UINibArchiveCoderValue[]> = null;
    clsTable:Nullable<Nib.UINibArchiveClassName[]> = null;

    constructor(pOptions:NibArchiveOptions) {

        ['header', 'objTable', 'keyTable', 'coderTable', 'clsTable', 'clsTable'].map(x => {
            if(pOptions[x]!=null){
                this[x] = pOptions[x];
            }
        });
    }

    /*
    getKeyValue(pKey:string){
        if(this.keyTable==null || this.coderTable==null){
            throw Error("Missing key/coder table");
        }
        this.keyTable[pKey] = pKey;
    }*/

    toModelResource( pLocation:Nullable<DataLocation> = null):ModelResource<any> {

        return new ModelResource({
            location: pLocation,
            _uid: null,
            value: this
        });
    }
}