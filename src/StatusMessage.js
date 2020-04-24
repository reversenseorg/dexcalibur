
/**
 * This class represents a status when  
 * monitor a progressing task is required 
 * 
 * @class
 * @author Georges-B MICHEL
 */
class StatusMessage
{
    /**
     * 
     * @param {Integer} pProgress 
     * @param {String} pMessage 
     * @constructor
     */
    constructor( pProgress, pMessage=""){
        this.progress = pProgress;
        this.msg = pMessage;
        this.extra = null;
    }

    /**
     * To create a messsage with "error" flag
     * @param {Integer} pProgress 
     * @param {String} pMessage 
     * @returns {StatusMessage}
     * @static
     */
    static newError( pProgress, pMessage){
        let m  = new StatusMessage(pProgress, pMessage);
        m.extra = "error";
        return m;
    }

     /**
     * To create a message with "success" flag
     * 
     * @param {String} pMessage 
     * @returns {StatusMessage}
     * @static
     */
    static newSuccess( pMessage){
        let m  = new StatusMessage(100, pMessage);
        m.extra = "success";
        return m;
    }

    /**
     * 
     * @param {*} pMsg 
     * @method
     */
    append( pMsg){
        return this.msg+"\n"+pMsg;
    }

    /**
     * @method
     */
    getProgress(){
        return this.progress;
    }

    /**
     * @method
     */
    getMessage(){
        return this.msg;
    }

    /**
     * @method
     */
    getExtra(){
        return this.extra;
    }

    /**
     * To export to a poor object, ready to be serialized into JSON format
     * 
     * @method
     */
    toJsonObject(){
        let o = new Object();
        o.progress = this.progress;
        o.msg = this.msg;
        o.extra = this.extra;
        return o;
    }
}

module.exports = StatusMessage;