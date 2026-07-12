
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

import {Modifier, ModifierFormat} from "./AccessFlags.js";
import ModelClass from "./ModelClass.js";
import ModelMethod from "./ModelMethod.js";
import NodeCompare from "./NodeCompare.js";
import {Savable, STUB_TYPE} from "./ModelSavable.js";
import * as Log from "./Logger.js";
import {ModelLocation} from "./ModelLocation.js";
import {NodeType, DataSourceHelper, SerializeOptions} from "@dexcalibur/dexcalibur-orm";

import {Metadata, NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {IPersistent} from "./persist/orm/IPersistent.js";
import {CoreDebug} from "./core/CoreDebug.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface ModelFieldOptions {
    alias?:string;
    fqcn?:string;
    name?:string;
    modifiers?:Modifier;
    type?:any;
    enclosingClass?:ModelClass;
    declaringClass?:ModelClass|string;
    _hashcode?:string;
    _isBinding?:boolean;
    metadata?:Metadata[];
}

export default  class ModelField extends Savable implements IPersistent
{

    static TYPE:NodeType = (new NodeType( "field", NodeInternalType.FIELD, [])).dataSource("MEM", "field");

    __:NodeInternalType = NodeInternalType.FIELD;

    // corresponding stub type to use during export
    //this.__stub_type__ = STUB_TYPE.FIELD;
    //$ = STUB_TYPE.FIELD;

    alias:string = null;
    fqcn:string = null;
    name:string = null;
    modifiers:Modifier = null;
    type:any = null;
    //instr:any = null;
    enclosingClass:ModelClass = null;
    declaringClass:ModelClass|string = null; // new
    __signature__:string = null;
    __aliasedSignature__:string = null;
    _hashcode:string = null;
    _isBinding:boolean = false;
    _callers:ModelMethod[] = [];
    _getters:ModelMethod[] = [];
    _setters:ModelMethod[] = [];
    tags:any = [];

    metadata:Metadata[] = [];
    /**
     * Multi typed
     */
    _:any = {};

    // oline

    /**
     *
     * @param pConfig
     */
    constructor(pConfig:Nullable<ModelFieldOptions>=null) {
        super(STUB_TYPE.FIELD);

        if(pConfig!==undefined)
            for(let i in pConfig)
                this[i]=pConfig[i];
    }

    set location (pLocation:ModelLocation) {
        this._.loc = pLocation;
    }

    get location ():ModelLocation {
        return this._.loc;
    }

    getUID():string {
        return this.__signature__;
    }

    addLocation(pLocation:ModelLocation):void {
        this._.loc = pLocation;
    }

    setValue(val:any){
        this._.v = val;
    }

    getValue(){
        return this._.v;
    }

    /**
     * To generate the aliased signature. This signature is used only by the GUI
     * component. Its aim is to improve the user experience by propagating the
     * alias value.
     *
     * @param {Boolean} update If TRUE the cached aliased signature is updated, else it returns the cached signature is returned
     * @returns {String} The aliased signature
     */
    aliasedSignature(update:boolean=false){
        if(!update || this.__aliasedSignature__==null){
            this.__aliasedSignature__ = this.type.signature()+"  "+this.alias;
        }
        return this.__aliasedSignature__;
    }


    getAlias():string{
        return this.alias;
    }


    compare(field:any):NodeCompare{
        let diff:any = [];

        for(let i in this){
            switch(i){
                case "__signature__":
                case "__aliasedSignature__":
                case "fqcn":
                case "name":
                case "_isBinding":
                    if(this[i] != field[i]){
                        diff.push({ ppt:i, old:this[i], new:field[i] });
                    }
                    break;
                case "tags":
                    // TODO : Not yet supported
                    break;
                case "type":
                    if(this.type != field.type){
                        diff.push({ ppt:"type", old:this.type.signature(), new:field.type.signature() });
                    }
                    break;
                case "modifiers":
                    // TODO : Not yet supported
                    break;
                case "alias":
                case "_getters":
                case "_setters":
                case "_callers":
               // case "instr":
                case "enclosingClass":
                    // ignore
                    break;
            }
        }

        return new NodeCompare(this, field, ((diff.length>0)? diff : null));
    }

    /**
     * To set an alias and update the aliased signature
     *
     * @param {String} name The alias value
     * @function
     */
    setAlias(name:string){
        this.alias = name;
        this.aliasedSignature(true);
    }


    import(obj:any){
        // raw impport
        super.import(obj);

        // estor modifiers
        this.modifiers = new obj.modifiers;
    };

