const _fs_ = require("fs");
const _path_ = require("path");

const Logger = require('../../src/Logger.js')(); 
const DB = require('../../connectors/inmemory/InMemoryDb.js');


/**
 * Useful with 'inmemory' DB
 *
 * @class
 */
class SaveManager
{
    static EXT = '.bkp';
    static FNAME = 'db.json';

    static T_CLASS = 1;
    static T_METHOD = 2;
    static T_FIELD = 3;
    static T_HOOK = 4;
    static T_HOOK_STATUS = 5;

    static __self = null;


    static getInstance(pContext){
        if(SaveManager.__self === null){
            SaveManager.__self = new SaveManager(pContext);
        }

        return SaveManager.__self;
    }

    constructor(pContext){
        this.context = pContext;
        this._ready = false;
        this._enabled = true;
        this._filepath = null;
        this._db = new DB.InMemoryDb(pContext);

        this.queue = {
            method:{},
            field:{},
            class:{},
            hooks: {},
            "hooks-status": {}
        };
        this.queueSize = {
            method:0,
            field:0,
            class:0,
            hooks:0,
            "hooks-status": 0
        };


        // init db
        this.initInternalDB();

        // init path
        this._filepath = _path_.join(
            this.context.workspace.getSaveDir(),
            SaveManager.FNAME
        );
    }

    isReady(){
        return this._ready;
    }

    disable(){
        this._enabled = false;
    }

    enable(){
        this._enabled = true;
    }

    isEnabled(){
        return (this._enabled === true);
    }

    addToQueue(pType, pKey, pVal){
        if(this.queue[pType] !== undefined){
            this.queue[pType][pKey] = pVal;
            this.queueSize[pType]++;
        }
    }

    removeFromQueue(pType, pKey){
        let o={};

        if(this.queue[pType] !== undefined){
            this.queueSize[pType] = 0;
            for(let i in this.queue[pType]){
                if(i !== pKey){
                    o[i] = this.queue[pType][i];
                    this.queueSize[pType]++;
                }
            }
        }
        this.queue[pType] = o;
    }

    getFromQueue(pType, pKey){
        if(this.queue[pType] !== undefined){
            if(this.queue[pType][pKey] !== undefined){
                return this.queue[pType][pKey];
            }else{
                return null;
            }
        }else{
            return null;
        }
    }

    initInternalDB(){
        this._db.newCollection("classes");
        this._db.newCollection("fields");
        this._db.newCollection("methods");
        this._db.newCollection("hooks");
        this._db.newCollection("hooks-status");
    }
/*
    newAlias( pType, pObject){
        switch(pType){
            case SaveManager.T_CLASS:
                this._db.getIndex("classes").setEntry();
                break;
            case SaveManager.T_FIELD:
                this._db.getIndex("fields").setEntry();
                break;
            case SaveManager.T_METHOD:
                this._db.getIndex("methods").setEntry();
                break;
        }
    }*/

    updateAlias( pType, pObject){

        switch(pType){
            case SaveManager.T_CLASS:
                this._db.getIndex("classes").addEntry(pObject.signature(),pObject);
                break;
            case SaveManager.T_METHOD:
                this._db.getIndex("methods").addEntry(pObject.signature(),pObject);
                break;
            case SaveManager.T_FIELD:
                this._db.getIndex("fields").addEntry(pObject.signature(),pObject);
                break;
        }
    }

    updateHook( pObject){
        this._db.getIndex("hooks").addEntry(pObject.hook.id, pObject.hook);
    }

    
    updateHookStatus( pHook, pEnable){
        this._db.getIndex("hooks-status").addEntry(pHook.id, pEnable);
    }

    import(pData){
        let index = null, o=null, hook=null, qflag=0;

        if(pData.classes.size > 0){
            index = this._db.getIndex("classes");
            for(let k in pData.classes.data){
                o = this.context.find.get.class(k);
                if(o != null){
                    o.setAlias(pData.classes.data[k].alias);
                    this.updateAlias(k, o);
                }else{
//                    this.queue.class[k] = pData.classes.data[k];
                    this.addToQueue("class",k,pData.classes.data[k]);
                    qflag++;
                }
            }
        }

        if(pData.methods.size > 0){
            index = this._db.getIndex("methods");
            for(let k in pData.methods.data){
                o = this.context.find.get.method(k);
                if(o != null){
                    o.setAlias(pData.methods.data[k].alias);
                    this.updateAlias(k, o);
                }else{
//                    this.queue.method[k] = (pData.methods.data[k]);
                    this.addToQueue("method",k,pData.methods.data[k]);
                    qflag++;
                }
            }
        }

        if(pData.fields.size > 0){
            index = this._db.getIndex("fields");
            for(let k in pData.fields.data){
                o = this.context.find.get.field(k);
                if(o != null){
                    o.setAlias(pData.fields.data[k].alias);
                    this.updateAlias(k, o);
                }else{
            //        this.queue.field[k] = (pData.fields.data[k]);
                    this.addToQueue("field",k,pData.fields.data[k]);
                    qflag++;
                }
            }
        }

        if(pData.hooks.size > 0){
            index = this._db.getIndex("hooks");
            for(let k in pData.hooks.data){
                
                o = this.context.find.get.method(pData.hooks.data[k].method);
                if(o != null){
                    // search if the hook already exists
                    hook = this.context.hook.getProbe(o);
                    
                    // if thereis not hook, call the hook manager and generate one
                    if(hook == null){
                        hook = this.context.hook.probe(o);
                    }

                    // update the current hook with the imported data
                    hook.updateWith(pData.hooks.data[k].hook, o);
                    this.updateHook({ hook:hook });
                }else{
                   // this.queue.hooks[k] = (pData.hooks.data[k]);
                    //console.log("test : ",pData.hooks.data[k].method);
                    this.addToQueue("hooks",k,pData.hooks.data[k]);
                    qflag++;
                }
            }
        }

        if(pData["hooks-status"].size > 0){
            index = this._db.getIndex("hooks-status");
            for(let k in pData["hooks-status"].data){

                hook = this.context.hook.getHookByID(k);
                if(hook != null){
                    if(pData["hooks-status"].data[k].enable == false){
                        this.context.bus.prevent("probe.disable");
                        hook.disable();
                        this.updateHookStatus(hook, false);
                    }else{
                        this.context.bus.prevent("probe.enable");
                        hook.enable();
                        this.updateHookStatus(hook, true);
                    }
                }else{
         //           this.queue["hooks-status"][k] = (pData["hooks-status"].data[k]);
                    this.addToQueue("hooks-status",k,pData.hooks.data[k]);
                    qflag++;
                }
            }
        }

        if(qflag>0){
            Logger.error("[SAVE] "+qflag+" elements have not been imported. Queued ..");
        }else
            Logger.info("[SAVE] All elements have been imported ...");
        //console.log(this.queue);

        this.context.bus.unprevent("probe.disable")
        this.context.bus.unprevent("probe.enable")
    }

