import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {TreeNode} from "../common/TreeNode.js";

/**
 * Map resource name to offset in entries list
 */
export interface AndroidResourceMap {
 [id:string] :number;
}

export interface AndroidResourceOpts {
    _attr?:any;
    _type?:string;
    _value?:Nullable<string>;
    _entries?:AndroidResource[];
    _children?:AndroidResourceMap;
}


/**
 * represents a bundle of resources from a single type (according to file
 * hierarchy)
 *
 * @class
 */
export class AndroidResourceType implements TreeNode<AndroidResource> {

    _attr:any = {};
    _type:string = "";
    _entries:AndroidResource[] = [];
    _children:AndroidResourceMap = {};


    constructor(pOptions:AndroidResourceOpts) {
        this.update(pOptions);
    }

    add(pRes:AndroidResource):void {
        if(pRes._attr!=null && pRes._attr.name!=null){
            this._children[pRes._attr.name] = this._entries.push(pRes);
        }else{
            this._entries.push(pRes);
        }
    }

    update(pOptions: AndroidResourceOpts) {
        for(let i in pOptions) (this as IStringIndex<any>)[i] = pOptions[i];
    }

}


/**
 * Represents Android resources
 *
 * @class
 */
export class AndroidResource implements TreeNode<AndroidResource> {


    _attr:any = {};
    _type:string = "";
    _value:Nullable<string> = null;
    _entries:AndroidResource[] = [];
    _children:AndroidResourceMap = {};


    constructor( pConfig:AndroidResourceOpts) {
        this.update(pConfig);
    }

    update(pOptions: AndroidResourceOpts) {
        for(let i in pOptions) (this as IStringIndex<any>)[i] = pOptions[i];
    }

    add(pEntry:AndroidResource):void {
        this._entries.push(pEntry);
    }


    /**
     * To create AndroidResource tree from raw xml
     *
     * @param pXml
     * @param pResType
     * @static
     * @return {AndroidResourceType|AndroidResource}
     */
    static fromXml(pXml:any, pResParent:Nullable<AndroidResourceType|AndroidResource>, pType:string=""):AndroidResource[]{

        let ress:AndroidResource[] = [];
        let res:AndroidResource[];

        function createRes(pData:any):AndroidResource{
            let opts:any = {};

            if(pType!=null){
                opts._type = pType;
            }

            // gather attributes
            if(pData.$!=null){
                opts._attr = pData.$;
            }else{
                opts._attr = {};
            }

            opts._entries = [];

            // create res instance with attr
            let res = new AndroidResource(opts);
            for(let k in pData){
                // skip attr
                if(k === '$') continue;
                // gather value (between begin and end tags)
                if(k === '_'){
                    opts._value = pData._;
                    continue;
                }

                if(Array.isArray(pData[k])){
                    pData[k].map(x => {
                        const r = createRes(x);
                        r._type = k;
                        opts._entries.push(r);
                    });
                }else{
                    console.log(k,pData[k]);
                    //opts._value = pData[k]; //AndroidResource.fromXml(pData[k], null, k)
                }
            }
            // update attr
            res.update(opts);

            return res;
        }


        let re:AndroidResource = null;
        for(let i in pXml){
            if(Array.isArray(pXml[i])==true){
                pXml[i].map(v => {
                    const r = createRes( v)
                    ress.push(r);
                    if(pResParent != null){
                        pResParent.add(r);
                    }
                });
            }else{
                re = createRes(pXml[i]);
                re._type = i;
                ress.push(re);
                if(pResParent != null){
                    pResParent.add(re);
                }
            }
        }

        return ress;
    }
}
