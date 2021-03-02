import ModelFile from "./ModelFile";
import ModelFileSection from "./ModelFileSection";
import ModelMethod from "./ModelMethod";
import {ModelFunction, ModelFunctionList} from "./ModelFunction";
import ModelExecutableSection from "./ModelExecutableSection";

const TO_JSON:Function = function (vSrc:any, vTarget:any):any{
    return function(ppt:string){
        if(Array.isArray(vSrc[ppt])){
            vTarget[ppt] = [];
            vSrc[ppt].map(TO_JSON(vSrc[ppt],vTarget[ppt]));
        }
        else if(vSrc[ppt].toJsonObject !== undefined){
            vTarget[ppt] = vSrc[ppt].toJsonObject();
        }
        else{
            vTarget[ppt] = vSrc[ppt]
        }
    }
};


export class ModelFileExecutable extends ModelFile {

    sections:ModelExecutableSection[] = [];
    fn_list:ModelFunctionList = {};

    constructor(props) {
        super(props);

        // this.addTag(TagManager.get('file','exec'))
    }

    setProgramSection(pSection:ModelExecutableSection[]):void{
        this.sections = pSection;
    }
    addFunc(pAddress:number, pFunc:ModelFunction):void {
        this.fn_list["0x"+pAddress.toString(16)] = pFunc;
        pFunc.setDeclaringFile(this);
    }

    appendFunctions(pFuncs:ModelFunction[]):void {
        pFuncs.map( vFn => {
            this.fn_list["0x"+vFn.getAddr().toString(16)] = vFn;
        });
    }

    getFuncAt(pAddress:number|string):ModelFunction {
        if(!this.fn_list.hasOwnProperty(pAddress)){
            throw new Error("Function not found at ["+pAddress+"]");
        }

        return this.fn_list[pAddress];
    }

    toJsonObject( pOptions:any={}):any{
        let o:any = super.toJsonObject();
        o.n = {};



        if(pOptions.cmd!=null){
            pOptions.cmd.map(
                TO_JSON( this, o.n)
            );
            /*
            pOptions.cmd.map( vCmd => {
                if(Array.isArray(this[vCmd])){
                    o.n[vCmd] = this[vCmd].map()
                }
                else if(this[vCmd].toJsonObject === undefined){
                    o.n[vCmd] = this[vCmd].toJsonObject();
                }
                else{
                    o.n[vCmd] = this[vCmd]
                }

            });*/
        }else{
            o.sections = [];
            this.sections.map( (sec:ModelExecutableSection) => {
                o.sections.push( sec.toJsonObject() );
            });

            o.fn_list = {};
            for(let i  in this.fn_list){
                o.fn_list[i] = this.fn_list[i].toJsonObject();
            }
        }


        return o;
    }
}