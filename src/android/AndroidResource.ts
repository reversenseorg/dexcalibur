import {IStringIndex, Nullable} from "../core/IStringIndex.js";
import {TreeNode} from "../common/TreeNode.js";
import {DataLocation, DataLocationType} from "../DataLocation.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import ModelResource from "../ModelResource.js";
import ModelField from "../ModelField.js";
import ModelStringValue from "../ModelStringValue.js";
import ModelFile from "../ModelFile.js";

/**
 * Map resource name to offset in entries list
 */
export interface AndroidResourceMap {
 [id:string] :number;
}

export interface AndroidResourceOpts {
    _attr?:any;
    _type?:string;
    _value?:Nullable<string|ResourceReference>;
    _entries?:AndroidResource[];
    _children?:AndroidResourceMap;
}



/**
 *
 * https://cs.android.com/android-studio/platform/tools/adt/idea/+/mirror-goog-studio-main:layout-inspector/src/com/android/tools/idea/layoutinspector/resource/data/Resource.kt;l=25?q=resource
 *
 * ResourceReference:
 *
 *  Represents the components of a resource ID.
 *  For example, with "@android:id/textView", "android" is the namespace, "id" is the type, and
 *  "textView" is the name.
 *
 *  @interface
 */
export interface ResourceReference {
    /**
     * Namespace of the component referenced
     * @type {string}
     */
    namespace?:string;
    /**
     * Type of the component referenced
     * @type {string}
     */
    type:string;
    /**
     * Name of the component referenced
     * @type {string}
     */
    name:string;
}


