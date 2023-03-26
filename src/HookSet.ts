import HookPrologue from "./HookPrologue.js";
import DexcaliburProject from "./DexcaliburProject.js";
import Hook from "./Hook.js";
import {HookManager} from "./hook/HookManager.js";
import * as Log from './Logger.js';
import HookPrimitive from "./HookPrimitive.js";
import HookStrategy from "./hook/HookStrategy.js";
import {AbstractHook} from "./hook/AbstractHook.js";
import {NodeType} from "./persist/orm/NodeType.js";
import {NodeInternalType} from "./NodeInternalType.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * A hook set contains all hooking strategies for a given inspector.
 *
 * Draft : The hook set contains all hook fragments resulting from execution of all associated hook strategies.
 * As one hook set can have several hook strategies, it can contain very different hooks
 *
 * All hook from a hook set can share dependencies :
 * - internal/external modules
 * - prologue
 *
 * A `prologue` is a piece of code required by one or several hook fragments from a same hook set.
 *
 * @class
 */
export default class HookSet
{
    static TYPE:NodeType = new NodeType( "hook_set", NodeInternalType.HOOK_SET, []);

    __:NodeInternalType = NodeInternalType.HOOK_SET;

    id:string = null;
    name:string = null;
    description:string = null;
    category:string = null;
    prologue:HookPrologue = null;
    native = false;

    /**
     * Flag. Dynamic hookset are deployed at runtime if condition is verified.
     *
     * @type {boolean}
     * @field
     * @since 1.0.0
     */
    dynamic = false;


    /**
     * Flag. Builtin hookset are defined by builtin inspectors.
     *
     * @type {boolean}
     * @field
     * @since 1.0.0
     */
    builtin = false;

    // TODO : Merge probes and intercepts
    /**
     * @deprecated
     */
    intercepts:HookPrimitive[] = [];

    /**
     * @deprecated
     */
    probes:HookPrimitive[] = [];

    hooks:AbstractHook[] = [];

    /**
     * The context
     *
     * @type {DexcaliburProject}
     * @field
     * @public
     */
    context:DexcaliburProject = null;

    enable = false;

    /**
     * The list of internal dexcalibur modules or external libraries required by the hookset
     */
    requires:string[] = [];

    color:any = {};

    /**
     * This object contains every variables shared by hooks from this hook set into final agent script
     *
     * @field
     * @public
     */
    share:any = {};

    /**
     * The list of hook strategies defined into this hook set.
     *
     * Every hook strategies will try to generate hook fragments which will be merged into hook.
     *
     * @field
     * @type {HookStrategy[]}
     * @public
     */
    strats:HookStrategy[] = [];

    /**
     * Group of hook
     *
     * @param {any} pConfig
     * @constructor
     */
    constructor(pConfig:any=null){

        // this.requiresNode = [];
        if(pConfig!=null)
            for(const i in pConfig)
                this[i] = pConfig[i];
    }

    /**
     * To check if the hook set is enable or not.
     *
     * TODO: check usage
     */
    isEnable():boolean{
        return this.enable;
    }

    /**
     * To get the UID of this hookset
     *
     * @return {string} UID
     * @method
     */
    getID():string{
        return this.id;
    }

    /**
     * To initialiaze the hooks but not execute it. It happens one time per app run even if hooks are not redeployed
     *
     * TODO : investigate passed flag for re-analyze feature
     *
     * It performs any actions not dependent of the target app :
     * - setting context
     * - update prologue context
     * - register this hook set into Hook Manager
     *
     * The Hook Manager can control this hook set only after this step
     *
     * @param {DexcaliburProject} context Project associated to this hook set
     * @return {HookSet} This instance
     * @method
     */
    injectContext(context:DexcaliburProject):HookSet{
        this.context = context;

        // forward to the prologue
        if(this.prologue!=null)
            this.prologue.context = this.context;

        // register the hookset to the HookManager
        //this.context.hook.addHookSet(this);
        this.context.hook.registerHookSet(this);

        return this;
    }

    /**
     *
     * @param code
     */
    addPrologue(code:string):HookSet{
        //this.prologue = code;
        this.prologue = new HookPrologue({
            parentID: this.id,
            script: code
        });

        return this;
    }

    /**
     * Add internal/external dependencies
     *
     * @param module
     */
    require(module:string):void{
        if(this.requires.indexOf(module)==-1){
            this.requires.push(module);
        }
    }
    /*
    requireNodeModule(module){
        this.requiresNode.push(module);
    }*/
    /**
     * Create a object shared with others hook callback
     *
     * @param {Object} config Shared object config
     */
    addHookShare(config:any):HookSet{
        this.share = config;
        return this;
    }
    /**
     * To get a strategy attached to ,this hook set by its name
     *
     * @param {string} pName
     * @return {HookStrategy}
     * @method
     * @since 1.0.0
     */
    getStrategyByName(pName:string):HookStrategy{
        for(let i=0; i<this.strats.length; i++){
            if(this.strats[i].getName()==pName){
                return this.strats[i];
            }
        }
        return null;
    }


    /**
     * Get the shared object from this hookset
     * @returns {Object} Shared object
     * @function
     */
    getHookShare():any{
        return this.share;
    }

    /**
     * @deprecated
     * @param probeConfig
     */
    addProbe(probeConfig:any):HookSet{
        let probe:HookPrimitive;

        if(probeConfig.method != null){
            if(typeof probeConfig.method != "string"){
                probe = null;
                for(let i=0; i<probeConfig.method.length; i++){
                    probe = new HookPrimitive(probeConfig);
                    probe.setMethod( probeConfig.method[i]);
                    this.probes.push( probe);
                }
            }else{
                probe = new HookPrimitive(probeConfig);
                probe.setMethod( probeConfig.method);
                this.probes.push( probe);
                //this.probes.push( new HookPrimitive(probeConfig));
            }
        }else{
            probe = new HookPrimitive(probeConfig);
            this.probes.push( probe);
        }
        return this;
    }

