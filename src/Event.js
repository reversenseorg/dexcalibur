function Event(config=null){
    this.type = null;
    this.data = null;

    if(config!=null) for(let i in config) this[i] = config[i];
    return this;
}
Event.prototype.getType = function(){
    return this.type;
}
Event.prototype.getData = function(){
    return this.data;
}   

module.exports = {
    Event: Event,
/*    TYPE: {
        dev: {
            connected: "dev.conn",
            deconnected: "dev.deco",
        },
        hooking: {
            start: "hooking.start",
            stop: "hooking.stop"
        },
        hook: {
            match: "hook.match"
        },
        task: {
            match: "task.match",
            notfound: "task.notfound"
        },
        view: {
            new: "view.new",
            updated: "view.updated"
        },
        filescan: {
            new: "filescan.new"
        },
        data: {
            file: {
                new: "data.file.new",
                upd: "data.file.upd" 
            }
        }
    }*/
};