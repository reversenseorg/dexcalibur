import AndroidActivity from "./AndroidActivity";
import AndroidProvider from "./AndroidProvider";
import AndroidService from "./AndroidService";
import AndroidReceiver from "./AndroidReceiver";
import {AndroidAttributeSet} from "./AndroidAttribute";
import {AndroidManifest} from "./AndroidManifest";



const ANDROID_PREFIX = "android:";
const ANDROID_PREFIX_LEN = 8;

export default class AndroidApplication
{
    /*static MODEL:any = {
        allowTaskReparenting:["true" | "false"],
        allowBackup:["true" | "false"],
        allowClearUserData:["true" | "false"],
        backupAgent:"string",
        backupInForeground:["true" | "false"],
        banner:"drawable resource",
        debuggable:["true" | "false"],
        description:"string resource",
        directBootAware:["true" | "false"],
        enabled:["true" | "false"],
        extractNativeLibs:["true" | "false"],
        fullBackupContent:"string",
        fullBackupOnly:["true" | "false"],
        hasCode:["true" | "false"],
        hardwareAccelerated:["true" | "false"],
        icon:"drawable resource",
        isGame:["true" | "false"],
        killAfterRestore:["true" | "false"],
        largeHeap:["true" | "false"],
        label:"string resource",
        logo:"drawable resource",
        manageSpaceActivity:"string",
        name:"string",
        networkSecurityConfig:"xml resource",
        permission:"string",
        persistent:["true" | "false"],
        process:"string",
        restoreAnyVersion:["true" | "false"],
        requiredAccountType:"string",
        resizeableActivity:["true" | "false"],
        restrictedAccountType:"string",
        supportsRtl:["true" | "false"],
        taskAffinity:"string",
        testOnly:["true" | "false"],
        theme:"resource or theme",
        uiOptions:["none" | "splitActionBarWhenNarrow"],
        usesCleartextTraffic:["true" | "false"],
        vmSafeMode:["true" | "false"]
    }*/

    androidPrefixed:string[] = [];
    attr:AndroidAttributeSet = {};

    activities:AndroidActivity[] = [];
    activityAliases = [];
    launcherActivities = [];
    services:AndroidService[] = [];
    receivers:AndroidReceiver[] = [];
    providers:AndroidProvider[] = [];

    usesLibraries = [];
    metaData = [];
    manifest:AndroidManifest = null;

    constructor(config:any=null){

        if(config!=null)
            for(let i in config)
                if(this[i] !== undefined)
                    this[i] = config[i];
    }

    static fromXml(xmlobj:any):AndroidApplication{
        let app:AndroidApplication = new AndroidApplication();

        for(let i in xmlobj.$){
            if(i.startsWith('android:')){
                app.attr[i.substr(8)] = xmlobj.$[i];
            }else{
                app.attr[i] = xmlobj.$[i];
            }
        }

        for(let j in xmlobj){
            switch(j){
                case 'activity':
                    for(let i=0; i<xmlobj.activity.length; i++){
                        app.activities.push(AndroidActivity.fromXml(xmlobj.activity[i]));
                    }
                    break;
                case 'service':
                    for(let i=0; i<xmlobj.service.length; i++){
                        app.services.push(AndroidService.fromXml(xmlobj.service[i]));
                    }
                    break;
                case 'receiver':
                    for(let i=0; i<xmlobj.receiver.length; i++){
                        app.receivers.push(AndroidReceiver.fromXml(xmlobj.receiver[i]));
                    }
                    break;
                case 'provider':
                    for(let i=0; i<xmlobj.provider.length; i++){
                        app.providers.push(AndroidProvider.fromXml(xmlobj.provider[i]));
                    }
                    break;
                case 'meta-data':
                    for(let i=0; i<xmlobj['meta-data'].length; i++){
                        app.metaData.push(xmlobj['meta-data'][i].$);
                    }
                    break;
                case 'uses-library':
                    for(let i=0; i<xmlobj['uses-library'].length; i++){
                        app.usesLibraries.push(xmlobj['uses-library'][i].$);
                    }
                    break;
            }
        }


        return app;
    }

    setManifest(pManifest:AndroidManifest):void{
        this.manifest = pManifest;
    }


    getMinApiVersion():string{
        if(this.manifest != null){
            return this.manifest.getMinSdkVersion();
        }else{
            return null;
        }
    }


    getTargetApiVersion():string{
        if(this.manifest != null){
            return this.manifest.getTargetSdkVersion();
        }else{
            return null;
        }
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


        return o;
    }
}
