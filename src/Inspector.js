const Logger = require("./Logger.js");
const IFC = require("./InspectorFrontController.js");
const fs = require("fs");
//const UT = require("./Utils.js");

const TASK_CODE = {
    NO_RESULT: 0,
    SUCCESS: 1,
    DATA_UPDATE: 2
};

function StaticTask(config){
    this.task = null;
    this.condition = null;
    this.onDataUpdate = null;
    this.onNoResult = null;
    this.onSuccess = null;

    for(let i in config) this[i] = config[i];

    return this;
}
StaticTask.prototype.setCondition = function(fn){
    this.task = fn;
} 
StaticTask.prototype.setTask = function(fn){
    this.condition = fn;
} 
StaticTask.prototype.onSuccess = function(fn){
    this.onSuccess = fn;
}
StaticTask.prototype.onNoResult = function(fn){
    this.onNoResult = fn;
}
StaticTask.prototype.onDataUpdate = function(fn){
    this.onDataUpdate = fn;
}
StaticTask.prototype.exec = function(ctx, event){
    if(this.condition != null && this.condition(ctx))
        this.task(ctx, event);
    else
        this.task(ctx, event);
}

function Inspector(config){
    this.id = null;
    this.name = null;
    this.description = null;

    this.context = null;
    this.hookSet = null;
    this.staticTasks = null;
    this.running = false;
    this.listener = {};
    this.events = [];
    this.gui_available = false;
    this.frontController = null;

    for(let i in config){
        this[i] = config[i];
        if(i=="hookSet"){
            this.id = config[i].id;
            this.name = config[i].name;
            this.description = config[i].description;
        }
    }

    return this;
}
Inspector.prototype.useGUI = function(){
    this.gui_available = true;
}

/**
 * To forward an HTTP GET request from the web server handler to the inspector front controller if available
 * Internal use
 */
Inspector.prototype.performGet = function(req,res){
    if(this.frontController.hasHandler(IFC.HANDLER.GET)){
        return this.frontController.performGet(req,res);
    }else{
        return { error: true, msg:"Unavailable GET handler for this inspector" };
    }
}


/**
 * To forward an HTTP POST request from the web server handler to the inspector front controller if available
 * Internal use
 */
Inspector.prototype.performPost = function(req,res){
    if(this.frontController.hasHandler(IFC.HANDLER.POST)){
        return this.frontController.performPost(req,res);
    }else{
        return { error: true, msg:"Unavailable POST handler for this inspector" };
    }
}

/**
 * To invoke the StaticTask instances associated to the given event. 
 */
Inspector.prototype.broadcastEvent = function(event){
    let event_type = event.type;

    //Logger.info( event_type, this.listener[event_type]);
    //console.log(this.listener);
    if(this.listener[event_type] != null){
        for(let i=0; i<this.listener[event_type].length; i++){
            // TODO : async / co
            // console.log(this.listener[event_type][i]);
            this.listener[event_type][i].exec(this.context, event);
        }
    }
    return true;
}

/**
 * To declare new event handler. If the param `task`is  a function, a new StaticTask is create implicitly.
 */
Inspector.prototype.on = function(event_type, task){
    if(this.listener[event_type] == null)
        this.listener[event_type] = [];
    
    if(task instanceof StaticTask)
        this.listener[event_type].push(task);
    else
        this.listener[event_type].push(new StaticTask(task));
        
    return this;
}

/**
 * 
 */
Inspector.prototype.injectContext = function(ctx){
    this.context = ctx;
    this.hookSet.injectContext(ctx);
    Logger.info("[Inspector::injectContext][HookSet] "+this.id+" registered !");

    // register front controller
    let path = ctx.config.getDexcaliburPath()+"../inspectors/"+this.id+"/service/main.js";
    if(fs.existsSync(path)){
        this.frontController = require(path).injectContext(ctx);
        Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
    }
    return this;
}
Inspector.prototype.setHookSet = function(hs){
    this.hookSet = hs;
}
Inspector.prototype.getHookSet = function(){
    return this.hookSet;
}

Inspector.prototype.getStaticTasks = function(){
    return this.staticTasks;
}

Inspector.prototype.getStaticTask = function(name){
    return this.staticTasks[name];
}

Inspector.prototype.getID = function(name){
    return this.id;
}

Inspector.prototype.deploy = function(){
    this.running = true;
    this.hookSet.deploy();
};

// Inspector life-cycle
Inspector.prototype.turnOn = function(){
    this.running = true;
    if(this.hookSet!=null)
        this.hookSet.enable();
}

Inspector.prototype.turnOff = function(){
    return this.staticTasks[name];
    if(this.hookSet!=null)
        this.hookSet.disable();
}

/**
 * emit a new event on the main event bus
 */
Inspector.prototype.emits = function(name,event){
    if(this.events.indexOf(name)==-1)
        this.events.push(name);

    this.context.bus.send({ 
        type: name, 
        data: event 
    });
}


/**
 * To cast the current object to an object ready to be serialize (it avoids cyclic reference)
 * @returns {Object} 
 */
Inspector.prototype.toJsonObject = function(){
    let o = new Object(), t = null;
    o.id = this.id;
    o.description = this.description;
    o.name = this.name;
    o.running = this.running;
    o.events = this.events;
    o.hooks = this.hookSet.toJsonObject();
    o.listener = [];
    o.gui_available = this.gui_available;
    for(var i in this.listener)
        o.listener.push({ n:i });
    
    return o;
}



module.exports = {
 //   InspectorController: InspectorController,
    Inspector: Inspector,
    StaticTask: StaticTask,
    RET: TASK_CODE
};