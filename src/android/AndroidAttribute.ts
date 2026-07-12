

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

export enum ATTR_TYPE {
    NONE,
    STRING,
    NUMBER,
    REFERENCE,
    STRING_RES,
    DRAWABLE_RES,
    LIST,
    BOOLEAN
};

// TODO : add resolving of @xxxx/yyyy references
export class AndroidAttribute {

    name:string;
    value:string;
    type:ATTR_TYPE = null;

    constructor(pValue:string, pType:ATTR_TYPE = ATTR_TYPE.NONE, pName:string = null) {
        if(pType != ATTR_TYPE.NONE){
            this.value = pValue;
            if(pValue!=null && pValue.length>0 && pValue[0]=='@')
                this.type = ATTR_TYPE.REFERENCE;
            else
                this.type = ATTR_TYPE.STRING;
        }else{
            this.value = pValue;
            this.type = pType;
        }
        this.name = pName;
    }

    getValue(){
        return this.value;
    }

    getName(){
        return this.name;
    }

    isResRef(){
        return this.type==ATTR_TYPE.STRING_RES || this.type==ATTR_TYPE.DRAWABLE_RES;
    }

    /**
     * To clone and set value of a specific attribute
     * @param pValue
     */
    with( pValue:any):AndroidAttribute {
        const o = new AndroidAttribute( null, this.type, this.name);
        o.value = pValue;
        return o;
    }
}


// TODO : add resolving of @xxxx/yyyy references
export interface AndroidAttributeSet {
    [ppt :string] :string
}


// TODO : add resolving of @xxxx/yyyy references
export interface AndroidAttributeMap {
    [ppt :string] :AndroidAttribute
}






export const AndroidAttributeModel:AndroidAttributeMap = {
    authorities: new AndroidAttribute( null, ATTR_TYPE.LIST, "authorities"),
    directBootAware: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "directBootAware"),
    enabled: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "enabled"),
    exported: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "exported"),
    grantUriPermissions: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "grantUriPermissions"),
    icon: new AndroidAttribute( null, ATTR_TYPE.DRAWABLE_RES, "icon"),
    initOrder: new AndroidAttribute( null, ATTR_TYPE.NUMBER, "initOrder"),
    label: new AndroidAttribute( null, ATTR_TYPE.STRING_RES, "label"),
    multiprocess: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "multiprocess"),
    name: new AndroidAttribute( null, ATTR_TYPE.STRING, "name"),
    permission: new AndroidAttribute( null, ATTR_TYPE.STRING, "permission"),
    process: new AndroidAttribute( null, ATTR_TYPE.STRING, "process"),
    readPermission: new AndroidAttribute( null, ATTR_TYPE.STRING, "readPermission"),
    syncable: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "syncable"),
    writePermission: new AndroidAttribute( null, ATTR_TYPE.STRING, "writePermission"),
    protectionLevel: new AndroidAttribute( null, ATTR_TYPE.STRING, "protectionLevel"),
    permissionGroup: new AndroidAttribute( null, ATTR_TYPE.STRING, "permissionGroup"),
    description: new AndroidAttribute( null, ATTR_TYPE.STRING_RES, "description"),

    // allow an application to be shared by multiple user instead of have multiple instance of the same app
    // so, if the shared component is vulnerable it can allow an app to give RCE on other app
    singleUser: new AndroidAttribute( null, ATTR_TYPE.STRING, "singleUser"),
    visibleToInstantApps: new AndroidAttribute( null, ATTR_TYPE.BOOLEAN, "visibleToInstantApps")
};