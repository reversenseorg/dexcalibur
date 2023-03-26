import {DbDataType, DbKeyType, DbSerialize} from "./DbAbstraction.js";

export class DbPersistTemplate {

    _name:string = null;
    _cols:DbColumnTemplate[] = [];

    constructor( pName:string, pCols:DbColumnTemplate[]) {
        this._name = pName;
        this._cols = pCols;
    }

    /**
     * To get table name
     *
     * @method
     */
    getName():string {
        return this._name;
    }

    /**
     * To get table columns template
     *
     * @return {DbColumnTemplate[]} Columns template
     * @method
     */
    getCols():DbColumnTemplate[] {
        return this._cols;
    }
}

export class DbColumnTemplate {
    _name:string = null;
    _type:DbDataType = null;
    _size:number = null;
    _key:DbKeyType = null;
    _k_p:number = 0;
    _idx:boolean = false;
    _nnull: boolean;
    _def:any = undefined;
    _builder:any;
    _serialize:DbSerialize = null;


    constructor(pName:string, pBuilder:any = null) {
        this._name = pName;
        this._builder = pBuilder;
    }

    static from(pConfig:any):DbColumnTemplate {
        const tpl = new DbColumnTemplate(pConfig.hasOwnProperty('name')? pConfig.name : null);
        for(const i in pConfig){
            this[i] = pConfig[i]
        }
        return tpl;
    }

    type(pType:DbDataType):DbColumnTemplate {
        this._type = pType;
        return this;
    }

    size(pSize:number):DbColumnTemplate {
        this._size = pSize;
        return this;
    }

    key(pKeyType:DbKeyType, pOffset:number = 0):DbColumnTemplate {
        this._key = pKeyType;
        this._k_p = pOffset;
        return this;
    }

    notnull():DbColumnTemplate {
        this._nnull = true;
        return this;
    }


    def(pVal:any):DbColumnTemplate {
        this._def = pVal;
        return this;
    }

    serialize(pSerialize:DbSerialize){
        this._serialize = pSerialize;
        return this;
    }


    isPrimaryKey():boolean {
        return (this._key == DbKeyType.PRIMARY);
    }


    isIndexed():boolean {
        return this._idx;
    }
}