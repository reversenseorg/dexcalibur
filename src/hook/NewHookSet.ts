import DexcaliburProject from "../DexcaliburProject";
import HookPrologue from "../HookPrologue";
import HookStrategy from "./HookStrategy";
import Hook from "../Hook";


export default class NewHookSet {



    id:string = null;
    name:string = null;
    description:string = null;
    prologue:HookPrologue = null;
    strategies:HookStrategy[] = [];
    hooks:Hook[] = [];
    share:any = null;

    private ctx:DexcaliburProject = null;
    private enable:boolean = false;
    private prolog:any = null;
    private requires:string[] = [];
    private color:any = null;


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

    injectContext(context:DexcaliburProject):NewHookSet{
        this.ctx = context;

        // forward to the prologue
        if(this.prolog!=null)
            this.prolog.context = this.ctx;

        // register the hookset to the HookManager
        // this.ctx.hook.addHookSet(this);

        return this;
    }
}