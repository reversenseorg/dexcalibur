import HookTemplateFragment from "./HookTemplateFragment.js";
import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import HookStrategy from "./HookStrategy.js";


export class HookFragment {

    tpl:HookTemplateFragment = null;

    static TYPE:NodeType = new NodeType( "hook_fragment_part", NodeInternalType.HOOK_FRAGMENT, []);

    __:NodeInternalType = NodeInternalType.HOOK_FRAGMENT;


    public _uid:string = null;

    public name:string = null;

    public descr:string = null;

    public weight = -1;


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

}