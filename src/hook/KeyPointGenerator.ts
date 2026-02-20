import KeyPoint, { KeyPointOptions } from "./KeyPoint.js";
import KeyPointManager from "./KeyPointManager.js";
import ModelFile from "../ModelFile.js";
import {NodeInternalType, Nullable}
    from "@dexcalibur/dxc-core-api";;
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
import {RuntimeEventType} from "./RuntimeEvent.js";
import {Tag, TagUUID} from "@dexcalibur/dexcalibur-orm";
import NativeFunctionHook from "./NativeFunctionHook.js";
import {MetadataTopic, MetadataType} from "../audit/common/Metadata.js";

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
 * Options to create key point instance
 * @interface
 */
export interface KeyPointOptionsOptions {
    parent?:string;
    token?:string;
    weight?:number;
    descr?:string;
    condition?:string;
    name?:string;
    cname?:string;
    keypointType?:RuntimeEventType;
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

    tags:Record<string, Tag> = {};

    constructor(pKeyPointMgr:KeyPointManager) {
        this.mgr = pKeyPointMgr;
    }

    initTags():void {
        if(this.mgr==null){
            throw new Error("KeyPointGenerator: Invalid KeyPointManager instance : cannot be null");
        }
        const tm = this.mgr.getProject().getTagManager();
        this.tags["executable"] = tm.getTag("data.type.executable");
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
            default:
                return `@@__KP::CUSTOM::${pKeyPoint.getName()}_${pEvent}__@@`;
        }
    }

    private generateForField( pField:ModelField, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):KeyPoint {
        let code:string  = "";
        let cond = pKeyPoint.getCondition() ?? pOptions.condition;

        switch(cond){
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

    private async generateForMethod( pMeth:ModelMethod, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):Promise<KeyPoint> {
        let code:string = "";
        let project:DexcaliburProject = this.mgr.getProject();
        let hm:HookManager = project.getHookManager();
        let hook:AbstractHook = null;

        let cond = pKeyPoint.getCondition() ?? pOptions.condition
        switch(cond){
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
                    hook = await hm.createJavaMethodHook(pMeth);
                }

                // before method call
                //pKeyPoint.
                await hook.addExtraFragment( HOOK_FRAGMENT_POS.BEFORE, new HookTemplateFragment({
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
                    hook = await hm.createJavaMethodHook(pMeth);
                }

                // before method call
                //pKeyPoint.
                await hook.addExtraFragment( HOOK_FRAGMENT_POS.AFTER, new HookTemplateFragment({
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

        let cond = pKeyPoint.getCondition() ?? pOptions.condition

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

        switch(cond){
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
        let cond = pKeyPoint.getCondition() ?? pOptions.condition
        switch(cond){
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
        let cond = pKeyPoint.getCondition() ?? pOptions.condition

        switch(cond){
            case 'load':

                if(!this.tags.executable.match(pFile)){
                    Logger.error("[KEY POINT GENERATOR] Warning : File '"+libName+"' is not an executable file. Keypojnt could be bugged");
                }

                // JNI Onload if native lib
                // DexClassLoader if dex file, ...
                pKeyPoint.description = "This point is trigged when the lib '"+libName+"' before the JNI entrypoint of a JNI libary is called.";
                pKeyPoint.code = `DXC.kp.JniLoad("${libName}");\n`;

                /*else if (lib.hasExt("dex")){
pKeyPoint.code = `
DXC.keypoint.JniLoad("${libName}");
Interceptor.attach(
    Process.findModuleByName("${libName}").findExportByName("JNI_Onload"),
    {
        onEnter:function(args){
            DXC.JVM["${libName}"] = args[0];
        },
        onLeave:function(args){
            ///@@__CONTENT__@@
        }
    }
);
`;
                }*/

                // else if()
                // pKeyPoint.code = "Interruptor.newAgent({ @@__CONTENT__@@ }).startOnLoad('"+lib+"')";
                break
            case 'link':

                if(!this.tags.executable.match(pFile)){
                    Logger.error("[KEY POINT GENERATOR] Warning : File '"+libName+"' is not an executable file. Keypojnt could be bugged");
                }
                // if no instruction hook are enabled, then use only linker64 hook
                pKeyPoint.description = "This point is trigged when the lib '"+libName+"' is linked by the dynamic linker.";
                if(!this.mgr.hasActiveInstructionHook()){
                    // add a function to the list callback executed on load
                    //pKeyPoint.code = `__:function(vMod){ /*@@__CONTENT__@@*/ },`;

                    pKeyPoint.code = `DXC.kp.DynLink("${libName}",0);\n`;
                }else{
                    // use interruptor + onStart()
                    pKeyPoint.require("interruptor/LinuxArm64");
                    //pKeyPoint.code = `onStart: function(vMod){ /*@@__CONTENT__@@*/ }`;
                    pKeyPoint.code = `DXC.kp.DynLink("${libName}",0);\n`;
                }
                break
            case 'dlo':

                //if(this.isStalkerReady()){

                pKeyPoint.description = "This point is trigged when the lib '"+libName+"' is opened using dlopen for the first time. ";
                pKeyPoint.code = `DXC.kp.DlOpen("${libName}",0);\n`;

                /*
                    pKeyPoint.code = `
DXC.onDlOpenOf( /${libName}/, (vMod)=>{
     /*@@__CONTENT__@@
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

    private async _generateForFunction( pFunc:ModelFunction, pKeyPoint:KeyPoint, pOptions:KeyPointOptions, pHookOpts:any):Promise<KeyPoint> {

        let cond = pKeyPoint.getCondition() ?? pOptions.condition

        if(cond=="dlsym"){
            pKeyPoint.code = `DXC.kp.DlSym( "${pFunc.getSignature()}","${pFunc.getSymbol()}");\n`;
            return pKeyPoint;
        }

        let code:string ="";
        let ancestor = pKeyPoint.getAncestor();
        const hm:HookManager = this.mgr.getProject().getHookManager();
        const hooks = hm.findHookByNode(pFunc) as NativeFunctionHook[];

        if(hooks.length == 0){
            hooks.push(
                await hm.createNativeFunctionHook(
                    pKeyPoint.getFirstNode() as ModelFunction,
                    { loadKP:  ancestor })
            );
        }

        switch(cond){
            case 'bef':
                if(hooks[0].getBefore().filter( x => x.name == "kp-before").length == 0){
                    hooks[0].addExtraFragment(
                        HOOK_FRAGMENT_POS.BEFORE,
                        new HookTemplateFragment({
                            name: `kp-before`,
                            description: `Before KeyPoint`,
                            template: `DXC.kp.trigger("before-fn-${pKeyPoint.getVirtualID()}", { @@__HOOK_ID__@@, @@__FRAG_ID__@@, @@__FUZZ_CASEID__@@ });`,
                            metadata: [{
                                type: MetadataType.ANY,
                                key:  MetadataTopic.KP,
                                value: { kp: pKeyPoint.getUID() }
                            }]
                        })
                    )
                }

                pKeyPoint.code  = `DXC.kp.Before("fn-${pKeyPoint.getVirtualID()}");\n`;
                return pKeyPoint;
            case 'aft':
                if(hooks[0].getBefore().filter( x => x.name == "kp-after").length == 0){
                    hooks[0].addExtraFragment(
                        HOOK_FRAGMENT_POS.BEFORE,
                        new HookTemplateFragment({
                            name: `kp-after`,
                            description: `After KeyPoint`,
                            template: `DXC.kp.trigger("after-fn-${pKeyPoint.getVirtualID()}", { @@__HOOK_ID__@@, @@__FRAG_ID__@@, @@__FUZZ_CASEID__@@ });`,
                            metadata: [{
                                type: MetadataType.ANY,
                                key:  MetadataTopic.KP,
                                value: { kp: pKeyPoint.getUID() }
                            }]
                        })
                    )
                }

                pKeyPoint.code  = `DXC.kp.After("fn-${pKeyPoint.getVirtualID()}");\n`;
                return pKeyPoint;
            case 'dlsym':
                pKeyPoint.code = `DXC.kp.DlSym( "${pFunc.getSignature()}","${pFunc.getSymbol()}");\n`;
                return pKeyPoint;
        }

        throw KeyPointManagerException.CONDITION_NOT_SUPPORTED(cond)
    }

    /**
     *
     * @param pKeyPoint
     * @param pOptions
     */
    async generate( pKeyPoint:KeyPoint, pOptions:Nullable<KeyPointOptions> = null):Promise<KeyPoint>{

        // get node associated to the key point
        const target:INode = this.getTargetNode(pKeyPoint);
        const hmopts:any = this.mgr.getProject().getHookManager().options;
        const targetUID = target.getUID(); // (target.hasOwnProperty('uid')? target.uid : target.getUID());
        let analDB:any =  this.mgr.getProject().getAnalyzer();
        //const obj =  analDB.searchNode(target.__,  targetUID  );


        if(target==null){
            Logger.error("[KEY POINT GENERATOR] Node associated to the target cannot be found (type="+target.__+", uid="+targetUID+")");
            throw KeyPointManagerException.GENERATOR_ERROR_NODE_NOT_FOUND(target.__,targetUID);
        }

        switch (target.__) {
            case NodeInternalType.FILE:
                this.generateForFile( target as ModelFile, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.PACKAGE:
                this.generateForPackage( target as ModelPackage, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.CLASS:
                this.generateForClass( target as ModelClass, pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.METHOD:
                await this.generateForMethod( target as ModelMethod,pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.FIELD:
                this.generateForField( target as ModelField,pKeyPoint, pOptions, hmopts);
                break;
            case NodeInternalType.FUNC:
                pKeyPoint = await this._generateForFunction( target as ModelFunction,pKeyPoint, pOptions, hmopts);
                break;
        }

        pKeyPoint.token = this.generateToken( target, pKeyPoint, pKeyPoint.getCondition() ?? pOptions.condition);

        return pKeyPoint;
    }
}