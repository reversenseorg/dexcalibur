
import ModelMetadata from "./ModelMetadata";
import ModelClass from './ModelClass';


/**
 * The class represents a Java|* Package
 * 
 * @class
 */
export default class ModelPackage
{
    _t:string = null;

    /**
     * Package name
     *
     * @type {String}
     * @field
     */
    name:string;

    /**
     * Package simple name
     */
    sname:string;

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
    children:(ModelPackage|ModelClass)[] = [];

    /**
     * Tags
     * @type {string|number|Tag}
     * @field
     */
    tags:string[];

    /**
     * Alias
     * @type {string}
     * @field
     */
    alias:string = null;


    static fromJavaFQCN( pName:string):ModelPackage {
        let o = new ModelPackage(pName);
        // o.sname = pName.split('.').pop();
        return o;
    }
    /**
     * 
     * @param {String} pName Package fullname
     * @constructor 
     */
    constructor(pName:string){
        this.name = pName;
        this.sname = pName.split('.').pop();
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

    setAlias( pAlias:string):void {
        this.alias = pAlias;
    }

    getAlias():string {
        return this.alias;
    }

    getChildrenByAlias( pName:string):ModelClass|ModelPackage{
        let c:ModelClass|ModelPackage = null;
        this.children.map( function(vChild:any){
            if(vChild.getAlias()===pName) c = vChild;
        });
        return c;
    }

    hasAliasedClass( pAlias:string){
        let o:ModelClass|ModelPackage = this.getChildrenByAlias(pAlias);
        return (o!=null)&&(o instanceof ModelClass);
    }

    hasAliasedPackage( pAlias:string){
        let o:ModelClass|ModelPackage = this.getChildrenByAlias(pAlias);
        return (o!=null)&&(o instanceof ModelPackage);
    }

    /**
     * To transform a set of access flags as a simple object ready to be serialized
     *
     *   children<ModelClass>.name
     *   children<ModelPackage>.tags
     *
     * @param {Object[]|String[]} pFields
     * @returns {Object} Simple object containing package content
     * @function 
     */
    toJsonObject( pFields:any):any{
        let o:any= {}, k:number, m:any, field:string=null;
        o.children = [];
        o._t = 'p'; // TODO : Stub

        if(pFields !== null){
            /*
            for(let i=0; i<pFields.length; i++){

                console.log(pFields[i]);

                if((k=pFields[i].indexOf('.'))==-1){
                    o[pFields[i]] = this[pFields[i]];
                }
                else if(pFields[i].indexOf("children<ModelClass>")==0){
                    field = pFields[i].substr(k+1);



                    console.log('class> ',field);
                    for(let co=0; co<this.children.length; co++){

                        console.log('class> ',field, this.children[co] instanceof ModelPackage);
                        if(this.children[co] instanceof ModelClass){

                            m = {type:'c'};
                            m[field] = this.children[co][field];
                            o.children.push(m);
                        }
                    }
                }
                else if(pFields[i].indexOf("children<ModelPackage>")==0){
                    field = pFields[i].substr(k+1);
                    console.log('package> ',field);
                    for(let co=0; co<this.children.length; co++){

                        console.log('package> ',field, this.children[co] instanceof ModelPackage);
                        if(this.children[co] instanceof ModelPackage){

                            m = {type:'p'};
                            m[field] = this.children[co][field];
                            o.children.push(m);
                        }
                    }
                }
                else {
                    o[pFields[i]] = this[pFields[i]].toJsonObject(pFields[i].substr(0,k));
                }
            }
            */
            //o[pFields[i]] = this[pFields[i]];

            o.name = this.name;
            o.sname = this.sname;
            o.children = [];
            for(let i=0; i<this.children.length;i++){
                m = this.children[i];
                if(m instanceof ModelClass){
                    o.children.push({ _t:'c', name: m.name, sname: m.simpleName, alias:m.alias, tags: m.tags }) ;
                }else{
                    o.children.push({ _t:'p', name: m.name, sname: m.sname, alias:m.alias, tags: m.tags });
                }
            }
            o.tags = this.tags;

        }else{
            o.name = this.name;
            o.sname = this.sname;
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

