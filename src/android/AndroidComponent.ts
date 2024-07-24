/**
 * A superclass for activity/receiver/provider/service
 */

import {AndroidIntentable} from "./Intent.js";
import ModelClass from "../ModelClass.js";
import {AndroidAttributeSet} from "./AndroidAttribute.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {CryptoUtils} from "../CryptoUtils.js";
import {CoreDebug} from "../core/CoreDebug.js";
import {SerializeOptions} from "@dexcalibur/dexcalibur-orm";


const ANDROID_PREFIX = "android:";
const ANDROID_PREFIX_LEN = 8;

export default class AndroidComponent extends AndroidIntentable
{
    __:NodeInternalType;

    androidPrefixed:string[] = [];
    attr:AndroidAttributeSet = {};

    label:string = null;
    name:string = null;

    metadata:any = null;

    __id:string = null;
    __impl:any = null;
    __tag:any = [];
    __ppts:any = {};

    constructor() {
        super();
    }

    generateUID(){
        if(this.name == null) throw new Error("[ANDROID COMPONENT] Unable to generate UID");

        this.__id = CryptoUtils.md5(this.name);
    }

    getUID():string{
        return this.__id;
    }

    setImplementedBy(cls:ModelClass){
        this.__impl = cls;
    }

    getImplementedBy():ModelClass{
        return this.__impl;
    }


    getAttributes():any{
        return this.attr;
    }

    getAttribute(name:string):any{
        return this.attr[name];
    }

    getLabel():string{
        return this.label
    }

    getName():string{
        return this.name;
    }

    addTag(tag:any){
        if(this.__tag.indexOf(tag)==-1)
            this.__tag.push(tag);
    }

    getTags():any{
        return this.__tag;
    }

    addNodeProperty(name:string, value:any):void{
        this.__ppts[name] = value
    }

    getNodeProperty(name:string):any{
        return this.__ppts[name];
    }

    isExported():boolean{
        return (this.attr.exported != null) && (this.attr.exported === "true");
    }


    setAttributes(attr:any){
        let n:string="";
        for(let i in attr){
            if(i.startsWith(ANDROID_PREFIX)){
                n = i.substr(ANDROID_PREFIX_LEN);
                if(this.androidPrefixed.indexOf(n)==-1)
                    this.androidPrefixed.push(n);
                this.attr[n] = attr[i];
            }else{
                this.attr[i] = attr[i];
            }
        }
    }


    /**
     * To serialize to JSON
     * @returns {String} The activity data seriualized
     * @function
     */
    toJsonObject(pOptions:SerializeOptions = {}):any{
        let o:any = new Object();

        o.__ = this.__;
        o.__id = this.__id;
        o.label = this.label;
        o.name = this.name;
        o.attr = this.attr;
        o.intentFilters = [];

        this.intentFilters.map(x => o.intentFilters.push(x.toJsonObject()));

        if(this.__impl!=null){
            o.__impl = this.__impl.signature();
        }

        if((this.__tag instanceof Array) && this.__tag.length>0){
            o.__tag = this.__tag;
        }

        o.__ppts = this.__ppts;
        CoreDebug.checkJsonSerialize(o, "AndroidComponent");
        return o;
    }


    /**
     * To serialize to XML
     * @returns {String} The activity data ready to be writen into an XML file
     * @function
     */
    toXmlObject():any {
        let o: any = {}
        o.$ = {};
        for (let i in this.attr) {
            if (this.androidPrefixed.indexOf(i) > -1)
                o.$[ANDROID_PREFIX + i] = this.attr[i];
            else
                o.$[i] = this.attr[i];
        }

        o["intent-filter"] = [];
        for (let i = 0; i < this.intentFilters.length; i++) {
            o["intent-filter"].push(this.intentFilters[i].toXml());
        }

        return o;
    }

}