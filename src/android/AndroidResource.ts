import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {TreeNode} from "../common/TreeNode.js";
import {DataLocation, DataLocationType} from "../DataLocation.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelResource from "../ModelResource.js";
import ModelField from "../ModelField.js";

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

export const ANDROID_RES_TYPE = {
    ARRAY: "array",
    ATTR: "attr",
    BOOL: "bool",
    COLOR: "color",
    DIMEN: "dimen",
    DRAWABLE: "drawable",
    ID: "id",
    INTEGER: "integer",
    PLURAL: "plural",
    STRING: "string",
    STYLE: "style",
    PUBLIC: "public",
    MIPMAP: "mipmap",
    LAYOUT: "layout",
    XML: "xml",
    ANIM: "anim",
    ANIMATOR: "animator",
    INTERPOLATOR: "interpolator",
    FONT: "font"
};

/**
 * Represents Android resources
 *
 * @class
 */
export class AndroidResource implements TreeNode<AndroidResource> {

    TYPE_ATTR

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
            let dataType = (typeof pData);

            switch (dataType){
                case "object":
                    if(pData==null){
                        opts._value = pData;
                    }else{
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
                            }
                        }
                    }
                    break;
                default:
                    opts._value = pData; //AndroidResource.fromXml(pData[k], null, k)
                    break;
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

    /**
     * To convert to ModelResource
     * @param pUID
     */
    toModelResource(pUID: string):ModelResource {

        const type = pUID.split("/")[0].substring(1);
        let value:any = null;
        switch (type){
            case ANDROID_RES_TYPE.DRAWABLE:
            case ANDROID_RES_TYPE.XML:
            case ANDROID_RES_TYPE.LAYOUT:
            case ANDROID_RES_TYPE.FONT:
            case ANDROID_RES_TYPE.ANIMATOR:
            case ANDROID_RES_TYPE.COLOR:
            case ANDROID_RES_TYPE.MIPMAP:
            case ANDROID_RES_TYPE.INTERPOLATOR:
                break;
            case ANDROID_RES_TYPE.STRING:
                value = this._value;
                break;
            case ANDROID_RES_TYPE.ID:
                // create ModelReference ?
            case ANDROID_RES_TYPE.ARRAY:
            case ANDROID_RES_TYPE.ATTR:
            case ANDROID_RES_TYPE.BOOL:
            case ANDROID_RES_TYPE.DIMEN:
            //case ANDROID_RES_TYPE.DRAWABLE:
            case ANDROID_RES_TYPE.STYLE:
            case ANDROID_RES_TYPE.PLURAL:
            case ANDROID_RES_TYPE.INTEGER:
                // export entries, setup value
                value = null;
                break;
        }

        return new ModelResource({
            location: new DataLocation({
                type: DataLocationType.FILE,
                source: {
                    nodeType: NodeInternalType.FILE,
                    // node: pRes.,
                    // offset: pOffset,
                    // length: pLength
                }
            }),
            _uid: pUID,
            name: pUID,
            value: value,
            ppts: {
                attrs: this._attr,
                children: this._entries
            }
        });
    }
}
