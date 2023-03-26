import KeyPoint from "./KeyPoint.js";
import KeyPointManager from "./KeyPointManager.js";
import ModelFile from "../ModelFile.js";
import {NodeInternalType} from "../NodeInternalType.js";
import {INode} from "../INode.js";
import {Device} from "../Device.js";
import ModelClass from "../ModelClass.js";
import {CodeLocation, LocationType, ModelLocation} from "../ModelLocation.js";
import {HookManager} from "./HookManager.js";
import {ModelFunction} from "../ModelFunction.js";
import * as Log from "../Logger.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import ModelPackage from "../ModelPackage.js";
import ModelField from "../ModelField.js";
import ModelMethod from "../ModelMethod.js";
import AnalyzerDatabase from "../AnalyzerDatabase.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AbstractHook, HOOK_FRAGMENT_POS} from "./AbstractHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export const KeyPointFileEvent = {
    LINKER: 'linker',
    DLOPEN: 'dlopen',
    READ: 'read',
    WRITE: 'write',
    STAT: 'fstat',
    UNLINK: 'del'
};

/**
 * Represent options required to generate code of a key point
 *
 * @class
 */
export class KeyPointOptions {
    parent:string;
    token:string;
    weight:number;
    descr:string;

    /**
     * Condition ID
     * @field
     * @type {string}
     */
    condition = "";

    /**
     * Condition Name
     * @field
     * @private
     * @type {string}
     */
    private cname:string = null;

    /**
     * Key point name
     * @field
     * @type {string}
     */
    name: string;

    /**
     *
     * @param pConfig {any} Optional. Poor object containing config
     * @constructor
     */
    constructor(pConfig:any = null) {
        if(pConfig != null){
            for(const i in pConfig) this[i] = pConfig[i];
        }
    }

    /**
     * To get the condition name
     *
     * It is the last part of the condition ID. Ex: 'read' in 'fldpkg_read'
     *
     * @return {string} Condition name. Meaning depends of targeted node.
     * @method
     */
    getConditionName(){
        if(this.cname!=null){
            return this.cname;
        }else{
            return (this.cname = this.condition.split('_')[1]);
        }
    }
}

enum INSTR_LEVEL {
    JAVA,
    NATIVE,
    INSTR
}

/**
 * A generator to generate fragment of code for key point
 */
export class KeyPointGenerator {

    mgr:KeyPointManager = null;

    analDB:AnalyzerDatabase = null;

    target:Device = null;

    require:any = {
        interruptor: false
    };

    deepestInstrLvl:INSTR_LEVEL = INSTR_LEVEL.INSTR;

    constructor(pKeyPointMgr:KeyPointManager) {
        this.mgr = pKeyPointMgr;
    }

    setTarget( pDevice:Device){
        this.target = pDevice;
    }

    getTarget():Device{
        return this.target;
    }

    setInstrLevel(pLvl:INSTR_LEVEL):void {
        this.deepestInstrLvl = pLvl;
    }

    isStalkerReady():boolean {
        return (this.deepestInstrLvl == INSTR_LEVEL.INSTR);
    }

    getTargetNode(pKeyPoint:KeyPoint):INode {
        const node:INode = pKeyPoint.getFirstNode();
        if(node == null){
            throw KeyPointManagerException.GENERATOR_ERROR_NO_NODE(pKeyPoint.getName());
        }
        return node;
    }

    generateToken(pObj:any, pKeyPoint:KeyPoint, pEvent:string):string {
        let node:INode = this.getTargetNode(pKeyPoint);

        if(pObj !== null){
            node = pObj;
        }

        switch (node.__) {
            case NodeInternalType.FILE:
                return `@@__KP::FILE::${pEvent}::${(node as ModelFile).getName()}__@@`;
                break;
            default:
                return `@@__KP::CUSTOM::${pKeyPoint.getName()}_${pEvent}__@@`;
                break;
        }
    }

    private generateForField( pField:ModelField, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        let code:string  = "";
        switch(pOptions.getConditionName()){
            case 'r':
                // read access
                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
            case 'w':
                // write access
                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
            case 'vis':
                // visibility change over reflection
                code =  `
                DXC.onModifierChange({
                    class: "${pField.getEnclosingClass().getName()}",
                    name: "${pField.name}"
                }, ()=>{
                    /*@@__CONTENT__@@*/
                })`;
                break
            case 'def':
                // define
                code =  `
                DXC.onFieldDefine({
                    class: "${pField.getEnclosingClass().getName()}",
                    name: "${pField.name}"
                 }, ()=>{
                    /*@@__CONTENT__@@*/
                 });`;

                break
        }
        pKeyPoint.code = code;
        return pKeyPoint;
    }

