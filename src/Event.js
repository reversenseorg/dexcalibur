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
    Event: Event
};