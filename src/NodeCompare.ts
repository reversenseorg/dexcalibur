import ModelField from "./ModelField.js";
import ModelMethod from "./ModelMethod.js";

/**
 * To diff two nodes from model by inspecting a list of properties
 * @deprecated
 */
export default class NodeCompare
{
    originalnode:ModelField|ModelMethod;
    diff:any;
    newnode:any;
    e:boolean;


    /**
     *
     * @param original_node
     * @param new_node
     * @param diff {string[]} List of properties
     */
    constructor(original_node:any=null, new_node:any=null, diff:any=null){
        this.originalnode = original_node;
        this.diff = diff;
        this.newnode = new_node;    
        this.e = (diff===null);
    }

    getDiffFromOriginal():any{
        return this.originalnode;
    }

    getDiffFromNew():any{
        return this.newnode;
    }

    getDiff():any{
        return this.diff;
    }

    isIdentic():boolean{
        return this.e;
    }
}
