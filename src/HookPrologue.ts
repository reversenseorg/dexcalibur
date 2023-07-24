import DexcaliburProject from "./DexcaliburProject.js";
import {CryptoUtils} from "./CryptoUtils.js";
import {CoreDebug} from "./core/CoreDebug.js";


export default class HookPrologue
{
    parentID:string = null;
    script:string = null;
    builtScript:string = null;
    context:DexcaliburProject = null;

    /**
     * To configure and manage a static part of the hook code
     * shared by all hooks and where class are searched.
     * Each hook set can define one custom prologue and several dependencies.
     *
     *
     * @param {*} config
     */
    constructor(pConfig:any = null){
        if(pConfig != null){
            for(let i in pConfig)
                this[i]=pConfig[i];
        }
    }

    /**
     * To check if the prologue is enable or not.
     * It is disabled when the parent is disabled
     *
     * @return {Boolean} Returns TRUE if enabled, else FALSE
     * @function
     */
    isEnable():boolean{
        for(let i in this.context.hook.hooksets)
            console.log(i,this.parentID);

        return this.context.hook.getHookSet(this.parentID).isEnable();
    }

    /**
     * To build the prologue Frida script
     *
     * In order to differentiate several prologues and avoid
     * conflicts, the @@__CTX__@@ token will be replaced by the hash
     * of the parent HookSet.
     *
     * @function
     */
    buildScript():void{
        let script:string=this.script;
        let tags:any = {
            "@@__CTX__@@": "ctx_"+CryptoUtils.md5(this.parentID)
        };

        for(let i in tags){
            do{
                script = script.replace(i,tags[i]);
            }while(script.indexOf(i)>-1);
        }

        this.builtScript = script;
    }

    /**
     * To inject dependencies into HookPrologue
     *
     * @param {DexcaliburProject} ctx The context of the project
     * @function
     */
    injectContext(ctx:DexcaliburProject){
        this.context = ctx;
        this.buildScript();
        return this;
    }

    /**
     * @method
     */
    toJsonObject():any{
        let o:any = new Object();
        o.parentID = this.parentID;
        o.script = this.script;
        CoreDebug.checkJsonSerialize(o, "HookPrologue");
        return o;
    }


}
