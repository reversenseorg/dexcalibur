/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {IntentFilter} from "./IntentFilter.js";
import {CoreDebug} from "../core/CoreDebug.js";

const ANDROID_PREFIX = "android:";
const ANDROID_PREFIX_LEN = 8;

class IntentCriteria
{

    __attr:any = null;
    name:string = null;

    constructor(){
        this.__attr = [];
        this.name = null;
    }

    getName():string{
        return this.name;
    }

    getAttributes():any{
        return this.__attr;
    }

    getAttribute(name:string):any{
        return this.__attr[name];
    }

    toJsonObject():any{
        let o:any = new Object();
        o.name = this.__attr.name;
        CoreDebug.checkJsonSerialize(o, "IntentCriteria");
        return o;
    }
}

export class IntentActionCriteria extends IntentCriteria
{
    static androidPrefixed = [];

    constructor(){
       super();
    }

    setAttributes(attr:any){
        let n:string="";
        for(let i in attr){
            if(i.startsWith(ANDROID_PREFIX)){
                n = i.substr(ANDROID_PREFIX_LEN);
                if(IntentActionCriteria.androidPrefixed.indexOf(n)==-1)
                    IntentActionCriteria.androidPrefixed.push(n);
                this.__attr[n] = attr[i];
            }else{
                this.__attr[i] = attr[i];
            }
        }
    }

    static fromXml(xmlobj:any):IntentActionCriteria{
        let o:any = new IntentActionCriteria();

        o.setAttributes(xmlobj);
        o.name = o.__attr.name;

        return o as IntentActionCriteria;
    }

    toXmlObject():any{
        let o:any = {};

        o.$ = {};
        for(let i in this.__attr){
            if(IntentActionCriteria.androidPrefixed.indexOf(i)>-1)
                o.$[ANDROID_PREFIX+i] = this.__attr[i];
            else
                o.$[i] = this.__attr[i];
        }

        return o;
    }
}


export class IntentCategoryCriteria extends IntentCriteria
{
    static androidPrefixed = [];

    constructor(){
        super();
    }

    setAttributes(attr:any):void{
        let n:string="";
        for(let i in attr){
            if(i.startsWith(ANDROID_PREFIX)){
                n = i.substr(ANDROID_PREFIX_LEN);
                if(IntentCategoryCriteria.androidPrefixed.indexOf(n)==-1)
                    IntentCategoryCriteria.androidPrefixed.push(n);
                this.__attr[n] = attr[i];
            }else{
                this.__attr[i] = attr[i];
            }
        }
    }

    static fromXml(xmlobj:any):IntentCategoryCriteria{
        let o:any = new IntentCategoryCriteria();

        o.setAttributes(xmlobj);
        o.name = o.__attr.name;

        return o as IntentCategoryCriteria;
    }

    toXmlObject():any{
        let o:any = {};

        o.$ = {};
        for(let i in this.__attr){
            if(IntentCategoryCriteria.androidPrefixed.indexOf(i)>-1)
                o.$[ANDROID_PREFIX+i] = this.__attr[i];
            else
                o.$[i] = this.__attr[i];
        }

        return o;
    }
}

export class IntentDataCriteria
{
    scheme:string =null;
    host:string =null;
    port:string =null;
    path:string =null;
    pathPattern:string =null;
    pathPrefix:string =null;
    mimeType:string =null;

    constructor(){

    }


    static fromXml(xmlobj:any):IntentDataCriteria{
        let o:any = new IntentDataCriteria();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                o[i.substring(8)] = xmlobj[i];
            }else{
                o[i] = xmlobj[i];
            }
        }

        return o as IntentDataCriteria;
    }


    toJsonObject():any{
        let o:any = new Object();
        o.scheme = this.scheme;
        o.host = this.host;
        o.port = this.port;
        o.path = this.path;
        o.pathPattern = this.pathPattern;
        o.pathPrefix = this.pathPrefix;
        o.mimeType = this.mimeType;
        CoreDebug.checkJsonSerialize(o, "IntentDataCriteria");
        return o;
    }
}

export class AndroidIntentable
{
    intentFilters:IntentFilter[] = [];


    addIntentFilters(filter:IntentFilter){
        filter.generateUID(this);
        this.intentFilters.push(filter);
    }

    getIntentFilters():IntentFilter[]{
        return this.intentFilters;
    }

    countIntentFilter():number{
        return this.intentFilters.length;
    }

    getIntentFilterByUid(id:string):IntentFilter{
        for(let i:number=0; i<this.intentFilters.length; i++){
            if(this.intentFilters[i].getUid()===id)
                return this.intentFilters[i];
        }
        return null;
    }
}