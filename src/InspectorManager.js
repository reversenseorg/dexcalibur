const UT = require("./Utils.js");
const Path = require("path");

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
    constructor( pProject){
        this.ctx = pProject;
        this.inspectors = [];
        this.errors = [];
    }


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
     */
    autoRegister(){
        let ctx = this.ctx, self=this;

        UT.forEachFileOf(
            Path.join(__dirname,"..","inspectors"), function(path,file){
                let insp = null;
                
                if(path.endsWith("/inspector.js")){
                    insp = require(path).injectContext(ctx);
                    // subscribe to events bus
                    ctx.bus.subscribe(insp);
                    
                    self.add(insp);
                }
        },true);
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