import * as fs from "fs";
import * as Path from "path";
import {ModelFunction} from "../ModelFunction.js";
import KeyPoint from "./KeyPoint.js";
import KeyPointManager, {DEOPT_TYPE} from "./KeyPointManager.js";
import NativeFunctionHook from "./NativeFunctionHook.js";
import {HookManager} from "./HookManager.js";
import {HookScriptBuilderException} from "../errors/HookScriptBuilderException.js";
import {AbstractHook} from "./AbstractHook.js";
import * as Log from "../Logger.js";
import {KeyPointOptions} from "./KeyPointGenerator.js";
import Util from "../Utils.js";
import {ScriptBuilderOptions, ScriptWriterOptions, TargetLanguage} from "./common.js";
import {IStringIndex} from "@dexcalibur/dexcalibur-orm";
import HookPrologue from "../HookPrologue.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface KeyPointTagMap {
    [tag:string] :KeyPoint;
}

export default class HookScriptBuilder {

    private version = "1.0.0";

    private target: TargetLanguage = TargetLanguage.TS;

    private requires:string[] = [];

    private _hm:HookManager;

    constructor( pHookManager:HookManager) {
        this._hm = pHookManager;
    }

    changeTargetLanguage(pTarget:TargetLanguage):void {
        this.target = pTarget;
    }

    getLanguage():TargetLanguage {
        return this.target;
    }

    isTS(){
        return (this.target===TargetLanguage.TS);
    }

