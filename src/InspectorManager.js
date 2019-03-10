const UT = require("./Utils.js");

function InspectorManager(ctx){
    this.ctx = ctx;
    this.inspectors = [];
    this.errors = [];
}


InspectorManager.prototype.addError = function(err){
    this.errors.push(err);
};


InspectorManager.prototype.lastError = function(err){
    if(this.errors.length > 0)
        return this.errors[this.errors.length-1];
    else
        return null;
};

/**
 * Import inspector contained into the folders inspectors/*
 */
InspectorManager.prototype.autoRegister = function(){
    let ctx = this.ctx, self=this;

    UT.forEachFileOf(this.ctx.config.dexcaliburPath+"/../inspectors/", function(path,file){
        if(path.endsWith("/inspector.js")){
            insp = require(path).injectContext(ctx);
            // subscribe to events bus
            ctx.bus.subscribe(insp);
            
            self.add(insp);
        }
    },true);
}

InspectorManager.prototype.get = function(id){
    for(let k=0 ; k<this.inspectors.length; k++)
        if(id == this.inspectors[k].id)
            return this.inspectors[k];
    
    this.addError("Inspector not found by name. (name="+id+")");
    return false;
}

InspectorManager.prototype.list = function(){
    return this.inspectors;
}

InspectorManager.prototype.add = function(insp){
    this.inspectors.push(insp);

    return this;
}

InspectorManager.prototype.deployAll = function(){
    for(let k in this.inspectors)
        this.inspectors[k].deploy();
}

InspectorManager.prototype.deploy = function(name){
    let insp = this.get(name);
    if(insp instanceof Inspector){
        insp.deploy();
        return true;
    }
    return false;
}

module.exports = InspectorManager;