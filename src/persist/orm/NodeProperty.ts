import {DbDataType, DbKeyType, DbSerialize} from "./DbAbstraction";
import {NodeType} from "./NodeType";

export class NodeProperty {

    _name:string = null;
    _type:DbDataType = null;
    _size:number = null;
    _key:DbKeyType = null;
    _k_p:number = 0;
    _idx:boolean = false;
    _nnull: boolean;
    _def:any = undefined;
    _serialize:DbSerialize = null;
    _n:NodeType = null;
    _v:boolean = false;
    _u:boolean = false;


    /**
     *
     * @param pName
     * @param pBuilder
     * @constructor
     */
    constructor(pName:string) {
        this._name = pName;
    }

    /**
     * To create an instance from a poor object
     *
     * @param {any} pConfig Property configuration
     * @return {NodeProperty}
     * @method
     * @static
     */
    static from(pConfig:any):NodeProperty {
        const tpl = new NodeProperty(pConfig.name);
        for(const i in pConfig){
            this[i] = pConfig[i]
        }
        return tpl;
    }

    getName():string {
        return this._name;
    }

    volatile():NodeProperty {
        this._v = true;
        return this;
    }

    isVolatile():boolean {
        return this._v;
    }

    unique(pUnique = true):NodeProperty {
        this._u = pUnique;
        return this;
    }

    isUnique():boolean {
        return this._u;
    }


    /**
     * To set data type
     *
     * @param pType
     */
    type(pType:DbDataType):NodeProperty {
        this._type = pType;
        return this;
    }

    getType():DbDataType {
        return this._type;
    }

    /**
     * To set max size of the type
     *
     * @param pSize
     */
    size(pSize:number):NodeProperty {
        this._size = pSize;
        return this;
    }

    getMaxSize():number {
        return this._size;
    }

    /**
     * To define the property is an indexed key (primary key, ...)
     *
     * @param {DbKeyType} pKeyType Key type : primary, foreign, composite, ...
     * @param {number} pOffset The offset of the key, if the key is composite
     * @return {NodeProperty} This instance. Chainable
     * @method
     */
    key(pKeyType:DbKeyType, pOffset:number = 0):NodeProperty {
        this._key = pKeyType;
        this._k_p = pOffset;
        return this;
    }

    isPrimaryKey():boolean {
        return (this._key == DbKeyType.PRIMARY);
    }

    isForeignKey():boolean {
        return (this._key == DbKeyType.FOREIGN);
    }

    isCompositeKey():boolean {
        return (this._key == DbKeyType.COMPOSITE);
    }

    isKey(pKeyType:DbKeyType = null):boolean{
        if(pKeyType==null){
            return (this._key!=null);
        }else{
            return (this._key!=pKeyType);
        }
    }

    notnull():NodeProperty {
        this._nnull = true;
        return this;
    }

    isNotNull():boolean {
        return this._nnull;
    }


    /**
     * To set a default value if the property is empty
     *
     * @param pVal
     */
    def(pVal:any):NodeProperty {
        this._def = pVal;
        return this;
    }

    getDefaultValue():any {
        return this._def;
    }

    /**
     * To set the serializing method : JSON, XML, ..
     *
     * @param {DbSerialize} pSerialize The serializing method
     * @return {NodeProperty} This instance. Chainable
     * @method
     */
    serialize(pSerialize:DbSerialize):NodeProperty{
        this._serialize = pSerialize;
        return this;
    }

    getSerializeMethod():DbSerialize {
        return this._serialize;
    }

    /**
     * To set the serializing method : JSON, XML, ..
     *
     * @param {NodeType} pNode The node template of the instance stored into this property
     * @return {NodeProperty} This instance. Chainable
     * @method
     */
    link(pNode:NodeType):NodeProperty{
        this._n = pNode;
        return this;
    }

    getNodeTemplate():NodeType {
        return this._n;
    }
}