import {DataType} from "./DataType";
import * as Log from "../Logger";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface DataTypeMap {
    [name:string] :DataType
}

export enum DATATYPE_CATEGORY {
    NATIVE='n',
    JAVA='j'
}

export class TypeManager {

    private _native:DataTypeMap = {}
    private _java:DataTypeMap = {};

    private _initf:any = {
        [DATATYPE_CATEGORY.NATIVE]: false,
        [DATATYPE_CATEGORY.JAVA]: false,
    };



    /**
     *
     * @param pCategory
     * @param pTypes
     */
    async initTypes( pCategory:DATATYPE_CATEGORY, pTypes:DataType[] ):Promise<boolean>{
        let success = true;
        switch (pCategory){
            case DATATYPE_CATEGORY.JAVA:
                pTypes.map( (vType:DataType)=>{ this._java[vType.getName()] = vType });
                this._initf[pCategory] = true;
                break;
            case DATATYPE_CATEGORY.NATIVE:
                pTypes.map( (vType:DataType)=>{ this._native[vType.getName()] = vType });
                this._initf[pCategory] = true;
                break;
            default:
                success = false;
                break;
        }

        return success;
    }

    isInitialized( pCategory:DATATYPE_CATEGORY):boolean {
        return this._initf[pCategory];
    }

    addNativeType( pType:DataType):any{
        this._native[pType.getName()] = pType;
    }

    addJavaType( pType:DataType):any{
        this._java[pType.getName()] = pType;
    }

    getNativeType( pName):DataType{
        return this._native[pName];
    }

}