import * as fs from "fs";
import * as Path from "path";
import {ModelFunction} from "../ModelFunction";
import KeyPoint from "./KeyPoint";
import KeyPointManager, {DEOPT_TYPE} from "./KeyPointManager";
import NativeFunctionHook from "./NativeFunctionHook";
import {HookManager} from "./HookManager";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException";
import {AbstractHook} from "./AbstractHook";
import * as Log from "../Logger";
import {KeyPointOptions} from "./KeyPointGenerator";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface KeyPointTagMap {
    [tag:string] :KeyPoint;
}
export default class HookScriptBuilder {

    private requires:string[] = [];

    private _hm:HookManager;

    constructor( pHookManager:HookManager) {
        this._hm = pHookManager;
    }

    private _isDynamicLoadingRequired( pHooks:NativeFunctionHook[]){
        let f = false;
        pHooks.map( (pNatHook)=>{
            if(this._hm.hasKeyPointAncestor(pNatHook.getKeyPoint(), "core.native.dl.load")){
                f = true;
            }
        });
        return f;
    }

    /**
     *
     * @param pModuleVar
     * @param pHook
     * @private
     */
    private _writeNativeFuncLocation( pModuleVar:string, pHook:NativeFunctionHook):string {
        if(pHook.isTargetExportedSymbol()){
            return `${pModuleVar}.findExportByName("${pHook.getTarget().getSymbol()}")`;
        }
        else if(pHook.isTargetStaticOffset()){
            return `${pModuleVar}.base.add(${pHook.getTarget()})`;
        }
        else if(pHook.isTargetLocalSymbol()){
            return `DXC_TOOL.findLocalSymbol(${pModuleVar}, "${pHook.getTarget().getSymbol()}")`;
        }
        else if(pHook.isTargetByPointer()){
            if(typeof pHook.getTarget() === "number"){
                return `ptr(${pHook.getTarget()})`;
            }else{
                return `ptr(${(pHook.getTarget() as ModelFunction).getAddr()})`;
            }
        }
        else if(pHook.isRawTarget()){
            return pHook.getTarget();
        }else{
            throw HookScriptBuilderException.UNTARGETABLE_NATIVE_HOOK();
        }
    }

    /**
     *
     * @param pHook
     * @private
     */
    private _writeNativeHook( pModuleVar:string, pHook:NativeFunctionHook):string {

        let onEnter = "", onLeave = "";


        let s = `
            Interceptor.attach(${this._writeNativeFuncLocation(pModuleVar,pHook)}, {
                
                onEnter: function(args){
                    var s = args[0].readCString();
                    this.p = ((s==null || s.length==0) ? '<self>' : s);
                },
                onLeave: function(ret){
                    if(DL[""+ret]==null){
                        DL[""+ret] = this.p;
                    }
                    if(LOG_BIN) console.log("libc > dlopen > "+ret+" ("+DL[""+ret]+")");
                }
            });
        `;

        return s;
    }

    private _writeNativeHookDeclaring(pFuncs:NativeFunctionHook[]): string {
        let code:string = "\n";
        let c = 0, m = pFuncs.length-1;
        pFuncs.map( (pHook:NativeFunctionHook)=>{
            code += `
        "${pHook.getTarget().getSymbol()}":function (vMod){
            ${this._writeNativeHook("vMod", pHook)}
        }${c<m ? ',':''}            
`;
        })

        return code;
    }

    // InstructionHook
     _writeNativeLib( pLibraryName:string, pFuncs:NativeFunctionHook[], pInstrs:any[] = null):string {

        if( pInstrs != null){
            return `
Interruptor.newAgent({ 
    /*@@__CONTENT__@@*/ 
}).startOnLoad('${pLibraryName}');
        `;
        }else{
            return `
DXC.HOOK["${pLibraryName}"] = {
    __mod: null,
    __dynamic__:${this._isDynamicLoadingRequired(pFuncs)},
    __hook: {
        @@__FUNC_HOOKS__@@
    }
}
        `;
        }


    }


    /**
     * To add a required JS library (declared into 'requires' folder)
     *
     * @param {string[]} requires
     * @method
     */
    addRequires(requires:string[]):void{
        for(let i=0; i<requires.length; i++){
            if(this.requires.indexOf(requires[i])==-1){
                this.requires.push(requires[i]);
            }
        }
    }

    /**
     * To remove specific JS libraries from libraries required.
     *
     * @param {*} requires
     * @method
     */
    removeRequires(requires:string[]):void{
        let offset=-1;
        for(let i=0; i<requires.length; i++){
            offset = this.requires.indexOf(requires[i]);
            if(offset>-1) this.requires[offset] = null;
        }
    }

    /**
     * To insert required modules into the generated Frida script
     *
     *
     * @method
     */
    prepareRequires():string{
        let req:any = "", loaded:any = {};
        for(let i=0; i<this.requires.length; i++){
            if(this.requires[i]!=null && loaded[this.requires[i]]==null){
                req += fs.readFileSync(Path.join(__dirname,"requires",this.requires[i]+".js"));
                loaded[this.requires[i]] = true;
            }
        }

        return req;
    }

