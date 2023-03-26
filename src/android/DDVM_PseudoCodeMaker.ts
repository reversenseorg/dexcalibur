import DexcaliburDVM from "./DexcaliburDVM.js";
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";
import ModelMethod from "../ModelMethod.js";
import {DTYPE} from "./DDVM_TypeHelper.js";
import {ModelRegisterReference} from "../ModelReference.js";
import DDVM_Symbol from "./DDVM_Symbol.js";
import DDVM_VirtualArray from "./DDVM_VirtualArray.js";
import * as Log from "../Logger.js";
import {DDVM_PseudoCodeConfiguration} from "./DDVM_PseudoCodeConfiguration.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

/**
 * @class
 */
export default class DDVM_PseudoCodeMaker
{
    code:string[] = null;
    enabled:boolean = false;
    configuration:DDVM_PseudoCodeConfiguration = null;
    vm:DexcaliburDVM = null;

    args:string[] = [];

    /**
     *
     * @param {DexcaliburDVM} pVM
     * @param {boolean} pEnable
     * @constructor
     */
    constructor( pVM:DexcaliburDVM, pEnable:boolean = true){
        this.code = [];
        this.enabled = pEnable;
        this.vm = pVM;
        this.configuration = new DDVM_PseudoCodeConfiguration();
    }

    getConfiguration():DDVM_PseudoCodeConfiguration {
        return this.configuration;
    }

    isEnable():boolean{
        return this.enabled;
    }

    turnOn():void{
        this.enabled = true;
    }

    turnOff():void{
        this.enabled = false;
    }

    pop():string{
        return this.code.pop();
    }

    getIndent():string{
        return "    ".repeat(this.vm.depth);
    }

    renderConcrete( pInstance:DDVM_ClassInstance):any{
        switch(typeof pInstance.getConcrete()){
            case 'string':
                return `"${pInstance.getConcrete()}"`;
            default:
                return pInstance.getConcrete();
        }
    }

