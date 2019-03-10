
const HANDLER_TYPE = {
    GET: "get",
    POST: "post"
};

function InspectorFrontController(){
    this.ctx = null;
    this.handlers = {
        get: null,
        post: null
    };
}
InspectorFrontController.prototype.injectContext = function(context){
    this.ctx = context;
    return this;
}
InspectorFrontController.prototype.hasHandler = function(type){
    return this.handlers[type] instanceof Function;
}
InspectorFrontController.prototype.registerHandler =function(type,handler){
    this.handlers[type] = handler;
}
InspectorFrontController.prototype.performGet = function(req, res){
    if(this.handlers.get instanceof Function)
        return this.handlers.get(this.ctx, req, res);
    else
        return null;
}
InspectorFrontController.prototype.performPost = function(req, res){
    if(this.handlers.post instanceof Function)
        return this.handlers.post(this.ctx, req, res);
    else
        return null;
}


module.exports = {
    HANDLER: HANDLER_TYPE,
    FrontController: InspectorFrontController
};