    addSetter(meth:ModelMethod){

        // TODO : not optimized, bad complexity
        let f:boolean = false;
        const s = meth.signature();

        for(let i=0; i<this._setters.length; i++){
            if(this._setters[i].signature()==s){
                f=true;
                break;
            }
        }
        /*
        this._setters.map( (vMethod)=>{
            if(vMethod.signature()==s) f=true;
        });*/

        if(!f){
            this._setters.push(meth);
        }
    }

    getSetters():ModelMethod[]{
        return this._setters;
    }


    addGetter(meth:ModelMethod){
        // TODO : not optimized, bad complexity
        let f:boolean = false;
        const s = meth.signature();


        for(let i=0; i<this._getters.length; i++){
            if(this._getters[i].signature()==s){
                f=true;
                break;
            }
        }
        /*
        this._getters.map( (vMethod)=>{
            if(vMethod.signature()==s) f=true;
        });*/

        if(!f){
            this._getters.push(meth);
        }
    }

    getGetters():ModelMethod[]{
        return this._getters;
    }


    getEnclosingClass():ModelClass {
        return this.enclosingClass;
    }

    toJsonObject(pOptions:SerializeOptions = null):any{
        let obj:any = new Object();
        /*if(fields.length>0){
            for(let i in fields){
                if(this[fields[i]] != null && (typeof this[fields[i]] == "object")){
                    obj[fields[i]] = this[fields[i]].toJsonObject();
                }else{
                    obj[fields[i]] = this[fields[i]];
                }
            }
        }else{*/
        for(let i in this){
            if(pOptions!=null){
                if(pOptions.exclude!=null  && pOptions.exclude[i]===true) continue;
                if(pOptions.include!=null  && pOptions.include.indexOf(i)==-1) continue;
            }

            switch(i){
                case "_getters":
                case "_setters":
                case "_callers":
                    obj[i] = [];
                    for(let j=0; j<(this[i] as any).length; j++){
                        if(this[i][j] != undefined){

                            obj[i].push(this[i][j].signature()); // getSignature()
                        }
                    }
                    break;
                case "__":
                case "__signature__":
                case "__aliasedSignature__":
                case "fqcn":
                case "name":
                case "alias":
                case "_isBinding":
                    obj[i] = this[i];
                    break;
                case "tags":
                    if(this.tags.length > 0)
                        obj[i] = this[i];
                    break;
                //case "instr":
                //    break;
                case "type":
                    if(this.type != null){
                        switch (this.type.__) {
                            case NodeInternalType.OBJECT_TYPE:
                                obj.type = { __: this.type.__, arr: this.type.arr, name:this.type.name };
                                break;
                            case NodeInternalType.PRIMITIVE_TYPE:
                                obj.type = { __: this.type.__, arr: this.type.arr, name:this.type.name };
                                break;
                            default:
                                break;
                        }
                    }
                    else
                        obj.type = null;
                    break;
                case "enclosingClass":
                    if(this.enclosingClass != null){
                        obj.enclosingClass = {
                            name: this.enclosingClass.name
                        };
                        if(this.enclosingClass.alias!=null)
                            obj.enclosingClass.alias = this.enclosingClass.alias;
                    }
                    break;
                case "_":
                    if(this._.loc != null){
                        obj.location = this._.loc.toJsonObject();
                    }
                    break;
                case "modifiers":
                    if(this.modifiers != null)
                        obj.modifiers = ModifierFormat.toJsonObject(this.modifiers);
                    else
                        obj.modifiers = null;
                    break;
            }
        }
        //}
        CoreDebug.checkJsonSerialize(obj, "ModelField");
        return obj;
    }


    help(){
        let t:string="+-------------------- HELP --------------------+";
        t += "\n\t.getCallers()\tExecute the function <fn> for each row of the result set";
        t += "\n\t.signature()\tGet the java signature of the field";
        t += "\n\t.sprint()\tPrint object in a string";
        t += "\n\t.help()\tThis help";
        t += "\n";

        console.log(t)
    };

    sprint():string{
        let s:string="\t"+ModifierFormat.sprintModifier(this.modifiers)+" "+this.type.sprint()+" "+this.name;

        /*
        if(this.value != null)
            s+=" := "+this.value*/

        return s;
    };

    getCallers():ModelMethod[]{
        return this._callers;
    };


    /**
     * @deprecated
     */
    hashCode():string{
        if(this.enclosingClass === undefined) console.log(this);
        return this.enclosingClass.name+"|"+this.name;//+"|"+this.type._hashcode;
    }


    signature():string{
        if(this.__signature__ !== null) return this.__signature__;

        if(this.enclosingClass !== null)
            this.__signature__ = this.enclosingClass.name+";->"+this.name;
        else
            this.__signature__ = this.fqcn+";->"+this.name;

        return this.__signature__;
    }

}
ModelField.TYPE.builder(ModelField);