    private generateForMethod( pMeth:ModelMethod, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        let code:string = "";
        let project:DexcaliburProject = this.mgr.getProject();
        let hm:HookManager = project.getHookManager();
        let hook:AbstractHook = null;

        switch(pOptions.getConditionName()){
            case 'def':
                // on method defined
                const args = [];
                pMeth.args.map( x => {
                    args.push(x._hashcode);
                });

                code =  `
                DXC.onMethodDefine({
                    class: "${pMeth.getEnclosingClass().getName()}",
                    name: "${pMeth.getName()}"
                    args: ${JSON.stringify(args)},
                    ret: "${pMeth.getReturnType()._hashcode}"
                 }, ()=>{
                    /*@@__CONTENT__@@*/
                 });`;

                break
            case 'bef':
                // detect is the method is already hooked
                hook = hm.getProbe(pMeth);
                if(hook == null){
                    hook = hm.createJavaMethodHook(pMeth);
                }

                // before method call
                //pKeyPoint.
                hook.addExtraFragment( HOOK_FRAGMENT_POS.BEFORE, new HookTemplateFragment({
                    _keypoint: pKeyPoint.getUID(),
                    name: pKeyPoint.getName()+"_frag",
                    _descr: "Special fragment to load/unload hooks associated to the KeyPoint '"+pKeyPoint.getName()+"'",
                    _w:1000
                }));

                code =  `/*@@__CONTENT__@@*/`;
                break
            case 'aft':
                // detect is the method is already hooked
                hook = hm.getProbe(pMeth);
                if(hook == null){
                    hook = hm.createJavaMethodHook(pMeth);
                }

                // before method call
                //pKeyPoint.
                hook.addExtraFragment( HOOK_FRAGMENT_POS.AFTER, new HookTemplateFragment({
                    _keypoint: pKeyPoint.getUID(),
                    name: pKeyPoint.getName()+"_frag",
                    _descr: "Special fragment to load/unload hooks associated to the KeyPoint '"+pKeyPoint.getName()+"'",
                    _w:1000
                }));

                code =  `/*@@__CONTENT__@@*/`;
                break
        }
        pKeyPoint.code = code;
        return pKeyPoint;
    }


