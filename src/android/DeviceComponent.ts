
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

const ANDROID_PREFIX = "android:";

class XmlSerializable
{
    androidPrefixed:string[] = [];

    /**
     * To serialize to XML
     * @returns {String} The activity data ready to be writen into an XML file
     * @function
     */
    toXmlObject():any {
        let o: any = {}
        o.$ = {};
        for (let i in this) {
            if (this.androidPrefixed.indexOf(i) > -1)
                o.$[ANDROID_PREFIX + i] = this[i];
            else
                o.$[i] = this[i];
        }

        return o;
    }
}
export class AndroidGlTexture extends XmlSerializable
{
    name:string = null;

    constructor(){
        super();
    }

    static fromXml(xmlobj:any):AndroidGlTexture{
        let o:AndroidGlTexture = new AndroidGlTexture();
        o.name = xmlobj['android:name'];
        return o;
    }
}

export class AndroidFeature extends XmlSerializable
{
    name:string = null;
    require:string = null;
    glEsVersion:string = null;

    constructor(){
        super();
    }

    static fromXml(xmlobj:any):AndroidFeature{
        let p:AndroidFeature = new AndroidFeature();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }
}



export class AndroidInstrumentation extends XmlSerializable
{

    /*static MODEL = {
        functionalTest:["true" , "false"],
        handleProfiling:["true" , "false"],
        icon:"drawable resource",
        label:"string resource",
        name:"string",
        targetPackage:"string",
        targetProcesses:"string"
    }*/


    functionalTest:string =null;
    handleProfiling:string =null;
    icon:string =null;
    label:string =null;
    name:string =null;
    targetPackage:string =null;
    targetProcesses:string =null;

    constructor(){
        super();
    }

    static fromXml(xmlobj:any):AndroidInstrumentation{
        let p:AndroidInstrumentation = new AndroidInstrumentation();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }
}


export class AndroidSupportedScreen extends XmlSerializable
{
    /*static MODEL = {
        resizeable:["true" | "false"],
        smallScreens:["true" | "false"],
        normalScreens:["true" | "false"],
        largeScreens:["true" | "false"],
        xlargeScreens:["true" | "false"],
        anyDensity:["true" | "false"],
        requiresSmallestWidthDp:"integer",
        compatibleWidthLimitDp:"integer",
        largestWidthLimitDp:"integer"
    }*/

    resizeable:string =null;
    smallScreens:string =null;
    normalScreens:string =null;
    largeScreens:string =null;
    xlargeScreens:string =null;
    anyDensity:string =null;
    requiresSmallestWidthDp:string =null;
    compatibleWidthLimitDp:string =null;
    largestWidthLimitDp:string =null;

    constructor(){
        super();
    }

    static fromXml(xmlobj:any):AndroidSupportedScreen{
        let p:AndroidSupportedScreen = new AndroidSupportedScreen();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }
}



export class AndroidScreen extends XmlSerializable
{

    screenSize:string = null;
    screenDensity:string = null;

    constructor(pConfig:any=null){
        super();
        if(pConfig!==null)
            for(let i in pConfig)
                this[i] = pConfig[i];
    }

    static fromXml(xmlobj:any):AndroidScreen{
        let p:AndroidScreen = new AndroidScreen();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }
}



export class AndroidConfiguration extends XmlSerializable
{
    /*static MODEL = {
        reqFiveWayNav:["true" | "false"],
        reqHardKeyboard:["true" | "false"],
        reqKeyboardType:["undefined" | "nokeys" | "qwerty" | "twelvekey"],
        reqNavigation:["undefined" | "nonav" | "dpad" | "trackball" | "wheel"],
        reqTouchScreen:["undefined" | "notouch" | "stylus" | "finger"]
    }*/

    reqFiveWayNav:string =null;
    reqHardKeyboard:string =null;
    reqKeyboardType:string =null;
    reqNavigation:string =null;
    reqTouchScreen:string =null;

    constructor(){
        super();
    }

    static fromXml(xmlobj:any):AndroidConfiguration{
        let p:AndroidConfiguration = new AndroidConfiguration();

        for(let i in xmlobj){
            if(i.startsWith('android:')){
                p[i.substr(8)] = xmlobj[i];
            }else{
                p[i] = xmlobj[i];
            }
        }

        return p;
    }
}

