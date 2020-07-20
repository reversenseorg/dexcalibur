import {ModelRegisterReference} from "../ModelReference";
import DDVM_Symbol from "./DDVM_Symbol";
import DexcaliburDVM from "./DexcaliburDVM";
import DDVM_Exception from "./DDVM_Exception";


export class DDVM_Wide
{
    /**
     * Most Significant 32-bit Number
     * @field
     */
    mn:ModelRegisterReference = null;
    m:DDVM_Symbol = null;

    /**
     * Least Significant 32-bit Number
     * @field
     */
    ln:ModelRegisterReference = null;
    l:DDVM_Symbol = null;

    /**
     * Concrete value
     * @field
     */
    v:number = null;

    vm:any = null;

    constructor( pDVM:any, pRegister:ModelRegisterReference ){

        this.mn = pRegister;
        this.ln = pRegister.getNext();
        this.m = pDVM.stack.getLocalSymbol( this.mn.getRX() );
        this.l = pDVM.stack.getLocalSymbol( this.ln.getRX() );

        if(pDVM.isImm(this.m) && pDVM.isImm(this.l)){
            this.v = (this.m.getValue() << 32) | (this.l.getValue() & 0x00000000FFFFFFFF);
        }
    }

    getValue():number{
        if(this.vm.isImm(this.m) && this.vm.isImm(this.l)){
            return this.v = (this.m.getValue() << 32) | (this.l.getValue() & 0x00000000FFFFFFFF);
        }else{
            throw new DDVM_Exception('T001','Long value is not concrete');
        }
    }
}