    /**
     * To write a pseudocode for a method invoked through a single invoke-* ope
     *
     * @param {ModelMethod} pMethodRef
     * @param {ModelRegisterReference[]}  pParamsReg
     * @method
     * @author Georges-B. MICHEL
     */
    writeInvoke( pMethodRef:ModelMethod, pParamsReg:ModelRegisterReference[]):void{
        let v:string = null, rThis:string=null,  rArg:string=null;
        let vThis:DDVM_Symbol=null, vArg:DDVM_Symbol=null;

        if(pParamsReg.length > 0){
            rThis = pParamsReg[0].getRX();
            vThis = this.vm.stack.getLocalSymbol(rThis);

        }

        // add indent
        v = this.getIndent();

        // Generate 'instance' part of the call
        if((pMethodRef instanceof ModelMethod) && (pMethodRef.name=="<init>"))
            v += `${rThis} = new ${pMethodRef.enclosingClass.name}(`;
        else if(this.vm.method.isStatic()==false && rThis=="p0"){
            v += `this.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else if(vThis.type==DTYPE.CLASS_REF && vThis.hasCode()){
            v += `${vThis.getCode()}.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else if((vThis.getValue() instanceof DDVM_ClassInstance)
            && (vThis.getValue().hasConcrete())
            && (typeof vThis.getValue().getConcrete() == "string")){
            v += `"${vThis.getValue().getConcrete()}".${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }
        else{
            v += `${rThis}.${pMethodRef.alias!=null? pMethodRef.alias : pMethodRef.name}(`;
        }

        // Generate arguments string
        if(pParamsReg.length > 1){
            for(let j=1; j<pParamsReg.length; j++){

                rArg = pParamsReg[j].getRX();
                vArg = this.vm.stack.getLocalSymbol(rArg);

                if(this.vm.isImm(vArg))
                    v += `${this.vm.getImmediateValue(vArg)},`;
                else if(vArg.getValue() instanceof DDVM_VirtualArray){
                    v+= vArg.getValue().toString()+',';
                }
                else if(vArg.hasCode() && !vArg.isSkipped())
                    v+= `${vArg.getCode()},`;
                else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                    v += `this, `;
                }
                else if((vArg.getValue() instanceof DDVM_ClassInstance)
                    && (vArg.getValue().hasConcrete())
                    && (typeof vArg.getValue().getConcrete() == "string")){
                    v += `"${vArg.getValue().getConcrete()}",`;
                }
                else{
                    v += `${rArg},`;
                }
            }
            v = v.substr(0, v.length-1);
        }
        v += ')';

        this.code.push(v);
    }


    /**
     * To write a pseudocode replacing a method invoked by using Reflection API
     *
     * @param {ModelRegisterReference} pInvokerObjRef
     * @param {ModelRegisterReference} pInvokerArgRef
     * @param {ModelRegisterReference}  pInvokedMethod
     * @param pObj
     * @param pArgs
     * @method
     * @author Georges-B. MICHEL
     */
    writeIndirectInvoke( pInvokerObjRef:ModelRegisterReference,
                         pInvokerArgRef:ModelRegisterReference, pInvokedMethod:ModelMethod, pObj, pArgs){

        let irObj:string=null, irArg:string=null;
        let ivObj:DDVM_Symbol=null, ivArg:DDVM_Symbol=null;
        let v:string = null, rArg=null, vArg=null;
        let argArr:DDVM_VirtualArray;

        irObj = pInvokerObjRef.getRX(); // this.vm.getRegisterName(pInvokerObjRef);
        ivObj = this.vm.stack.getLocalSymbol(irObj);

        irArg = pInvokerArgRef.getRX(); // this.vm.getRegisterName(pInvokerArgRef);
        ivArg = this.vm.stack.getLocalSymbol(irArg);

        if((ivArg.getValue() instanceof DDVM_VirtualArray) == false){
            Logger.error("[VM][PCMAKER] PseudoCode generator is not able to simplify Method.invoke() call");
            return null;
        }

        // add indent
        v = this.getIndent();

        // Generate 'instance' part of the call
        if((pInvokedMethod instanceof ModelMethod) && (pInvokedMethod.name=="<init>")){
            // TODO : ??
            // v += `${rThis} = new ${pInvokedMethod.enclosingClass.name}(`;
            v += `new ${pInvokedMethod.enclosingClass.name}(`;
        }
        // caller is not static, p0 is 'this'
        else if(this.vm.method.isStatic()===false && irObj=="p0"){
            v += `this.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if invoked method is statis
        else if(pInvokedMethod.isStatic() === true){
            v += `${pInvokedMethod.enclosingClass.alias!=null? pInvokedMethod.enclosingClass.alias : pInvokedMethod.enclosingClass.name}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if instance has expr
        else if(ivObj.type==DTYPE.CLASS_REF && ivObj.hasCode()){
            v += `${ivObj.getCode()}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if object is a class instance
        else if((ivObj.getValue() instanceof DDVM_ClassInstance)
            && (ivObj.getValue().hasConcrete())
            && (typeof ivObj.getValue().getConcrete() == "string")){
            v += `"${ivObj.getValue().getConcrete()}".${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        else{
            v += `${irObj}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }

        // read array
        argArr = (ivArg.getValue() as DDVM_VirtualArray);

        // Generate arguments string
        if(argArr.realSize() > 0){
            for(let j=0; j<argArr.realSize(); j++){

                rArg = irArg+"["+j+"]";
                vArg = argArr.read(j);

                if(vArg instanceof DDVM_Symbol){
                    if(this.vm.isImm(vArg))
                        v += this.vm.getImmediateValue(vArg);
                    else if(vArg.getValue() instanceof DDVM_VirtualArray){
                        v+= vArg.getValue().toString();
                    }
                    else if(vArg.hasCode() && !vArg.isSkipped())
                        v+= vArg.getCode();
                    else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                        v += `this`;
                    }
                    else if((vArg.getValue() instanceof DDVM_ClassInstance)
                        && (vArg.getValue().hasConcrete())
                        && (typeof vArg.getValue().getConcrete() == "string")){
                        v += `"${vArg.getValue().getConcrete()}"`;
                    }
                    else{
                        v += rArg;
                    }
                }
                else if(vArg instanceof DDVM_ClassInstance){
                    if(vArg.hasConcrete()){
                        v+= this.renderConcrete(vArg);
                    }else{
                        v+= rArg;
                    }
                }
                else{
                    v+= rArg;
                }
                v += ',';
            }
            v = v.substr(0, v.length-1);
        }
        v += ')';

        this.code.push(v);
    }

    writeVarAsssign( pVName:string, pVValue:string, pIndent:string=""):void {

        this.releaseVar(pVName);
        this.args.push(pVName);

        this.code.push(`${pIndent}${pVName} = ${pVValue.substr(pIndent.length,pVValue.length)}`);

        //this.code.push(v);
    }

    releaseVar( pVar:string):void{
        let i:number;
        if((i = this.args.indexOf(pVar))>-1){
            this.args[i] = null;
        }
    }

    push( pCode:string):void{
        if(this.enabled){
            this.code.push(pCode);
        }
    }

    append( pMessage:string):void{
        if(this.code.length-1 >= 0)
            this.code[this.code.length-1] += pMessage;
        else
            this.code[0] = pMessage;
    }

    last():string{
        if(this.enabled && this.code.length>0)
            return this.code[this.code.length-1];
        else
            return null;
    }

    getCode():string[]{
        return this.code;
    }
}

