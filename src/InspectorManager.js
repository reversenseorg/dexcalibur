const UT = require("./Utils.js");
const _path_ = require("path");
const _fs_ = require('fs');
const _xz_ = require('lzma-native');

var Logger = require("./Logger")();
const Inspector = require('./Inspector');

var gInstance = null;

/**
 * @class
 */
class InspectorManager
{
    /**
     * 
     * @param {DexcaliburProject} pProject Project instance
     * @constructor
     */
    constructor( pEngine){
        this.engine = pEngine;

        this.inspectors = [];
        this.errors = [];

        this.projects = {};

        this.enabled = {};

        this.locals = {};
    }

    static getInstance( pEngine){
        if(gInstance == null){
            gInstance = new InspectorManager(pEngine);
        }

        return gInstance;
    }


    /**
     * 
     * @param {*} pRegistry 
     * @param {*} pName 
     */
    async install(pInspector){
        
        let reg = null, data = null;
        let path = _path_.join( this.engine.workspace.getTempFolderLocation(), pInspector.getUID()+".xz");

        await pipeline(
            _got_.stream(pInspector.getRemotePath()),
            _xz_.Decompressor(),
            _fs_.createWriteStream(path)
        );

        if(_fs_.existsSync(path) == true){
            pInspector.checkInstall();
            return true;
        }else{
            return false;
        }
    }

    isInstalled( pName){
        return (this.locals[pName] instanceof Inspector)
    }

    getLocal(){
        return this.locals;
    }

    getRemote(){
        return this.remote;
    }


    enumerate(){

        this.locals = this.enumerateLocal();
        /*
        (async ()=>{
            this.remote = await this.enumerateRemote();

            for(let i in this.local){
                if(this.remote[i] instanceof Inspector){
                    this.local[i] = this.remote[i];
                }
            }
        })();*/
    }

    enumerateLocal(){
        let res = [], p=null;
        let ws = _path_.join(__dirname, '..', 'inspectors'); // this.engine.workspace.getPluginsFolderLocation();
        let files = _fs_.readdirSync(ws);

        for(let i=0; i<files.length; i++){
            if(this.locals[ files[i] ] == null){

                p = _path_.join( ws, files[i], "main.js");

                if(_fs_.existsSync(p)){
                    this.locals[ files[i] ] = require(p);
                }
            }
        }

        return this.locals;
    }
    

   

    getInspectorsOf(pProject){
        return this.projects[pProject.getUID()];
    }

    /**
     * To enumerate platforms of a remote registry
     *  
     * @param {require('./DexcaliburRegistry')} pRegistry The remote registry
     * @returns {Platform[]} An array a platform 
     * @method
     */
    async enumerateRemote( pRegistry){

        // todo
        /*
        let platforms  = null, p=null, res={};

        if(pRegistry == null){
            pRegistry = this.engine.getRegistry();
        }

        // retrieve remote platform
        inspectors = await pRegistry.enumerateInspectors();

        for(let i=0; i<inspectors.length; i++){
            p = Inspector.fromRemoteName(platforms[i].name);
            if(p == null) continue;

            p.setRemotePath(platforms[i].download_url);
            p.setLocalPath( _path_.join(this.engine.workspace.getPlatformFolderLocation(), p.getUID()));
            p.setSize(platforms[i].size);
            p.setHash(platforms[i].sha);

            res[p.getUID()] = p;
        }*/
        
        return {};
    }

    /**
     * 
     * @param {*} pProject 
     * @param {*} pName 
     * @method
     */
    getEnabledInspector(pProject, pName){
        let all = this.projects[pProject.getUID()];

        if(all == null) 
            return null;

        return all[pName];
    }

    /**
     * 
     * @param {*} pName 
     * @method
     */
    getRemoteInspector( pName){
        return this.remote[pName];
    }

    /**
     * 
     * @param {*} pName 
     * @method
     */
    getLocalInspector( pName){
        if(this.locals[pName] instanceof Inspector){
            return this.locals[pName];
        }

        // throw exception
        return null;
    }



    // -----------

    /**
     * 
     * @param {*} err 
     * @method
     */
    addError(err){
        this.errors.push(err);
    }


    /**
     * 
     * @param {*} err 
     * @method
     */
    lastError(err){
        if(this.errors.length > 0)
            return this.errors[this.errors.length-1];
        else
            return null;
    }

    /**
     * Import inspector contained into the folders inspectors/*
     * 
     * @method
     * @deprecated
     */
    autoRegister( pProject){
        let self=this;

        UT.forEachFileOf(
            _path_.join(__dirname,"..","inspectors"), function(path,file){
                let insp = null;
                
                if(path.endsWith("/inspector.js")){
                    insp = require(path);

                    if(insp instanceof InspectorFactory){
                        // todo
                    }else{
                        insp.injectContext(pProject);
                    }
                    // subscribe to events bus
                    pProject.bus.subscribe(insp);
                    
                    self.add(insp);
                }
        },true);
    }

    createInspectorsFor( pProject){
        let uid = pProject.getUID();
        
        if(this.projects[uid] == null){
            this.projects[uid] = {};
        }

        for(let i in this.locals){
            this.projects[uid][i] = this.locals[i].createInstance(pProject);

            pProject.bus.subscribe(this.projects[uid][i]);
                    
            //self.add(insp);
        }

        return true;
    }
    /**
     * To get an inspector by its UID
     * 
     * @param {String} id Inspector UID
     * @method
     */
    get(id){
        for(let k=0 ; k<this.inspectors.length; k++)
            if(id == this.inspectors[k].id)
                return this.inspectors[k];
        
        this.addError("Inspector not found by name. (name="+id+")");
        return false;
    }

     /**
     * To get a list of all inspectors
     *  
     * @returns {Inspector[]} Array of inspector
     * @method
     */
    list(){
        return this.inspectors;
    }


     /**
     * To create inspector for target project
     * 
     * @param {*} pProject 
     * @param {*} pStep 
     */
    deployInspectors( pProject, pStep){
        let uid = pProject.getUID();
        let insp = "";

        if(this.projects[uid] == null) 
            return false;

        for(let i in this.projects[uid]){
            if(this.projects[uid][i].isStartAt(pStep)){
                this.projects[uid][i].deploy();
                insp += i+' ';
            }
        }

        Logger.info("[INSPECTOR MANAGER] Project["+uid+"], Step["+pStep+"] deploying inspectors : "+(insp.length==0? '<none>':insp));

        return true;
    }


    /**
     * 
     * 
     * @param {Inspector} pInspector Add an inspector 
     * @method
     */
    add(pInspector){
        this.inspectors.push(pInspector);

        return this;
    }

    /**
     * @method
     */
    deployAll(){
        for(let k in this.inspectors)
            this.inspectors[k].deploy();
    }

    /**
     * 
     * @param {String} name Inspector name
     * @returns {Boolean} 
     * @method
     */
    deploy(name){
        let insp = this.get(name);
        if(insp instanceof Inspector){
            insp.deploy();
            return true;
        }
        return false;
    }
}

module.exports = InspectorManager;