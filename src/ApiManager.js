function ApiRegister(){
    this.register = {};       
}
ApiRegister.prototype.get = function(name){
    return this.register[name];
}
ApiRegister.prototype.add = function(name){
    return this.register[name];
}

module.exports = {

};