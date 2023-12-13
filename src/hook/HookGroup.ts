import HookPrologue from "../HookPrologue.js";
import DexcaliburProject from "../DexcaliburProject.js";
import * as Log from '../Logger.js';
import HookStrategy from "../hook/HookStrategy.js";
import {AbstractHook} from "../hook/AbstractHook.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "../NodeInternalType.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * @class
 */
export default class HookGroup
{
    static TYPE:NodeType = new NodeType( "hook_group", NodeInternalType.HOOK_GROUP, []);

    __:NodeInternalType = NodeInternalType.HOOK_GROUP;

    id:string = null;
    name:string = null;
    description:string = null;

    prologue:HookPrologue = null;



    /**
     * Flag. Builtin hookgroup are defined by inspectors.
     *
     * @type {boolean}
     * @field
     * @since 1.0.0
     */

    tags:any = {
        builtin: false
    };

    hooks:AbstractHook[] = [];

    context:DexcaliburProject = null;
    enable:boolean = false;
    requires:string[] = [];
    color:any = null;
    share:any = null;

    strats:HookStrategy[] = [];

    /**
     * Group of hook
     *
     * @param {*} config
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    isEnable():boolean{
        return this.enable;
    }

    getID():string{
        return this.id;
    }

    injectContext(context:DexcaliburProject):HookGroup{
        this.context = context;

        // forward to the prologue
        if(this.prologue!=null)
            this.prologue.context = this.context;

        // register the hookset to the HookManager
        //this.context.hook.registerHookSet(this);

        return this;
    }

    addPrologue(code:string):HookGroup{
        //this.prologue = code;
        this.prologue = new HookPrologue({
            parentID: this.id,
            script: code
        });

        return this;
    }

    require(module:string){
        this.requires.push(module);
    }
    /*
    requireNodeModule(module){
        this.requiresNode.push(module);
    }*/
    /**
     * Create a object shared with others hook callback
     * @param {Object} config Shared object config
     */
    addHookShare(config:any):HookGroup{
        this.share = config;
        return this;
    }


    /**
     * Get the shared object from this hookset
     * @returns {Object} Shared object
     * @function
     */
    getHookShare():any{
        return this.share;
    }

}
