

import * as Log from './Logger';
let Logger:Log.Logger = Log.newLogger();

export interface StatusSet {
    [name:string] :StatusMessage[]
}

/**
 * This class represents a status when  
 * monitor a progressing task is required 
 * 
 * @class
 * @author Georges-B MICHEL
 */
export default class StatusMessage
{
    progress:number;
    msg:string;
    extra:any = null;

    /**
     * 
     * @param {Integer} pProgress 
     * @param {String} pMessage 
     * @constructor
     */
    constructor( pProgress:number, pMessage:string=""){
        this.progress = pProgress;
        this.msg = pMessage;
        this.extra = null;

        Logger.debug('<status message> : NEW : ',pMessage);
    }

    /**
     * To create a messsage with "error" flag
     * @param {Integer} pProgress 
     * @param {String} pMessage 
     * @returns {StatusMessage}
     * @static
     */
    static newError( pMessage:string):StatusMessage{
        let m:StatusMessage  = new StatusMessage(100, pMessage);
        m.extra = "error";
        Logger.debug('<status message> : ERROR : ',pMessage);

        return m;
    }

     /**
     * To create a message with "success" flag
     * 
     * @param {String} pMessage 
     * @returns {StatusMessage}
     * @static
     */
    static newSuccess( pMessage:string):StatusMessage{
        let m:StatusMessage  = new StatusMessage(100, pMessage);
        m.extra = "success";
        Logger.debug('<status message> : SUCCESS : ',pMessage);

        return m;
    }

    /**
     * 
     * @param {*} pMsg 
     * @method
     */
    append( pMsg:string):string{
        return this.msg+"\n"+pMsg;
    }

    addProgress( pRelativeProgress:number):StatusMessage {
        this.progress += pRelativeProgress;
        return this;
    }

    update(pProgress:number, pMessage:string, pStep:boolean = false):StatusMessage{
        if(pStep == true){
            this.progress += pProgress;
        }else{
            this.progress = pProgress;
        }
        this.msg = pMessage;
        return this;
    }

    /**
     * @method
     */
    getProgress():number{
        return this.progress;
    }

    /**
     * @method
     */
    getMessage():string{
        return this.msg;
    }

    /**
     * @method
     */
    getExtra():any{
        return this.extra;
    }

    /**
     * To export to a poor object, ready to be serialized into JSON format
     * 
     * @method
     */
    toJsonObject():any{
        let o:any = {};
        o.progress = this.progress;
        o.msg = this.msg;
        o.extra = this.extra;
        return o;
    }
}