    /**
     *
     */
    private generateForClass( pClass:ModelClass, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {

        let loc:ModelLocation = pClass.location;
        let code:string = "";
        let classFactory = "Java";

        switch (loc.getType()) {
            case LocationType.APP:
                classFactory = `DXC.classLoader.path`;
                break;
            case LocationType.PLATFORM:
                classFactory = `DXC.classLoader.boot`;
                break;
            case LocationType.FILE:
            case LocationType.DYN:
                classFactory = `DXC.classLoader.appCL("${loc.file.getName()}")`;
                break;
            default:
                classFactory = "Java";
                break;
        }
        if(loc._t==CodeLocation.APP._t){

        }

        switch(pOptions.getConditionName()){
            case 'load':
                // get info about the classloader to hook in order to hook the class to load

                // on class load
                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
            case 'def':
                // on class define


                // get info about the classloader to hook in order to hook the class to load
                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
            case 'new_1st':
                // for only the first new instance
                code =  `
${classFactory}.use("${pClass.getName()}").onFirstNew((vArgs)=>{
        /*@@__CONTENT__@@*/
})
                `;

                break
            case 'new_any':
                // for each new instance
                code =  `
${classFactory}.use("${pClass.getName()}").onAnyNew((vArgs)=>{
    /*@@__CONTENT__@@*/
})
                `;
                break
        }
        pKeyPoint.code = code;

        return pKeyPoint;
    }

    private generateForPackage( pPackage:ModelPackage, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        let code:string ="";
        switch(pOptions.getConditionName()){
            case 'load':
                // get info about the classloader to hook in order to hook the class to load

                // load a class from the target package
                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
        }
        pKeyPoint.code = code;
        return pKeyPoint;
    }

    private generateForFile( pFile:ModelFile, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        const libName = pFile.getName();

        switch(pOptions.getConditionName()){
            case 'load':
                // JNI Onload if native lib
                // DexClassLoader if dex file, ...
                if(pFile.isExecutable()){
                    pKeyPoint.code = `  
Interceptor.attach( 
    Process.findModuleByName("${libName}").findExportByName("JNI_Onload"),
    { 
        onEnter:function(args){
            DXC.JVM["${libName}"] = args[0];
        },
        onLeave:function(args){
            /*@@__CONTENT__@@*/
        }
    }
);
`;
                }/*else if (lib.hasExt("dex")){

                }*/

                // else if()
                // pKeyPoint.code = "Interruptor.newAgent({ @@__CONTENT__@@ }).startOnLoad('"+lib+"')";
                break
            case 'link':
                // if no instruction hook are enabled, then use only linker64 hook
                pKeyPoint.description = "This point is trigged when the lib '"+libName+"' is linked by the dynamic linker.";
                if(!this.mgr.hasActiveInstructionHook()){
                    // add a function to the list callback executed on load
                    pKeyPoint.code = `__:function(vMod){ /*@@__CONTENT__@@*/ },`;
                }else{
                    // use interruptor + onStart()
                    pKeyPoint.require("interruptor/LinuxArm64");
                    pKeyPoint.code = `onStart: function(vMod){ /*@@__CONTENT__@@*/ }`;
                }
                break
            case 'dlo':

                //if(this.isStalkerReady()){
                    pKeyPoint.code = `
DXC.onDlOpenOf( /${libName}/, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                    `;
                /*}else{
                    pKeyPoint.code = `
Process.findModuleByName('linker64').enumerateSymbols().forEach(sym => {
    if (sym.name.indexOf('do_dlopen') >= 0) {
        do_dlopen = sym.address;
    } else if (sym.name.indexOf('call_constructor') >= 0) {
        call_ctor = sym.address;
    } else if(sym.name.indexOf('__dl__ZN11ScopedTrace3EndEv') >= 0){
        scopedTrace = sym.address;
    }
});
                
                    `;
                }*/

                // DL_OPEN
                break
            case 'open':
                // FS open
                pKeyPoint.code = `
DXC.onSyscall( "open", {file:/${libName}$/}, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
            case 'write':
                // FS write
                pKeyPoint.code = `
DXC.onSyscall( "write", {file:/${libName}$/}, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
            case 'read':
                // FS read
                pKeyPoint.code = `
DXC.onSyscall( "read", {file:/${libName}$/}, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
            case 'del':
                // FS delete
                pKeyPoint.code = `
DXC.onSyscall( "unlink", {file:/${libName}$/}, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
            case 'mmap':
                // FS delete
                pKeyPoint.code = `
// lookup the path associated to the FD on mmap syscall
DXC.onMemoryMapping(  {file:/${libName}$/}, (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
        }
        return pKeyPoint;
    }

    private generateForFunction( pFunc:ModelFunction, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        let code:string ="";
        const hm:HookManager = this.mgr.getProject().getHookManager();
        const probe = hm.getProbe( pKeyPoint.getFirstNode() as ModelFunction);

        switch(pOptions.getConditionName()){
            case 'bef':
            case 'aft':
                /*if(probe == null){
                    hm.createNativeFunctionHook( pKeyPoint.getFirstNode() as ModelFunction, {loadKP:  pKeyPoint.getAncestor() });
                }*/

                code =  `/* TODO *//*@@__CONTENT__@@*/`;
                break
            case 'dlsym':
                code = `
DXC.onDlSymOf( "${pFunc.getSymbol()}", (vMod)=>{
     /*@@__CONTENT__@@*/
});
                `;
                break
        }
        pKeyPoint.code = code;
        return pKeyPoint;
    }

    /**
     *
     * @param pKeyPoint
     * @param pOptions
     */
    generate( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint{

        // get node associated to the key point
        const target:any = this.getTargetNode(pKeyPoint);
        const hmopts:any = this.mgr.getProject().getHookManager().options;
        const targetUID = (target.hasOwnProperty('uid')? target.uid : target.getUID());
        let analDB:any =  this.mgr.getProject().getAnalyzer();
        const obj =  analDB.searchNode(
                                        target.__,
                                        targetUID
                                    );


        if(obj==null){
            Logger.error("[KEY POINT GENERATOR] Node associated to the target cannot be found (type="+target.__+", uid="+targetUID+")");
            throw KeyPointManagerException.GENERATOR_ERROR_NODE_NOT_FOUND(target.__,targetUID);
            return pKeyPoint;
        }

        switch (target.__) {
            case NodeInternalType.FILE:
                this.generateForFile( obj as ModelFile, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.PACKAGE:
                this.generateForPackage( obj as ModelPackage, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.CLASS:
                this.generateForClass( obj as ModelClass, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.METHOD:
                this.generateForMethod( obj as ModelMethod,pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.FIELD:
                this.generateForField( obj as ModelField,pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.FUNC:
                this.generateForFunction( obj as ModelFunction,pKeyPoint, pOptions, hmopts);
                break;
        }

        pKeyPoint.token = this.generateToken( obj, pKeyPoint, pOptions.getConditionName());

        return pKeyPoint;
    }
}