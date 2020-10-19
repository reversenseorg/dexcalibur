

export class SerializeSelector {
    field:string;
    alias
    cond:boolean = false;
    selectors:SerializeSelector[];
}



const TOKEN_RE = /^([a-zA-Z0-9_]+)(=>[a-zA-Z0-9_]+)*(<[a-zA-Z0-9_]+>)?(\[.*\])?$/;
const CLASS_RE = /^<([a-zA-Z0-9_]+)>$/;
const SUBF_RE = /^([a-zA-Z0-9_])=>([a-zA-Z0-9_]+)$/;

/**
 *  name,ret<TYPE>[field1:field2],..
 *
 *  name,absolute_size,size,children<ModelClass>[name:simpleName=>sname],children<ModelPackage>[name:sname],
 *
 */
export class SerializeFilter {

    query:string = null;
    fields:string[]


    constructor() {
    }

    prepare(pSelector:string): SerializeFilter {

        let rootFields:string[] = pSelector.split(',');

        rootFields.map( (pField) => {
            let m = TOKEN_RE.exec(pField);



        });

        return this;
    }

    process( pObject:any):any {

    }

}