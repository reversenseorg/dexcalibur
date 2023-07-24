import {CoreDebug} from "./core/CoreDebug.js";


export default class HookMessage
{

    data:any = null;
    msg:string = null;
    match:boolean = null;
    isIntercept:boolean = false;
    hook:string = null;
    when:number = null;
    action:string = "";
    tags:any = null;

    /**
     * To represent a message sent by a hook from the device to the desktop
     * @constructor
     */
    constructor(pConfig:any=null){
        if(pConfig!=null){
            for(let i in pConfig)
                this[i] = pConfig[i];
        }
        return this;
    }

    isBefore():boolean{
        return this.when <= 0;
    }

    isAfter():boolean{
        return this.when>0;
    }

    getHook():string{
        return this.hook;
    }

    setTags(tags:any){
        this.tags = tags;
    }

    getTags():any{
        return this.tags;
    }

    addTag(tag:any){
        if(this.tags == null) this.tags = [];
        this.tags.push(tag);
    }
    /**
     * To make an instance of Object which not contain circular reference
     * and which are ready to be serialized.
     * @returns {Object} Returns an Object instance representing the type
     */
    toJsonObject():any{
        let o:any = new Object();
        o.data = this.data;
        o.hook = this.hook;
        o.msg = this.msg;
        o.match = this.match;
        o.action = this.action;
        o.isIntercept = this.isIntercept;

        if(this.tags != null && this.tags.length > 0)
            o.tags = this.tags;

    //    if(this.hook!=null)
    //        o.hook = this.hook.toJsonObject();
        o.after = this.isAfter();
        o.before = this.isBefore();

        CoreDebug.checkJsonSerialize(o, "HookMessage");
        return o;
    }
}