    save(){
        let data = this.export();
        this.write(
            this._filepath,
            data
        );
    }

    export(pExclude=null){
        let data={}, coll=null, pData=null;
        let self=this;

        data.methods = {data:{}, size:self._db.getIndex("methods").size()};
        data.fields = {data:{}, size:self._db.getIndex("fields").size()};
        data.classes = {data:{}, size:self._db.getIndex("classes").size()};
        data.hooks = {data:{}, size:self._db.getIndex("hooks").size()};
        data["hooks-status"] = {data:{}, size:self._db.getIndex("hooks-status").size()};

        //if(this.queue.fields)

        if(this.queueSize.fields > 0){
            for(let i in this.queue.fields){
                data.fields.data[i] = {
                    type: SaveManager.T_FIELD,
                    alias: this.queue.fields[i].alias
                };
            }
        }
        if(this.queueSize.methods > 0){
            for(let i in this.queue.methods){
                data.methods.data[i] = {
                    type: SaveManager.T_METHOD,
                    alias: this.queue.methods[i].alias
                };
            }
        }
        if(this.queueSize.classes > 0){
            for(let i in this.queue.classes){
                data.classes.data[i] = {
                    type: SaveManager.T_CLASS,
                    alias: this.queue.classes[i].alias
                };
            }
        }
        if(this.queueSize.hooks > 0){
            for(let i in this.queue.hooks){
                data.hooks.data[i] = {
                    type: SaveManager.T_HOOK,
                    alias: this.queue.hooks[i].alias
                };
            }
        }
        if(this.queueSize["hooks-status"] > 0){
            for(let i in this.queue["hooks-status"]){
                data["hooks-status"].data[i] = {
                    type: SaveManager.T_HOOK_STATUS,
                    enable: this.queue["hooks-status"][i]
                };
            }
        }

        if(data.fields.size > 0){
            coll = self._db.getIndex("fields");
            coll.map(function(ref,obj){
                data.fields.data[ref] = {
                    type: SaveManager.T_FIELD,
                    alias: obj.getAlias()
                };
            });
        }

        if(data.methods.size > 0){
            coll = self._db.getIndex("methods");
            coll.map(function(ref,obj){
                data.methods.data[ref] = {
                    type: SaveManager.T_METHOD,
                    alias: obj.getAlias()
                };
            });
        }

        if(data.classes.size > 0){
            coll = self._db.getIndex("classes");
            coll.map(function(ref,obj){
                data.classes.data[ref] = {
                    type: SaveManager.T_CLASS,
                    alias: obj.getAlias()
                };
            });
        }

        if(data.hooks.size > 0){
            coll = self._db.getIndex("hooks");
            coll.map(function(ref,obj){
                data.hooks.data[ref] = {
                    type: SaveManager.T_HOOK,
                    id: ref,
                    hook: obj.toJsonObject(),
                    method: obj.method.signature()
                };
            });
        }

        if(data["hooks-status"].size > 0){
            coll = self._db.getIndex("hooks-status");
            coll.map(function(ref,obj){
                data["hooks-status"].data[ref] = {
                    type: SaveManager.T_HOOK_STATUS,
                    enable: obj
                };
            });
        }
        
        pData = JSON.stringify(data);
        
       return pData;
    }

    /**
     * 
     * @param {Path} pFilepath File path where data should be write 
     * @param {Object} pData Data to write
     */
    write(pFilepath, pData){
        let self = this;
        if(_fs_.existsSync(pFilepath)){
            if(_fs_.existsSync(pFilepath+SaveManager.EXT))
                 _fs_.unlinkSync(pFilepath+SaveManager.EXT);

            _fs_.renameSync(pFilepath, pFilepath+SaveManager.EXT);
        }
            
        _fs_.writeFile(pFilepath, pData, (err)=>{
            if(err) 
                throw new Error(err);

            self.context.trigger({
                type: "save.write",
                data: self
            });
        });           
    }

    restore(){
        let self=this;
        _fs_.exists(this._filepath, function(pExists){

            //console.log(self._filepath+" exists : "+pExists);
            if(pExists){
                _fs_.readFile(
                    self._filepath, {encoding:'utf-8'}, 
                    function(err,pData){
                        if(!err && pData.length>0){
                            self.import(JSON.parse(pData));
                        }

                });
            }
        });
    }
}

module.exports = SaveManager;
