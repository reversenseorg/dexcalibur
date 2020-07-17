
/**
 * Represents a session of hooking.
 *
 * A session comonly starts when the Frida final script is loaded and
 * finish at the next start.
 *
 * (TODO : or when the device is disconnected)
 *
 * @param {*} manager
 */
import HookMessage from "./HookMessage";
import Util from "./Utils";
import * as Frida from 'frida';
import {HookManager} from "./HookManager";

interface FridaBindings {
    session:Frida.Session,
    device: Frida.Device,
    script: Frida.Script,
    pid: number
}

/**
 * @class
 */
export default class HookSession
{
    /**
     * The stack containing the received message
     * @field
     */
    message:HookMessage[] = [];

    /**
     * The associated HookManager
     * (TODO : 1 hookManager per device)
     * @field
     */
    hookManager:HookManager = null;

    /**
     * Follow hookset matches
     * @field
     */
    sets_matches:any = {};

    /**
     * The timestamp of the session
     * @field
     */
    time:number = -1;

    /**
     * To hold some references from frida-node
     * @field
     */
    frida:FridaBindings = null

    /**
     *
     * @param {HookManager} manager
     * @constructor
     */
    constructor(manager) {
        this.message = [];
        this.hookManager = manager;
        this.sets_matches = {};
        this.time = Util.time();
        this.frida = {
            session: null,
            device: null,
            script: null,
            pid: null
        };
    }

    set fridaSession( pSession:Frida.Session){
        this.frida.session = pSession;
    }

    get fridaSession():Frida.Session{
        return this.frida.session;
    }


    set fridaDevice( pDevice:Frida.Device){
        this.frida.device = pDevice;
    }

    get fridaDevice():Frida.Device{
        return this.frida.device;
    }


    set fridaScript( pScript:Frida.Script){
        this.frida.script = pScript;
    }

    get fridaScript():Frida.Script{
        return this.frida.script;
    }


    set pid( pPID:number){
        this.frida.pid = pPID;
    }

    get pid():number{
        return this.frida.pid;
    }

    /**
     * To push a new message from a hook into the session.
     * Each message are an instance of HookMessage
     *
     * @method
     */
    push(msg:any){
        let hm:HookMessage = new HookMessage();

        if(msg.type == "error") return null;

        // TODO : mettre tout 'msg' dans 'hm' ou 'hm.data'

        // console.log(msg);
        if(msg.payload.id != undefined && msg.payload.id != null){
            //hook = this.hookManager.findHook(UT.b64_decode(msg.payload.id));
            hm.hook = msg.payload.id;
        }

        hm.match = (msg.payload.match!=null)? msg.payload.match : false;
        hm.msg = msg.payload.msg;
        hm.data = msg.payload.data;
        hm.action = msg.payload.action;
        hm.when = (msg.after)? 1 : 0;


        if(msg.payload.tags != null) hm.setTags(msg.payload.tags);

        this.message.push(hm)

        if(hm.match)
            this.hookManager.trigger(hm);

        return hm;
    }


    /**
     * @method
     */
    hasMessages( pOffset:number=0){
        return this.message.length > pOffset;
    }

    /**
     * @method
     */
    messages():HookMessage[]{
        return this.message;
    }

    /**
     * To get hook messages into the specific interval
     *
     * @param {number} pOffset Offset of the first message to include into return
     * @param {number} pSize Number of message to return
     * @method
     */
    getMessages( pOffset:number, pSize:number ):HookMessage[]{
        let arr = [];
        for(let i=pOffset; i<pOffset+pSize; i++){
            // not null and not undefined
            if(this.message[i] != null){
                arr.push(this.message[i]);
            }
        }

        return arr;
    }

    /**
     * @method
     */
    toJsonObject( pOffset:number=0, pSize:number=-1):any{
        let o:any = new Object(), limit:number=pSize;
        o.message = [];

        if(limit==-1)
            limit = this.message.length;

        limit += pOffset;
        for(let i=pOffset; i<limit; i++){
            if(this.message[i] != null)
                o.message.push(this.message[i].toJsonObject());
        }

        o.size = o.message.length;
        return o;
    }
}

