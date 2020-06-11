

const Class = require('./CoreClass').Class; 
/**
 * The class represents a Java|* Package
 * 
 * @class
 */
class ModelPackage
{
    /**
     * 
     * @param {String} pName Package fullname
     * @constructor 
     */
    constructor(pName){
        /**
         * Package name
         * 
         * @type {String}
         * @field
         */
        this.name = pName;
        
        /**
         * Package metadata
         * @type {String}
         * @field
         */
        this.meta = null;

        /**
         * Package children
         * @type {Class[]|ModelPackage[]}
         * @field
         */
        this.children = [];

        /**
         * Tags
         * @type {String|Integer|Tag}
         * @field
         */
        this.tags = [];
    }

    /**
     * 
     * @param {Metadata|Object} pMetadata metadata
     * @returns {ModelPackage} Current package
     * @function
     */
    setMetadata( pMetadata){
        if(obj instanceof Metadata){
            this.meta = obj;
        }else if(typeof obj == 'object'){
            this.meta = new Metadata(obj);
        }else{
            console.log("Error : invalid Metadata type");   
        }
        return this;
    }


    /**
     * To append a child - class or package - to the current package
     * 
     * @param {Class|Package} pObject The new child
     * @returns {ModelPackage} Current package
     * @function
     */
    childAppend( pObject){
        this.children.push(pObject);
        return this;
    }

    /**
     * To count children
     * 
     * @returns {Integer} Count of children, class or package, into current package 
     * @function
     */
    getSize(){
        return this.children.length;
    }


    /**
     * To count recursively elements contained into the package 
     * 
     * @returns {Integer} Package size
     * @function
     */
    getAbsoluteSize(){
        let absz = 0;
        for(let i in this.children){
            if(this.children[i] instanceof Class)
                absz++;
            else if(this.children[i] instanceof ModelPackage)
                absz += this.children[i].getAbsoluteSize();
        }
        return absz;
    }

    /**
     * To verify if the package is tagged or not
     * 
     * @param {String} pTagName Tag name
     * @function
     */
    addTag(pTagName){
        this.tags.push(pTagName);
    }

    /**
     * To verify if the package is tagged or not
     * 
     * @param {String} pTagName Tag name
     * @returns {Boolean} TRUE if the package is tagged, else FALSE 
     * @function
     */
    hasTag(pTagName){
        return this.tags.indexOf(pTagName)>-1; 
    }

    /**
     * To get tags of this package
     * 
     * @returns {Tag[]|String[]} A list of tags
     * @function
     */
    getTags(){
        return this.tags;   
    }   

    /**
     * To transform a set of access flags as a simple object ready to be serialized
     * 
     * @param {Object[]|String[]} pFields
     * @returns {Object} Simple object containing package content
     * @function 
     */
    toJsonObject( pFields){
        let o= {};
        if(pFields !== null){
            for(let i in pFields){
                if(typeof this[pFields[i]] == "object"){
                    o[pFields[i]] = this[pFields[i]].toJsonObject();
                }else{
                    o[pFields[i]] = this[pFields[i]];
                }
            }
        }else{
            o.name = this.name;
            o.children = [];
            for(let i in this.children){
                o.children.push(this.children[i].toJsonObject());
            }
            o.tags = this.tags;
        }
        o.absolute_size = this.getAbsoluteSize();
        o.size = this.getSize();
        return o;
    }
}


module.exports = ModelPackage;