    /**
     * To generate script for all keypoints with the same parent
     *
     * @param pKeyPoints
     */
    buildNestedScript( pKeyPoints:KeyPoint[] ){

        const maps = {};

        // for each keypoints
        pKeyPoints.map( (vKP:KeyPoint)=>{

            // get hook loaded by this KP
            const hk = this._hm.getHookByLoadKeyPoint(vKP); // this._hm.getHookByKeyPoint( vKP);

            // skip keypoints without child
            if(hk.length == 0){
                return ;
            }

            // generate code for each hook to load from this key point and concatenate it
            let s = "";
            hk.map( (vHook:AbstractHook) => {
                let gc:string = vHook.getGeneratedCode();
                if(gc == null || gc.length==0){
                    vHook.build(this._hm.context);
                    gc = vHook.getGeneratedCode();
                }

                s += "\n"+gc+"\n";
            });

            // TODO : generate code for child key point

            Logger.info("[HOOK SCRIPT BUILDER] buildNestedScript: \n"+s)

            //try{
                // if the keypoint template has been never generated, create it :
                if(!vKP.isTemplateReady()){
                    this._hm.getKeyPointManager().generate(vKP, new KeyPointOptions({
                        condition: vKP.getCondition()
                    }));
                    // TODO : backup/save
                }

                // merge code loading hooks with key point template
               const gen = vKP.generateCode(s);
           /* }catch(e){
                this._hm.getKeyPointManager().generate(vKP, new KeyPointOptions({
                    condition: vKP.getCondition()
                }));
            }*/


            if(vKP.hasChildrenKeyPoints()){
                const m = this.buildNestedScript(vKP.getChildrenKeyPoints());
                for(const token in m)  maps[token] = m[token];
            }

            maps[vKP.getToken()] = gen;
        });

        return maps;
    }

    /**
     *
     * @param pScript
     * @param pOptions
     * @private
     */
    private _appendInternals( pScript:string, pOptions:any = null):string {
        pScript += "\nvar DXC = require('../dist/dxc-agent.android.arm64.min.js').newDxcAgent(\n";
        if(pOptions != null) pScript += JSON.stringify(pOptions);
        pScript += ");\n";

        return pScript;
    }


    private _appendRequirements( pScript:string,  pRequires:string[]):string {
        pRequires.map( (vReq:string)=>{
           const p = vReq.split("/");
           switch(p[0]){
               case "interruptor":
                   if(p[1] != null){
                       pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}").${p[1]}( ${p[2]!=null ? p[2]:''});`
                   }else{
                       pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}");`
                   }
                   break;
               // JNI, frida-systruc, frida-fs, ...
               default:
                   pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}");`
                   break;
           }
        });

        return pScript;
    }

    /**
     *
     * @param pScript
     * @param pDeoptType
     * @private
     */
    private _appendDeoptimize( pScript:string, pDeoptType:DEOPT_TYPE):string {
        switch (pDeoptType){
            case DEOPT_TYPE.ALL:
                pScript += `
Java.deoptimizeEverything();`
                break;
            case DEOPT_TYPE.BOOT:
                pScript += `
Java.deoptimizeBoot();`
                break;
        }
        return pScript;
    }


    /**
     * To build Frida's agent script
     */
    build(){
        let script = "";

        Logger.info("[HOOK SCRIPT BUILDER] Build : start ... \n");
        const kpm:KeyPointManager  =  this._hm.getKeyPointManager();
        const topl_kps:KeyPoint[] = kpm.getTopLevelKeyPoints();
        const leaf_kps:KeyPoint[] = kpm.getLeafKeyPoints();
        const req:any = kpm.getGlobalRequirements();
        const deopt:DEOPT_TYPE = kpm.needDeoptimize();
        Logger.info("[HOOK SCRIPT BUILDER] Build : before _appendInternals: \n");

        script = this._appendInternals( script);

        Logger.info("[HOOK SCRIPT BUILDER] Build : _appendInternals: \n"+script);
        // append top level requirements
        if(req.length > 0){
            script = this._appendRequirements( script, req)+"\n";
            Logger.info("[HOOK SCRIPT BUILDER] Build : _appendRequirements: \n"+script);
        }

        // detect if deoptimizing is required
        if(kpm.getKeyPoint('core.java.boot').hasNodes()){
            script = this._appendDeoptimize( script, deopt);
            Logger.info("[HOOK SCRIPT BUILDER] Build : _appendDeoptimize: \n"+script);
        }

        // process top-level key point
        const tokens = this.buildNestedScript(topl_kps);

        topl_kps.map( (vKP:KeyPoint) => {
            script += `\n// =======================\n// KeyPoint : ${vKP.getName()} \n// ======================= \n ${vKP.getCodeCache()}\n`;
            Logger.info("[HOOK SCRIPT BUILDER] Build : top KP : \n"+script);
        });

        if(script != null){
            for(const uid in tokens){
                do{
                    script = script.replace(uid as string,tokens[uid] as string);
                }while(script.indexOf(uid)>-1);
            }
        }


        Logger.debug("[HOOK SCRIPT BUILDER] Build : token replace: \n"+script);
        Logger.info("[HOOK BUILDER : output :] \n "+script);

        return script;
    }
}