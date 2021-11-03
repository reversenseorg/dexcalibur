import {DbDataType, DbKeyType, DbSerialize} from "./DbAbstraction";
import {NodeType} from "./NodeType";
import DexcaliburEngine from "../../DexcaliburEngine";
import {ValidationRule} from "../../Validator";
import {IncomingValue, SanitizedValue, UnsafeValue} from "../../security/SanitizedValue";


export interface NodePropertyState {
    p: any,
    ctx?: DexcaliburEngine,
    self?:any
}

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
    _m:boolean = false;
    _src:any = null;

    /**
     * Validation rule to use during sanitization
     * @field
     * @type {ValidationRule[]}
     */
    _val:ValidationRule[] = [];

    // sleep
    _s:any = null;

    // wakeup
    _wu:any = null;


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
        const tpl = new NodeProperty(pConfig._name);
        for(const i in pConfig){
            tpl[i] = pConfig[i]
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

    getKeyOffset():number {
        return this._k_p;
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

    isSerialized():boolean {
        return (this._serialize != null);
    }


    isBoolean():boolean {
        return (this._type === DbDataType.BOOLEAN);
    }


    /**
     * To set the serializing method : JSON, XML, ..
     *
     * @param {NodeType} pNode The node template of the instance stored into this property
     * @return {NodeProperty} This instance. Chainable
     * @method
     */
    single(pNodeType:NodeType):NodeProperty{
        this._n = pNodeType;
        this._m = false;

        if(pNodeType.hasSource())
            this.source(pNodeType.getSource());

        return this;
    }

    multiple(pNodeType:NodeType):NodeProperty {
        this._m = true;
        this._n = pNodeType;

        if(pNodeType.hasSource())
            this.source(pNodeType.getSource());

        return this;
    }

    isMultiple():boolean {
        return this._m;
    }


    isNode():boolean {
        return (this._n != null);
    }

    getNodeType():NodeType {
        return this._n;
    }

    /**
     * To add a function to serialize data before sleep
     *
     * @param pFn
     */
    sleep( pFn:any){
        this._s = pFn;
        return this;
    }

    doSleep( pAny:NodePropertyState):any{
        return this._s(pAny);
    }


    /**
     * To add a function to wake up data after sleep
     *
     * @param pFn
     */
    wakeUp( pFn:any):any{
        this._wu = pFn;
        return this;
    }

    doWakeUp( pAny:NodePropertyState){
        return this._wu(pAny);
    }

    hasSleep(){
        return (this._s !== null);
    }

    hasWakeUp(){
        return (this._wu !== null);
    }

    source(pSrc:any):any {
        this._src = pSrc;
        return this;
    }

    hasSource():boolean{
        if(this._src != null) {
            return true
        }else if(this.isNode() && this.getNodeType().hasSource()){
            // source is inherited from node type at runtime (lazy)
            this._src = this.getNodeType().getSource();
            return true;
        }

        return false;
    }

    getSource():any{
        return this._src;
    }

    /**
     * To clone the current property.
     *
     * It creates a new instance
     *
     * @param {any} pOverride
     */
    clone(pOverride:any = {}):NodeProperty{
        let o = NodeProperty.from(this);
        for(const i in pOverride){
            o[i] = pOverride[i];
        }
        return o;
    }

    /**
     * To check if the property can sanitize its values or not
     *
     * @return {boolean} Returns TRUE if at least one validation rule is defined, else FALSE
     * @method
     * @since 1.0.0
     */
    isSanitizable():boolean {
        return (this._val.length > 0);
    }

    /**
     * To add a validation rule
     *
     * @param {ValidationRule} pRule The validation rule
     * @return {NodeProperty} Chainable. This instance
     * @method
     * @since 1.0.0
     */
    addValidationRule( pRule:ValidationRule):NodeProperty{
        this._val.push(pRule);
        return this;
    }

    /**
     * To sanitize a value according to its validation rules
     *
     * @param {any} pValue Unsafe value
     * @return {IncomingValue} Encapsulqted value
     * @method
     * @since 1.0.0
     */
    sanitize(pValue:any):IncomingValue {
        if(this._val.length>0){
            let f = true;
            this._val.map( (vRule:ValidationRule) => {
                f = f && (vRule.test(pValue));
            });

            if(f){
                return new SanitizedValue(this.getName(), pValue);
            }else{
                return new UnsafeValue(this.getName(), pValue);
            }
        }else{
            return new UnsafeValue(this.getName(), pValue);
        }
    }
}