import {AbstractHook} from "./AbstractHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import HookSession from "../HookSession.js";


export default class HookMessageV2
{
    /**
     *
     */
    uid:number = null;

    /**
     * Hook ID
     *
     * Hook message can be trigged at different time (before/after/replace)
     *
     * It helps to locate WHERE the hook has been trigged
     *
     * @field
     */
    hid:string = null;

    /**
     * Fragment ID
     *
     * Several hook can have same fragment
     *
     * It helps to locate WHEN the hook has been trigged
     *
     * @field
     */
    fid:string = null;

    data:any = null;

    /**
     * Allow to override event name from associated strategy
     */
    event?:string = null;

    hook?:AbstractHook;

    frag?:HookTemplateFragment;

    session:any = null;


    /**
     * To represent a message sent by a hook from the device to the desktop
     * @constructor
     */
    constructor(pConfig:any=null){
        if(pConfig!=null){
            for(const i in pConfig)
                this[i] = pConfig[i];
        }
        return this;
    }

    getFragment():HookTemplateFragment  {
        return this.frag;
    }

    getHook():AbstractHook  {
        return this.hook;
    }

    setSession(pSession:HookSession){
        this.session=pSession;
    }



    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        let o:any = new Object();
        o.uid = this.uid;
        o.data = this.data;
        o.hid = this.hid;
        o.fid = this.fid;

        //if(this.tags != null && this.tags.length > 0)
        //    o.tags = this.tags;

        return o;
    }
}
