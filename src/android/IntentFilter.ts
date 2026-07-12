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

import {IntentActionCriteria, IntentCategoryCriteria, IntentDataCriteria} from "./Intent.js";
import AndroidActivity from "./AndroidActivity.js";
import {CoreDebug} from "../core/CoreDebug.js";


const UID_SEPARATOR = "-";

export class IntentFilter
{
    __id:string = null;
    action:any = [];
    category:any = [];
    data:any = [];

    constructor(config:any=null){

        this.action = [];
        this.category = [];
        this.data = [];

        // auto config
        if(config != null)
            for(let i in config)
                this[i] = config[i];

    }

    generateUID(parent):void{
        this.__id = parent.getUID()+UID_SEPARATOR+parent.countIntentFilter();
    }

    getUid():string{
        return this.__id;
    }

    getActions():IntentActionCriteria[]{
        return this.action;
    }

    getCategories(){
        return this.category;
    }

    getData(){
        return this.data;
    }

    hasData(){
        return this.data.length > 0;
    }

    toXmlObject(){
        let o:any = {action:[], category:[], data:[]};


        this.action.map( v => { o.action.push(v.toXmlObject()) });
        this.category.map( v => { o.category.push(v.toXmlObject()) });
        this.data.map( v => { o.data.push(v.toXmlObject()) });
        /*
        for(let i in this){
            for(let j=0; j<this[i].length; j++){
                o[i].push(this[i][j].toXmlObject());
            }
        }*/

        return o;
    }

    static fromXml(xmlobj:any):IntentFilter{
        let intf:any = new IntentFilter();

        if(xmlobj.action != null && xmlobj.action instanceof Array){
            for(let i=0; i<xmlobj.action.length; i++){
                intf.action.push(IntentActionCriteria.fromXml(xmlobj.action[i].$));
            }
        }


        if(xmlobj.category != null && xmlobj.category instanceof Array){
            for(let i=0; i<xmlobj.category.length; i++){
                intf.category.push(IntentCategoryCriteria.fromXml(xmlobj.category[i].$));
            }
        }


        if(xmlobj.data != null && xmlobj.data instanceof Array){
            for(let i=0; i<xmlobj.data.length; i++){
                intf.data.push(IntentDataCriteria.fromXml(xmlobj.data[i].$));
            }
        }

        return intf as IntentFilter;
    }

    toXml():any{
        throw  Error('[ANDROID INTENT] toXml() is not implemented');
    }

    /**
     *
     * @param {Activity} activity
     * @returns {String} The next valid value for Intent Filter UID
     * @function
     */
    static generateIntentFilterUID(activity:AndroidActivity):string{
        return activity.getUID()+UID_SEPARATOR+activity.intentFilters.length;
    }

    toJsonObject():any{
        let o:any = new Object();

        o.__id = this.__id;

        o.data = [];
        this.data.map(x => o.data.push(x.toJsonObject()));
        o.action = [];
        this.action.map(x => o.action.push(x.toJsonObject()));
        o.category = [];
        this.category.map(x => o.category.push(x.toJsonObject()));

        CoreDebug.checkJsonSerialize(o, "IntentFilter");
        return o;
    }
}