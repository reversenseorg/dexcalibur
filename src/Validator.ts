import * as NodeBuffer from "node:buffer"


export enum ValidationType {
    EQUAL,
    PINKLIST,
    REGEXP,
    CUSTOM
}

// Same than AngularJs project
const EMAIL_REGEXP =
    /^(?=.{1,254}$)(?=.{1,64}@)[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+(\.[-!#$%&'*+/0-9=?A-Z^_`a-z{|}~]+)*@[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?(\.[A-Za-z0-9]([A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*$/;


export class ValidationRule {
    private _o: any = {};

    constructor( pType:ValidationType, pOptions:any=null) {
        this.type = pType;

        if(pOptions!=null){
            switch(pType){
                case ValidationType.EQUAL:
                case ValidationType.PINKLIST:
                case ValidationType.REGEXP:
                    this.refValue = pOptions;
                    break;
                case ValidationType.CUSTOM:
                    this.testFunc = pOptions;
                    break;
            }
        }
    }

    public get type():ValidationType {
        return this._o.t;
    }

    public set type(pType:ValidationType) {
        this._o.t = pType;
    }

    public set refValue(pValue:any) {
        this._o.r = pValue;
    }

    public get refValue():any {
        return this._o.r;
    }

    public set testFunc(pFunc:Function) {
        this._o.f = pFunc;
    }

    public get testFunc():Function {
        return this._o.f;
    }


    static asArrayOf(vRules:ValidationRule[]):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            if(vValue==null || !Array.isArray(vValue)){
                return false;
            }

            let ctr=0;
            for (let i = 0; i < vValue.length; i++) {
                vRules.map(r => {
                    if(r.test(vValue)){
                        ctr++;
                    }
                });
            }
            return (ctr==(vRules.length * vValue.length));
        });
    }

    static newEqualAssert(pRefValue:any):ValidationRule {
        return new ValidationRule( ValidationType.EQUAL, pRefValue);
    }

    static newPinklistAssert(pRefValue:any):ValidationRule {
        return new ValidationRule( ValidationType.PINKLIST, pRefValue);
    }

    static newRegexpAssert(pRefValue:RegExp):ValidationRule {
        return new ValidationRule( ValidationType.REGEXP, pRefValue);
    }

    static newCustomAssert(pFunc:Function):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, pFunc);
    }



    static utf8String():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return NodeBuffer.isUtf8(Buffer.from(vValue));
        });
    }

    static uuid():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^([0-9]:)?[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/.test(vValue);
        });
    }

    static uuidComposite(pSeparator:string):ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue.split(pSeparator));
        });
    }

    static base64String():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(vValue);
        });
    }

    static email():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return EMAIL_REGEXP.test(vValue);
        });
    }


    static uuidList():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.uuid() ]).test(vValue);
        });
    }

    static emailList():ValidationRule {
        return new ValidationRule( ValidationType.CUSTOM, (vValue:any)=>{
            return ValidationRule.asArrayOf([ ValidationRule.email() ]).test(vValue);
        });
    }

    test(pData:any):boolean {
        switch(this._o.t){
            case ValidationType.EQUAL:
                return (pData==this.refValue);
            case ValidationType.PINKLIST:
                return (this.refValue.indexOf(pData)>-1);
            case ValidationType.REGEXP:
                return (this.refValue).test(pData);
            case ValidationType.CUSTOM:
                return (this.testFunc)(pData);
            default:
                return false;
        }
    }
}


export interface ValidationRulesMap {
    [name:string] :ValidationRule[]
}


export class ValidationCapable {
    validator: Validator;

    constructor(pValidationRules:ValidationRulesMap) {
        this.validator = new Validator(pValidationRules);
    }

    validate(pName: string, pValue: any): boolean {
        return this.validator.validate(pName, pValue);
    }

    canValidate(pName:string):boolean {
        return this.validator.supports(pName);
    }

    getValidationErrors():ValidationError[] {
        return this.validator.getErrors();
    }
}

export class ValidationError {
    public code:number = -1;
    public msg:string = "";

    constructor( pCode:number, pMsg:string = "") {
        this.code = pCode;
        this.msg = pMsg;
    }
}

export class Validator {

    private _err:any[] = [];
    private _rules:ValidationRulesMap = {};

    constructor( pRules:ValidationRulesMap ) {
        this._rules = pRules;
    }

    supports(pName):boolean {
        return (this._rules[pName]!=null);
    }

    addRule( pName:string, pRule:ValidationRule):Validator{
        if(this._rules[pName]==null){
            this._rules[pName] = [];
        }

        this._rules[pName].push(pRule);
        return this;
    }

    validate(pField:string, pValue:any):boolean {
        this.clearErrors();

        if(!this._rules.hasOwnProperty(pField)){
            this._err.push(new ValidationError(1, "Field not supported"));
            return false;
        }

        let f:boolean = true;
        this._rules[pField].map( vRule => {
            f = f && (vRule.test(pValue));
        })

        return f;
    }

    clearErrors(){
        this._err = [];
    }

    getErrors():ValidationError[] {
        return this._err;
    }
}