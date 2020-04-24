class StatusMessage
{
    constructor( pProgress, pMessage=""){
        this.progress = pProgress;
        this.msg = pMessage;
        this.extra = null;
    }

    static newError( pProgress, pMessage){
        let m  = new StatusMessage(pProgress, pMessage);
        m.extra = "error";
        return m;
    }

    static newSuccess( pMessage){
        let m  = new StatusMessage(100, pMessage);
        m.extra = "success";
        return m;
    }


    append( pMsg){
        return this.msg+"\n"+pMsg;
    }

    getProgress(){
        return this.progress;
    }

    getMessage(){
        return this.msg;
    }

    getExtra(){
        return this.extra;
    }

    toJsonObject(){
        let o = new Object();
        o.progress = this.progress;
        o.msg = this.msg;
        o.extra = this.extra;
        return o;
    }
}

module.exports = StatusMessage;