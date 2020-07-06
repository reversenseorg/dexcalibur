
import ModelMetadata from "./ModelMetadata";
import ModelClass from './ModelClass';

/**
 * The class represents a Java|* Package
 * 
 * @class
 */
export default class ModelPackage
{
    /**
     * Package name
     *
     * @type {String}
     * @field
     */
    name:string;

    /**
     * Package metadata
     * @type {String}
     * @field
     */
    meta:ModelMetadata = null;

    /**
     * Package children
     * @type {Class[]|ModelPackage[]}
     * @field
     */
    children:ModelClass[]|ModelPackage[];

    /**
     * Tags
     * @type {String|Integer|Tag}
     * @field
     */
    tags:string[];

    /**
     * 
     * @param {String} pName Package fullname
     * @constructor 
     */
    constructor(pName:string){
        this.name = pName;
        this.children = [];
        this.tags = [];
    }

    /**
     * 
     * @param {Metadata|Object} pMetadata metadata
     * @returns {ModelPackage} Current package
     * @function
     */
    setMetadata( pMetadata:ModelMetadata|any):ModelPackage{

        if(pMetadata instanceof ModelMetadata){
            this.meta = pMetadata;
        }else if(typeof pMetadata == 'object'){
            this.meta = new ModelMetadata(pMetadata);
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
    childAppend( pObject:any):any{
        this.children.push(pObject);
        return this;
    }

    /**
     * To count children
     * 
     * @returns {Integer} Count of children, class or package, into current package 
     * @function
     */
    getSize():number{
        return this.children.length;
    }


    /**
     * To count recursively elements contained into the package 
     * 
     * @returns {Integer} Package size
     * @function
     */
    getAbsoluteSize():number{
        let absz = 0;
        for(let i in this.children){
            if(this.children[i] instanceof ModelClass)
                absz++;
            else if(this.children[i] instanceof ModelPackage)
                absz += (this.children[i] as ModelPackage).getAbsoluteSize();
        }
        return absz;
    }

    /**
     * To verify if the package is tagged or not
     * 
     * @param {String} pTagName Tag name
     * @function
     */
    addTag(pTagName:string){
        this.tags.push(pTagName);
    }

    /**
     * To verify if the package is tagged or not
     * 
     * @param {String} pTagName Tag name
     * @returns {Boolean} TRUE if the package is tagged, else FALSE 
     * @function
     */
    hasTag(pTagName:string):boolean{
        return this.tags.indexOf(pTagName)>-1; 
    }

    /**
     * To get tags of this package
     * 
     * @returns {Tag[]|String[]} A list of tags
     * @function
     */
    getTags():string[]{
        return this.tags;   
    }   

    /**
     * To transform a set of access flags as a simple object ready to be serialized
     * 
     * @param {Object[]|String[]} pFields
     * @returns {Object} Simple object containing package content
     * @function 
     */
    toJsonObject( pFields:any):any{
        let o:any= {};
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
                o.children.push(this.children[i].toJsonObject(null)); // TODO args
            }
            o.tags = this.tags;
        }
        o.absolute_size = this.getAbsoluteSize();
        o.size = this.getSize();
        return o;
    }
}