    /*
    addProbe(probeConfig){
        if(probeConfig.multiple_method != null){
            let probe = null;
            for(let i=0; i<probeConfig.multiple_method.length; i++){
                probe = new HookPrimitive(probeConfig);
                probe.setMethod( probeConfig.multiple_method[i]);
                this.probes.push( probe);
            }
        }else
            this.probes.push( new HookPrimitive(probeConfig));

        return this;
    }
    */
    addIntercept(interceptConfig:any):HookSet{
        if(interceptConfig.method == null && interceptConfig.raw == null){
            Logger.error("[HOOK MANAGER] addIntercept(): The method to hook is not defined");
            return null;
        }

        let primitive:HookPrimitive;

        if(interceptConfig.method !=null){
            if(typeof interceptConfig.method != "string"){
                for(let i=0; i<interceptConfig.method.length; i++){
                    primitive = new HookPrimitive(interceptConfig);
                    primitive.setMethod( interceptConfig.method[i]);
                    primitive.isIntercept = true;
                    primitive.color = this.color;

                    this.intercepts.push( primitive);
                }
            }else{
                primitive = new HookPrimitive(interceptConfig);
                primitive.isIntercept = true;
                primitive.setMethod( interceptConfig.method);
                primitive.color = this.color;

                this.intercepts.push( primitive);
            }
        }
        else{
            primitive = new HookPrimitive(interceptConfig);
            primitive.color = this.color;
            this.intercepts.push( primitive);
        }


        return this;
    }

    /**
     *
     * @param config
     * @deprecated
     */
    addCustomHook(config:any){
        if(config.method == null && config.raw == null){
            Logger.error("[HOOK MANAGER] addCustomHook(): The method to hook is not defined");
            return null;
        }

        let primitive:HookPrimitive;
        if(config.method !=null){
            if(typeof config.method != "string"){
                for(let i=0; i<config.method.length; i++){
                    //config.custom = true;
                    primitive = new HookPrimitive(config);
                    primitive.isIntercept = true;
                    primitive.isCustom = true;
                    primitive.setMethod( config.method);
                    primitive.color = this.color;

                    this.intercepts.push( primitive);
                }
            }else{
                //config.custom = true;
                primitive = new HookPrimitive(config);
                primitive.isIntercept = true;
                primitive.isCustom = true;
                primitive.setMethod( config.method);
                primitive.color = this.color;

                this.intercepts.push( primitive);
            }

        }
    }

    /*
    addSyscallProbe(probeConfig){
        this.native_probes.push( new HookPrimitive(probeConfig));
        return this;
    }
    addSyscallIntercept(probeConfig){
        this.native_intercepts.push( new HookPrimitive(probeConfig));
        return this;
    }*/
    /**
     * To disable all hooks of this set
     *
     * @method
     */
    disable(){
        const hookManager:HookManager = this.context.hook;

        if(this.prologue != null)
            hookManager.removePrologueOf(this);

        hookManager.removeHooksOf(this);
        this.enable = false;
    }

    /**
     * To add a strategy to this hook set
     *
     * @param {HookStrategy} pStrat
     * @return
     */
    addStrategy(pStrat:HookStrategy){

        if(pStrat.getUID()==null){
            pStrat.setUID(this.getID()+":"+pStrat.getName())
        }
        this.strats.push(pStrat);
    }

    /**
     * To deploy this hook set
     */
    deploy(){
        const hookManager:HookManager = this.context.hook;

        // if the hookset is already deployed only not deployed hooks are generated
        if(this.enable === false){
            hookManager.builder.addRequires(this.requires);
            //hookManager.addRequiresNode(this.requiresNode);

            if(this.prologue != null)
                hookManager.prologues.push(
                    this.prologue.injectContext(this.context)
                );
        }

        /*
        if(this.shares != null)
            hookManager.shares.push(
                this.prologue.injectContext(this.context)
            );
                */

        this.strats.map( (vStrat)=>{
            // generate hook templates
            vStrat.run(this.context);
        });


        this.enable = true;
    }

    /**
     * To attach an existing hook to the hook set
     *
     * @param {Hook} pHook
     */
    addHook(pHook: AbstractHook):void{
        this.hooks.push(pHook);
    }

    toJsonObject():any{
        const o:any = {};
        for(const i in this){
            switch(i){
                case "__":
                case "id":
                case "name":
                case "color":
                case "enable":
                case "description":
                case "builtin":
                case "dynamic":
                case "native":
                case "requires":
                case "share":
                case "category":
                    o[i] = this[i];
                    break;
                case "prologue":
                    if(this[i]!=null)
                        o[i] = this.prologue.toJsonObject();
                    else
                        o[i] = "";
                    break;
                case "probes":
                    o[i] = [];
                    for(let j=0;  j<this.probes.length; j++)
                        o[i].push(this[i][j].toJsonObject());
                    break;
                case "intercepts":
                    o[i] = [];
                    for(let j=0;  j<this.intercepts.length; j++)
                        o[i].push(this[i][j].toJsonObject());
                    break;
                case "hooks":
                    o[i] = [];
                    for(let j=0;  j<this.hooks.length; j++)
                        o[i].push(this[i][j].toJsonObject());
                    break;
                case "strats":
                    o.strats = [];
                    for(let j=0;  j<this.strats.length; j++)
                        o.strats.push(this.strats[j].toJsonObject());
                    break;
                case "context":
                    break;
            }
        }
        return o;
    }

}