    private async _isDynamicLoadingRequired( pHooks:NativeFunctionHook[]):Promise<boolean>{
        let f = false;
        for(let i=0; i<pHooks.length ; i++){
            if(this._hm.hasKeyPointAncestor(await pHooks[i].getKeyPoint(), "core.native.dl.load")){
                f = true;
            }
        }
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
        "${pHook.getTarget().getSymbol()}":function (vMod${this.isTS()?':any':''}){
            ${this._writeNativeHook("vMod", pHook)}
        }${c<m ? ',':''}            
`;
        })

        return code;
    }

    // InstructionHook
     async _writeNativeLib( pLibraryName:string, pFuncs:NativeFunctionHook[], pInstrs:any[] = null):Promise<string> {

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
    __dynamic__:${ await this._isDynamicLoadingRequired(pFuncs)},
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
                req += fs.readFileSync(Path.join(Util.__dirname(import.meta.url),"requires",this.requires[i]+".js"));
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
    async buildNestedScript( pKeyPoints:KeyPoint[], pOptions:ScriptWriterOptions ):Promise<IStringIndex<string>>{

        const maps:IStringIndex<string> = {};
        let vKP:KeyPoint;


        for(let i=0; i<pKeyPoints.length; i++){

            vKP = pKeyPoints[i];

            // get hook loaded by this KP
            const hk = this._hm.getHookByLoadKeyPoint(vKP); // this._hm.getHookByKeyPoint( vKP);

            if(vKP.getUID()!="core.java.app"){
                console.log("getHookByLoadKeyPoint("+vKP.getUID()+")", hk);
            }

            // skip keypoints without child
            if(hk.length == 0){
                continue;
            }

            // generate code for each hook to load from this key point and concatenate it
            let s = "";
            hk.map( (vHook:AbstractHook) => {

                // skip disabled hooks
                if(!vHook.isEnable()) return;

                let gc:string = vHook.getGeneratedCode();
                if(gc == null || pOptions.flushGeneratedCode || gc.length==0 || vHook.hasVariables()){
                    vHook.setContext(this._hm.context);
                    vHook.build(pOptions.targetLanguage);
                    gc = vHook.getGeneratedCode();
                }

                s += "\n"+gc+"\n";
            });

            // TODO : generate code for child key point

            //Logger.debug("[HOOK SCRIPT BUILDER] buildNestedScript: \n"+s)

            //try{
            // if the keypoint template has been never generated, create it :
            if(!vKP.isTemplateReady()){
                await this._hm.getKeyPointManager().generate(vKP, new KeyPointOptions({
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
                const m = await  this.buildNestedScript(vKP.getChildrenKeyPoints(),pOptions);
                for(const token in m)  maps[token] = m[token];
            }

            maps[vKP.getToken()] = gen;
        }


        return maps;
    }

    /**
     *
     * @param pScript
     * @param pOptions
     * @private
     */
    private _appendInternals( pScript:string, pOptions:any = null):string {
        if(this.isTS()){
            pScript += "\nimport * as _dxc_ from './lib/index.android.arm64.js'; const DXC = _dxc_.newDxcAgent(";
            if(pOptions != null) pScript += "\n"+JSON.stringify(pOptions);
            pScript += ");\n";
        }else{
            pScript += "\nvar DXC = require('./lib/dxc-agent.android.arm64.min.js').newDxcAgent(";
            if(pOptions != null) pScript += "\n"+JSON.stringify(pOptions);
            pScript += ");\n";
        }


        return pScript;
    }

    /**
     * To append all prologues from enabled inspectors
     * to the current script
     *
     * @param {string} pScript The Frida script
     * @param {HookPrologue[]} pPrologues Prologues to append
     * @returns {string} Updated frida script
     * @private
     */
    private _appendPrologues( pScript:string, pPrologues:HookPrologue[]):string {
        pPrologues.map((vP)=>{
            pScript += vP.buildScript()+"\n";
        });

        return pScript;
    }

    private _appendRequirements( pScript:string,  pRequires:string[]):string {
        if(this.isTS()){
            pScript += "let DXC_LIB:any = {};\n";
        }else{
            pScript += "var DXC_LIB = {};\n";
        }

        pRequires.map( (vReq:string)=>{
           const p = vReq.split("/");
           switch(p[0]){
               case "interruptor":
                   if(p[1] != null){
                       if(this.isTS()){
                           pScript += `
import * as _${p[0]}_ from "${p[0]}";
DXC_LIB['${p[0].toUpperCase()}'] = (_${p[0]}_ as any).${p[1]}.apply(${p[2]!=null ? p[2]:''});`
                       }else{
                           pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}").${p[1]}( ${p[2]!=null ? p[2]:''});`
                       }

                   }else{
                       if(this.isTS()){
                           pScript += `
import * as _${p[0]}_ from "${p[0]}";
DXC_LIB['${p[0].toUpperCase()}'] = (_${p[0]}_ as any);`
                       }else{
                           pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}");`
                       }
                   }
                   break;
               // JNI, frida-systruc, frida-fs, ...
               default:
                   if(this.isTS()){
                       pScript += `
import * as _${p[0]}_ from "${p[0]}";
DXC_LIB['${p[0].toUpperCase()}'] = (_${p[0]}_ as any);`
                   }else{
                       pScript += `
const DXC_LIB.${p[0].toUpperCase()} = require("${p[0]}");`
                   }
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
     *
     * It is the top-level function of hook script generation unit.
     *
     * @method
     */
    async build(pOptions:ScriptBuilderOptions = {}):Promise<string>{
        let script = "";

        Logger.info("[HOOK SCRIPT BUILDER] Build : start ... \n");
        const kpm:KeyPointManager  =  this._hm.getKeyPointManager();
        const topl_kps:KeyPoint[] = await kpm.getTopLevelKeyPoints();

        console.log("Top KPs : ",topl_kps);

        const leaf_kps:KeyPoint[] = await kpm.getLeafKeyPoints();
        const req:any = await kpm.getGlobalRequirements();
        const deopt:DEOPT_TYPE = await  kpm.needDeoptimize();
        //Logger.info("[HOOK SCRIPT BUILDER] Build : before _appendInternals: \n");

        script = this._appendInternals( script);

        //Logger.info("[HOOK SCRIPT BUILDER] Build : _appendInternals: \n"+script);

        // append top level requirements
        if(req.length > 0){
            script = this._appendRequirements( script, req)+"\n";
            //Logger.info("[HOOK SCRIPT BUILDER] Build : _appendRequirements: \n"+script);
        }

        // append prologues
        const prologues = await this._hm.getPrologues();
        if(prologues.length>0){
            script = this._appendPrologues( script, prologues)+"\n";
            //Logger.info("[HOOK SCRIPT BUILDER] Build : _appendPrologues: \n"+script);
        }

        // detect if deoptimizing is required
        if((await kpm.getKeyPointByAttr({ name:'core.java.boot' })).hasNodes()){
            script = this._appendDeoptimize( script, deopt);
            //Logger.info("[HOOK SCRIPT BUILDER] Build : _appendDeoptimize: \n"+script);
        }

        pOptions.targetLanguage = this.target;

        // process top-level key point
        const tokens = await this.buildNestedScript(topl_kps, pOptions as ScriptWriterOptions);
        console.log(tokens);

        topl_kps.map( (vKP:KeyPoint) => {

            console.log(" KP >> ",vKP.enabled,vKP.getCodeCache(),vKP);
            if(vKP.getCodeCache() != null && vKP.enabled){
                script += `\n// =======================\n// KeyPoint : ${vKP.getName()} \n// ======================= \n ${vKP.getCodeCache()}\n`;
                //Logger.info("[HOOK SCRIPT BUILDER] Build : top KP : \n"+script);
            }
        });

        if(script != null){
            for(const uid in tokens){
                do{
                    script = script.replace(uid as string,tokens[uid] as string);
                }while(script.indexOf(uid)>-1);
            }
        }


        //Logger.debug("[HOOK SCRIPT BUILDER] Build : token replace: \n"+script);
        //Logger.info("[HOOK BUILDER : output :] \n "+script);

        return script;
    }
}