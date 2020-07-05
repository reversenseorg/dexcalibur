

/**
 * Encapsulate metadata
 * @param {Object} cfg
 */
export default class ModelMetadata
{
    alias:string;
    comment:string;
    tags:any;

    constructor(pConfig:any) {
        this.alias = (pConfig.alias!=null? pConfig.alias : null);
        this.comment = (pConfig.comment!=null? pConfig.comment : null);
        this.tags = [];
    }

    setAlias(name:string){
        this.alias = name;
    }

    getAlias():string{
        return this.alias;
    }

    setComment(name:string){
        this.comment = name;
    }

    getComment():string{
        return this.comment;
    }

    addTag( name:string ){
        if(this.tags.indexOf(name)==-1)
            this.tags.push(name);
    }

    getTags():any{
        return this.tags;
    }
}


