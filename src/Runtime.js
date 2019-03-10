function CallStack(stack){
    this.stack = stack;

    return this;
}
CallStack.prototype.isCalledByReflection = function(){

}

/**
 * To check if a function is in the stack 
 */
CallStack.prototype.useReflection = function(){

}
CallStack.prototype.toJsonObject = function(){

}



function RuntimeCall(cfg){
    this.stack = null;
    this.args = [];
    this.session = null;

    for(let i in cfg) this[i] = cfg[i];
    return this;
}

RuntimeCall.prototype.getSession = function(){
    return this.session;
}

RuntimeCall.prototype.isCallByReflection = function(){
    return this.session;
}