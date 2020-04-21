const Logger = require("./Logger.js")();
const IFC = require("./InspectorFrontController.js");
const fs = require("fs");
const Path = require("path");
const InMemoryDb = require("./InMemoryDb.js").InMemoryDb;
//const UT = require("./Utils.js");

const TASK_CODE = {
    NO_RESULT: 0,
    SUCCESS: 1,
    DATA_UPDATE: 2
};

class StaticTask{

    constructor(config){
        this.task = null;
        this.condition = null;
        this.onDataUpdate = null;
        this.onNoResult = null;
        this.onSuccess = null;

        for(let i in config) this[i] = config[i];
    }

    setCondition(fn){
        this.task = fn;
    } 

    setTask(fn){
        this.condition = fn;
    }

    onSuccess(fn){
        this.onSuccess = fn;
    }

    onNoResult(fn){
        this.onNoResult = fn;
    }

    onDataUpdate(fn){
        this.onDataUpdate = fn;
    }

    exec(ctx, event){
        if(this.condition != null && this.condition(ctx))
            this.task(ctx, event);
        else
            this.task(ctx, event);
    }
}



class Inspector{
    
    constructor(config){
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
        this.preRegisteredTags = [];
        this.db = null;

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

    useGUI(){
        this.gui_available = true;
    }

    useMemoryDB(config=null){
        //console.log(DInMemoryDb);
        this.db = new InMemoryDb();

        return this.db;
    }

    getDB(){
        return this.db;
    }


    /**
     * To forward an HTTP GET request from the web server handler to the inspector front controller if available
     * Internal use
     */
    performGet(req,res){
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
    performPost(req,res){
        if(this.frontController.hasHandler(IFC.HANDLER.POST)){
            return this.frontController.performPost(req,res);
        }else{
            return { error: true, msg:"Unavailable POST handler for this inspector" };
        }
    }

    /**
     * To invoke the StaticTask instances associated to the given event. 
     */
    broadcastEvent(event){
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
    on(event_type, task){
        if(this.listener[event_type] == null)
            this.listener[event_type] = [];
        
        if(task instanceof StaticTask)
            this.listener[event_type].push(task);
        else
            this.listener[event_type].push(new StaticTask(task));
            
        return this;
    }


    registerTagCategory(name,tags){
        this.preRegisteredTags.push({ name:name, tags:tags });
    }


    /**
     * 
     */
    injectContext(ctx){
        this.context = ctx;
        this.hookSet.injectContext(ctx);
        Logger.info("[Inspector::injectContext][HookSet] "+this.id+" registered !");

        // register front controller
        let path = Path.join(__dirname,"..","inspectors",this.id,"service","main.js");
        if(fs.existsSync(path)){
            this.frontController = require(path).injectContext(ctx);
            Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
        }
        /*
        else if(Path.basename(ctx.config.getDexcaliburPath()) !== "src"){
            path = Path.join(ctx.config.getDexcaliburPath(),"inspectors",this.id,"service","main.js");
            if(fs.existsSync(path)){
                this.frontController = require(path).injectContext(ctx);
                Logger.info("[Inspector::injectContext][FrontController] "+this.id+" registered !");
            }
        }*/


        // declare TagCategory
        let anal = ctx.getAnalyzer();
        for(let i=0; i<this.preRegisteredTags.length; i++){
            anal.addTagCategory(this.preRegisteredTags[i].name, this.preRegisteredTags[i].tags)
        }

        if(this.db instanceof InMemoryDb){
            this.db.setContext(this.context);
        }

        return this;
    }
    setHookSet(hs){
        this.hookSet = hs;
    }
    getHookSet(){
        return this.hookSet;
    }

    getStaticTasks(){
        return this.staticTasks;
    }

    getStaticTask(name){
        return this.staticTasks[name];
    }

    getID(name){
        return this.id;
    }

    deploy(){
        this.running = true;
        this.hookSet.deploy();
    };

    // Inspector life-cycle
    turnOn(){
        this.running = true;
        if(this.hookSet!=null)
            this.hookSet.enable();
    }

    turnOff(){
        return this.staticTasks[name];
        if(this.hookSet!=null)
            this.hookSet.disable();
    }

    /**
     * emit a new event on the main event bus
     */
    emits(name,event){
        if(this.events.indexOf(name)==-1)
            this.events.push(name);

        this.context.bus.send({ 
            type: name, 
            data: event 
        });
    }

    restore(callback=null){
        let self = this;
        let savePath = Path.join(this.context.workspace.getSaveDir(), this.id+".json");
        fs.exists(savePath, function(exist){
            if(!exist){
                return ;
            }
            
            fs.readFile(savePath, 'ascii', function(err, data){
                let o = JSON.parse(data);
                self.db.unserialize(o);
                if(typeof callback === 'function')
                    callback(self);
            })
        })
    }

    save(){
        if(!this.db instanceof InMemoryDb) return null;

        let self = this;
        let savePath = Path.join(this.context.workspace.getSaveDir(), this.id+".json");
        fs.exists(savePath, function(exist){
            if(exist){
                fs.unlinkSync(savePath);
            }
            
            fs.open(savePath, 'w+', function(err, fd){
                if(err){
                    console.log("Save file cannot be created");
                    return;
                }

                let data = self.db.serialize();
                fs.write(fd, JSON.stringify(data), function(err, written, str){
                    if(err){
                        console.log("Save file cannot be created");
                        return;
                    }
                    console.log("Inspector "+self.id+" backed up");
                    fs.close(fd,function(err){});
                });
            })
        })
    }

    /**
     * To cast the current object to an object ready to be serialize (it avoids cyclic reference)
     * @returns {Object} 
     */
    toJsonObject(){
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
}


module.exports = {
 //   InspectorController: InspectorController,
    Inspector: Inspector,
    StaticTask: StaticTask,
    RET: TASK_CODE
};