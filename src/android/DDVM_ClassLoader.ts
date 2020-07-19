import ModelClass from "../ModelClass";
import ModelMethod from "../ModelMethod";
import ModelField from "../ModelField";
import * as Log from "../Logger";
import {DDVM_TypeHelper} from "./DDVM_TypeHelper";
import {DexcaliburVM} from "../DexcaliburVM";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface ClassSet {
    [fqcn :string] :ModelClass
}

export default class DDVM_ClassLoader
{
    classes:ClassSet = null;
    vm:any = null;

    constructor( pVM:any){
        this.classes = {};
        this.vm = pVM;
    }

    /**
     * To load a new class, only if it is necessary.
     * If the class contains static blocks, clinit() is executed.
     * @param {*} pClass
     */
    load( pClass:ModelClass|string, pExecClinit:boolean=true):ModelClass{
        let clz:ModelClass = null;

        if(pClass instanceof ModelClass){
            if(this.classes[pClass.name] != undefined)
                return this.classes[pClass.name];
            clz = pClass;
        }else if(this.classes[pClass as string] != undefined)

            return this.classes[pClass];
        else{
            clz = this.vm.context.find.get.class(pClass);
        }

        let fields:ModelField[] = clz.getStaticFields(), clinit:ModelMethod=null;

        // import static fields into global symbol table
        if(fields.length > 0){
            for(let i=0; i<fields.length; i++){
                this.vm.metharea.setGlobalSymbol(
                    `${fields[i].enclosingClass.name}.${fields[i].name}`,
                    DDVM_TypeHelper.getDataTypeOf(fields[i].type), null,
                    `${fields[i].enclosingClass.name}.${fields[i].name}`);
            }
        }

        // execute clinit()
        clinit = clz.getClInit();
        if((pExecClinit==true) && (clinit != null)){
            Logger.debugPink(`[VM] [CLINIT] START : Execute ${clinit.signature()} ...`);

            if(this.vm.stack.depth()==0) this.vm.pcmaker.turnOff();
            this.vm.invoke( clinit, null, null);
            if(this.vm.stack.depth()==0) this.vm.pcmaker.turnOn();

            Logger.debugPink(`[VM] [CLINIT] END :  ${clinit.signature()} has been executed`);
        }

        Logger.debugPink(`[VM] [CLASSLOADER] Class ${clz.name} loaded`);
        this.classes[clz.name] = clz;

        return clz;
    }
}