/**
 * represents a bundle of resources from a single type (according to file
 * hierarchy)
 *
 *
 * @class
 * @deprecated
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

    static RES_REF_PATTERN = /^@(?:(?<ns>[a-zA-Z0-9._]+):)?(?<type>[a-zA-Z0-9._]+)\/(?<name>[a-zA-Z0-9_.]+)$/;

    _attr:any = {};
    _type:string = "";
    _value:Nullable<ResourceReference | string> = null;
    _entries:AndroidResource[] = [];
    _children:AndroidResourceMap = {};


    constructor( pConfig:AndroidResourceOpts) {
        this.update(pConfig);
    }

    update(pOptions: AndroidResourceOpts) {
        for(let i in pOptions){
            (this as IStringIndex<any>)[i] = pOptions[i];
        }
    }

    add(pEntry:AndroidResource):void {
        this._entries.push(pEntry);
    }

    static fromXmlFile(pFile:ModelFile, pType:Nullable<string> = null):AndroidResource[] {
        const res:AndroidResource[] = [];

        // const data = XmlParser.parse(pFile);

        return res;
    }

    /**
     * To create AndroidResource tree from raw xml
     *
     * @param pXml
     * @param pResType
     * @static
     * @return {AndroidResourceType|AndroidResource}
     */
    static fromXml(pXml:any, pResParent:Nullable<AndroidResourceType|AndroidResource>, pType:string = null):AndroidResource[]{

        let ress:AndroidResource[] = [];
        let res:AndroidResource[];

        function createRes(pData:any):AndroidResource{
            let opts:AndroidResourceOpts = {
                // gather type from tag of the node
                _type: (pType!=null ? pType : pData['#name']),
                _attr: {},
                _entries: [],
                _value: null
            };

            // gather node attributes
            if(pData.$!=null){
                for(let k in pData.$){
                    opts._attr[k] = AndroidResource.parseReferenceIfPresent(pData.$[k]);
                }
            }

            // create res instance with attr
            let res = new AndroidResource(opts);
            let dataType = (typeof pData);

            // get node content (aka value)
            if(pData._!=null){
                opts._value = AndroidResource.parseReferenceIfPresent(pData._);
            }

            // browse children
            if(pData['$$']!=null){
                pData['$$'].map((vChild:any)=>{
                    opts._entries.push(createRes(vChild));
                })
            }
            /*
            for(let k in pData){
                // skip attr
                //if(k === '$') continue;
                // gather value (between begin and end tags)
                if(k === '_'){
                    //opts._value = pData._;
                    opts._value = AndroidResource.parseReferenceIfPresent(pData._);
                    continue;
                }

                if(Array.isArray(pData[k])){
                    pData[k].map(x => {
                        const r = createRes(x);
                        r._type = x['#name'];
                        opts._entries.push(r);
                    });
                }else{
                    //console.log(k,pData[k]);
                }
            }*/

            // update attr
            res.update(opts);

            return res;
        }


        let re:AndroidResource = null;

        if(Array.isArray(pXml)==true){
            // the root node (out of scope) has multiple nodes at the same level
            pXml.map(v => {
                const r = createRes( v)
                ress.push(r);
                if(pResParent != null){
                    pResParent.add(r);
                }
            });
        }else{
            // the root node has a single child nodes
            if(Object.values(pXml).length>1){
                console.log("Object.values(pXml).length>1 : ",pXml);
                throw new Error("Cannot parse android ressource ");
            }else if(Object.values(pXml).length == 1){
                re = createRes(Object.values(pXml)[0]);
                ress.push(re);
                if(pResParent != null){
                    pResParent.add(re);
                }
            }

        }
        /*
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
                ress.push(re);
                if(pResParent != null){
                    pResParent.add(re);
                }
            }
        }*/

        return ress;
    }

    /**
     * To test ifa string is formated as a reference to a resource
     *
     * @param {string} pStr A string to test
     * @return {boolean} TRUE if the string is a ref to a resource, else FALSE
     * @method
     * @static
     */
    static isReference(pStr:string):boolean {
        return AndroidResource.RES_REF_PATTERN.test(pStr);
    }

    /**
     *
     * @param {string} pStr
     * @returns {Nullable<ResourceReference>}
     */
    static parseReference(pStr:string):Nullable<ResourceReference> {
        let ref:ResourceReference = { type:null, name:null };

        const match = AndroidResource.RES_REF_PATTERN.exec(pStr);
        if(match != null){
            ref.type = match.groups.type;
            ref.name = match.groups.name;
            ref.namespace = match.groups.ns!=null ? match.groups.ns : null;
            return ref;
        }else{
            return null;
        }
    }

    /**
     *
     * @param pStr
     */
    static parseReferenceIfPresent(pStr:string):ResourceReference|string {
        const ref = AndroidResource.parseReference(pStr);
        if(ref==null){
            return pStr;
        }else{
            return ref;
        }
    }

    /**
     * To build a ResourceReference from this obj
     */
    getCanonicalReference(pNameSpace:string="", pType:Nullable<string> = null, pUID:Nullable<string> = null, pForce = false):string {

        let ref = "@"+(pNameSpace!=""?pNameSpace+":":"");
        ref += (pType==null ? this._type : pType)+"/";

        if(pUID!=null && pForce){
            return ref + pUID;
        }

        const idHolders = ['id','android:id','name','android:name'];

        for(let i=0; i<idHolders.length; i++){
            if(this._attr[idHolders[i]]!=null){
                return ref+this._attr[idHolders[i]];
            }
        }

        if(pUID!=null){
            return ref + pUID;
        }else{
            return null;
        }
    }

    getLocalId(pUID:Nullable<string>=null):string {

        const idHolders = ['id','android:id','name','android:name'];

        for(let i=0; i<idHolders.length; i++){
            if(this._attr[idHolders[i]]!=null){
                return this._attr[idHolders[i]];
            }
        }

        if(pUID!=null){
            return pUID;
        }else {
            return null;
        }
    }


    /**
     * To convert to ModelResource
     * @param pUID
     */
    toModelResource(pNamespace: string, pType:Nullable<string> = null, pUID:Nullable<string> = null):ModelResource {

        let value:any = null;
        const ResUID = this.getCanonicalReference(pNamespace, pType, pUID);

        const res = new ModelResource({
            location: new DataLocation({
                type: DataLocationType.FILE,
                source: {
                    fileUID: null,
                    offset: -1
                }
            }),
            _uid: ResUID,
            name: this.getLocalId(pUID),
            value: null,
            ppts: {
                type: (pType==null ? this._type : pType),
                attrs: {},
                children: this._entries
            }
        });

        if(typeof this._value === 'string'){
            value = new ModelStringValue({
                value: this._value,
                src: {
                    __: NodeInternalType.RESOURCE,
                    _uid: ResUID
                }
            });
        }else if(this._value != null){
            value = this._value;
        }
        res.value = value;

        // build attribute list
        const attr:any = {};
        if(this._attr!=null){
            for(let i in this._attr){
                if(typeof this._attr[i] === 'string'){
                    attr[i] = new ModelStringValue({
                        value: this._attr[i],
                        src: {
                            __: NodeInternalType.RESOURCE,
                            _uid: ResUID
                        }
                    });
                }else if(this._attr[i] != null){
                    attr[i] = this._attr[i];
                }
            }
        }
        res.ppts.attrs = attr;

        // convert children
        this._entries.map((vRes:AndroidResource, vKey:number) => {
           res.ppts.children[vKey] = vRes.toModelResource("");
        });

        return res;
    }

}
