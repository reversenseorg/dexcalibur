function Bus(ctx){
    this.context = ctx;
    this.listener = [];
    this.provider = [];
    this.broadcast = {};

    return this;
}
Bus.prototype.setContext = function(ctx){
    this.context = ctx;
    return this;
}
Bus.prototype.getListener = function(name){
    for(let i=0; i<this.listener.length; i++)
        if(this.listener[i].name == name)
            return this.listener[i];
    return null;
}
Bus.prototype.subscribe = function(listener){
    this.listener.push(listener);
    return this;
}
Bus.prototype.unscribe = function(listener){
    for(let i=0; i<this.listener.length; i++){
        if(this.listener[i].getId()==listener.getID()){
            this.listener[i] = null;
        }
    }
    return true;
}

Bus.prototype.send = function(event){
    
    for(let i=0; i<this.listener.length; i++){
        // TODO : async / co
        this.listener[i].broadcastEvent(event);   
    }
    return true;
}

module.exports = Bus;