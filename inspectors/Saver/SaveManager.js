const _fs_ = require("fs");
const _path_ = require("path");

const Logger = require('../../src/Logger.js')(); 
const DB = require('../../src/InMemoryDb.js'); 

/*
class Entry
{
    constructor(pConfig = null){
        this.type = null;
        this.id = null;
    }
}
*/

class SaveManager
{
    static EXT = '.bkp';
    static FNAME = 'db.json';

    static T_CLASS = 1;
    static T_METHOD = 2;
    static T_FIELD = 3;
    static T_HOOK = 4;

    static __self = null;


    static getInstance(pContext){
        if(SaveManager.__self === null){
            SaveManager.__self = new SaveManager(pContext);
        }

        return SaveManager.__self;
    }

    constructor(pContext){
        this.context = pContext;
        this._enabled = true;
        this._filepath = null;
        this._db = new DB.InMemoryDb(pContext);

        this.queue = {
            method:[],
            field:[],
            class:[]
        };

        // init db
        this.initInternalDB();

        // init path
        this._filepath = _path_.join(
            this.context.workspace.getSaveDir(),
            SaveManager.FNAME
        );
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

    initInternalDB(){
        this._db.newCollection("classes");
        this._db.newCollection("fields");
        this._db.newCollection("methods");
        this._db.newCollection("hooks");
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

    

    import(pData){
        let index = null, o=null, hook=null, qflag=0;

        if(pData.classes.size > 0){
            index = this._db.getIndex("classes");
            for(let k in pData.classes.data){
                o = this.context.find.get.class(k);
                if(o != null){
                    o.setAlias(pData.classes.data[k].alias);
                }else{
                    this.queue.class.push(pData.classes.data[k]);
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
                }else{
                    this.queue.method.push(pData.methods.data[k]);
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
                }else{
                    this.queue.field.push(pData.fields.data[k]);
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
                }else{
                    this.queue.hooks.push(pData.hooks.data[k]);
                    qflag++;
                }
            }
        }

        if(qflag>0)
            Logger.error("[SAVE] "+qflag+" elements have not imported ...");
        else
            Logger.info("[SAVE] All elements have imported ...");
        //console.log(this.queue);
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
        _fs_.exists(pFilepath, function(pExists){
            try{
                if(_fs_.existsSync(pFilepath+SaveManager.EXT))
                    _fs_.unlinkSync(pFilepath+SaveManager.EXT);

                if(pExists)
                    _fs_.renameSync(pFilepath, pFilepath+SaveManager.EXT);

                _fs_.writeFile(pFilepath, pData, (err)=>{
                    if(err) 
                        throw new Error(err);

                    self.context.trigger({
                        type: "save.write",
                        data: self
                    });
                });

            }catch(e){
                //console.log(e);
                Logger.error("[INSPECTOR][SAVE] "+e.msg);
            }
            
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
                        if(!err)
                            self.import(JSON.parse(pData));
                });
            }
        });
    }
}

module.exports = SaveManager;