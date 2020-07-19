import {DexcaliburDVM} from "./DexcaliburDVM";
import DDVM_ClassInstance from "./DDVM_ClassInstance";
import ModelMethod from "../ModelMethod";
import {DTYPE} from "./DDVM_TypeHelper";
import {ModelRegisterReference} from "../ModelReference";

export default class DDVM_PseudoCodeMaker
{
    code:string[] = null;
    enabled:boolean = false;
    vm:DexcaliburDVM = null;

    constructor( pVM:DexcaliburDVM, pEnable:boolean = true){
        this.code = [];
        this.enabled = pEnable;
        this.vm = pVM;
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

    writeInvoke( pMethodRef:ModelMethod, pParamsReg:ModelRegisterReference[]){
        let v = null, rThis:string=null, vThis:Symbol=null, rArg=null, vArg=null;

        if(pParamsReg.length > 0){
            rThis = this.vm.getRegisterName(pParamsReg[0]);
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

                rArg = this.vm.getRegisterName(pParamsReg[j]);
                vArg = this.vm.stack.getLocalSymbol(rArg);

                if(this.vm.isImm(vArg))
                    v += `${this.vm.getImmediateValue(vArg)},`;
                else if(vArg.getValue() instanceof VM_VirtualArray){
                    v+= vArg.getValue().toString()+',';
                }
                else if(vArg.hasCode() && !vArg.isSkipped())
                    v+= `${vArg.getCode()},`;
                else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                    v += `this, `;
                }
                else if((vArg.getValue() instanceof VM_ClassInstance)
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


    writeIndirectInvoke( pInvokerObjRef, pInvokerArgRef, pInvokedMethod, pObj, pArgs){
        let irObj=null, irArg=null, ivObj=null, ivArg=null,  v = null, rThis=null, vThis=0, rArg=null, vArg=null;

        irObj = this.vm.getRegisterName(pInvokerObjRef);
        ivObj = this.vm.stack.getLocalSymbol(irObj);

        irArg = this.vm.getRegisterName(pInvokerArgRef);
        ivArg = this.vm.stack.getLocalSymbol(irArg);

        if((ivArg.getValue() instanceof VM_VirtualArray) == false){
            Logger.error("[VM][PCMAKER] PseudoCode generator is not able to simplify Method.invoke() call");
            return null;
        }

        // add indent
        v = this.getIndent();

        // Generate 'instance' part of the call
        if((pInvokedMethod instanceof CLASS.Method) && (pInvokedMethod.name=="<init>")){
            // TODO : ??
            // v += `${rThis} = new ${pInvokedMethod.enclosingClass.name}(`;
            v += `new ${pInvokedMethod.enclosingClass.name}(`;
        }
        // caller is not static, p0 is 'this'
        else if(this.vm.method.modifiers.static==false && irObj=="p0"){
            v += `this.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if invoked method is statis
        else if(pInvokedMethod.modifiers.static == true){
            v += `${pInvokedMethod.enclosingClass.alias!=null? pInvokedMethod.enclosingClass.alias : pInvokedMethod.enclosingClass.name}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if instance has expr
        else if(ivObj.type==DTYPE.CLASS_REF && ivObj.hasCode()){
            v += `${ivObj.getCode()}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        // if object is a class instance
        else if((ivObj.getValue() instanceof VM_ClassInstance)
            && (ivObj.getValue().hasConcrete())
            && (typeof ivObj.getValue().getConcrete() == "string")){
            v += `"${ivObj.getValue().getConcrete()}".${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }
        else{
            v += `${irObj}.${pInvokedMethod.alias!=null? pInvokedMethod.alias : pInvokedMethod.name}(`;
        }

        // read array
        ivArg = ivArg.getValue();

        // Generate arguments string
        if(ivArg.realSize() > 0){
            for(let j=0; j<ivArg.realSize(); j++){

                rArg = irArg+"["+j+"]";
                vArg = ivArg.read(j);

                if(vArg instanceof Symbol){
                    if(this.vm.isImm(vArg))
                        v += this.vm.getImmediateValue(vArg);
                    else if(vArg.getValue() instanceof VM_VirtualArray){
                        v+= vArg.getValue().toString();
                    }
                    else if(vArg.hasCode() && !vArg.isSkipped())
                        v+= vArg.getCode();
                    else if(rArg=="p0" && vArg.isThis(this.vm.method)){
                        v += `this`;
                    }
                    else if((vArg.getValue() instanceof VM_ClassInstance)
                        && (vArg.getValue().hasConcrete())
                        && (typeof vArg.getValue().getConcrete() == "string")){
                        v += `"${vArg.getValue().getConcrete()}"`;
                    }
                    else{
                        v += rArg;
                    }
                }
                else if(vArg instanceof VM_ClassInstance){
                    if(vArg.hasConcrete()){
                        v+= this.vm.pcmaker.renderConcrete(vArg);
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

    push( pCode){
        if(this.enabled) this.code.push(pCode);
    }

    append( pMessage){
        if(this.code.length-1 >= 0)
            this.code[this.code.length-1] += pMessage;
        else
            this.code[0] = pMessage;
    }

    last(){
        if(this.enabled && this.code.length>0)
            return this.code[this.code.length-1];
        else
            return null;
    }

    getCode(){
        return this.code;
    }
}

