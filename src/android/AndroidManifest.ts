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

import DexcaliburProject from "../DexcaliburProject.js";
import {ModelPermission, AndroidPermissionGroup, AndroidPermissionSdk23, AndroidPermissionTree} from "./ModelPermission.js";
import AndroidApplication from "./AndroidApplication.js";
import {AndroidAttributeSet} from "./AndroidAttribute.js";
import {
    AndroidConfiguration, AndroidFeature,
    AndroidGlTexture,
    AndroidInstrumentation,
    AndroidScreen,
    AndroidSupportedScreen
} from "./DeviceComponent.js";
import {AndroidRRO} from "./AndroidRRO.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType, SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {IntentFilter} from "./IntentFilter.js";
import ModelClass from "../ModelClass.js";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import { Nullable } from "../core/IStringIndex.js";
import {ResourceReference} from "./AndroidResource.js";
import ModelResource from "../ModelResource.js";

export interface AndroidSharedUser {
    id: Nullable<string>;
    label: Nullable<string|ResourceReference|ModelResource<any>>;
    maxSdkVersion: Nullable<number>;
}

export class AndroidManifest implements INode
{

    static TYPE:NodeType = (new NodeType( "androidManifest", NodeInternalType.ANDROID_MANIFEST, [
        (new NodeProperty("name")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("description")).type(DbDataType.STRING).def(""),
        (new NodeProperty("label")).type(DbDataType.STRING).def(""),
        (new NodeProperty("attr")).type(DbDataType.STRING).def({}),
        (new NodeProperty("metadata")).type(DbDataType.STRING).def({}),
        (new NodeProperty("__impl")).single(ModelClass.TYPE),
    ]))
        .dataSource("PROJECT_DB"); //, "androidActivity");

    __:NodeInternalType = NodeInternalType.ANDROID_MANIFEST;

    uuid:string;

    attributes:AndroidAttributeSet = {};

    usesPermissions:ModelPermission[] = [];
    permissions:ModelPermission[] = [];
    permissionTrees:AndroidPermissionTree[] = [];
    permissionGroups:AndroidPermissionGroup[] = [];
    instrumentation:AndroidInstrumentation[] = [];
    usesPermissionsSdk23:AndroidPermissionSdk23[] = [];
    //protectedBroadcast:AndroidBroadcast[] = []

    usesSdk:any = {};

    usesConfiguration:AndroidConfiguration[] = [];
    usesFeatures = [];

    supportsScreens:AndroidSupportedScreen[] = null;
    compatibleScreens:AndroidScreen[] = [];
    supportsGlTextures:AndroidGlTexture[] = [];
    application:AndroidApplication = null;

    overlays:AndroidRRO[] = [];

    __context:DexcaliburProject = null;
    __additionalContent:any = {};

    tags:TagUUID[] = [];

    constructor(ctx:DexcaliburProject=null){

        this.usesSdk = {
            'android:minSdkVersion': null,
            'android:targetSdkVersion': null,
        };

        this.__context = ctx;
    }

    getUID(): string | null {
        return this.uuid;
    }

    static fromXml(config:any, context:Nullable<DexcaliburProject> = null){
        let self:AndroidManifest = new AndroidManifest();
        // init manifest attributes
        for(let i in config){
            switch(i){
                case '$':
                    self.setAttributes(config['$']);
                    break;
                case 'uses-sdk':
                    config['uses-sdk'].map(function(k){
                        self.usesSdk = k.$;
                    });
                    break;
                case 'uses-permission':
                    config['uses-permission'].map(function(k){
                        self.usesPermissions.push(ModelPermission.fromXml(k.$));
                    });
                    break;
                case 'permission':
                    config['permission'].map(function(k){
                        self.permissions.push(ModelPermission.fromXml(k.$));
                    });
                    break;
                case 'permission-group':
                    config['permission-group'].map(function(k){
                        self.permissionGroups.push(AndroidPermissionGroup.fromXml(k.$));
                    });
                    break;
                case 'permission-tree':
                    config['permission-tree'].map(function(k){
                        self.permissionTrees.push(AndroidPermissionTree.fromXml(k.$));
                    });
                    break;
                case 'uses-feature':
                    config['uses-feature'].map(function(k){
                        self.usesFeatures.push(AndroidFeature.fromXml(k.$));
                    });
                    break;
                case 'supports-gl-texture':
                    config['supports-gl-texture'].map(function(k){
                        self.supportsGlTextures.push(AndroidGlTexture.fromXml(k.$));
                    });
                    break;
                case 'compatible-screens':
                    config['compatible-screens'].map(function(k){
                        self.compatibleScreens.push(AndroidScreen.fromXml(k.$));
                    });
                    break;
                case 'supports-screens':
                    if(self.supportsScreens===null) self.supportsScreens = [];
                    config['supports-screens'].map(function(k){
                        self.supportsScreens.push(AndroidSupportedScreen.fromXml(k.$));
                    });
                    break;
                case 'uses-configuration':
                    if(self.usesConfiguration===null) self.usesConfiguration = [];

                    config['uses-configuration'].map(function(k){
                        self.usesConfiguration.push(AndroidConfiguration.fromXml(k.$));
                    });
                    break;
                case 'uses-permission-sdk-23':
                    if(self.usesPermissionsSdk23===null) self.usesPermissionsSdk23 = [];

                    config['uses-permission-sdk-23'].map(function(k){
                        self.usesPermissionsSdk23.push(AndroidPermissionSdk23.fromXml(k.$));
                    });
                    break;
                case 'instrumentation':
                    if(self.instrumentation===null) self.instrumentation = [];

                    config['instrumentation'].map(function(k){
                        self.instrumentation.push(AndroidInstrumentation.fromXml(k.$));
                    });
                    break;
                case 'application':
                    if(config[i] instanceof AndroidApplication){
                        self.application = config[i];
                    }else{
                        self.application = AndroidApplication.fromXml(context, config[i][0]);
                        if(context!=null){
                            context.trigger({
                                type: "app.application.new",
                                data: self.application
                            })
                        }
                    }
                    self.application.setManifest(self);
                    break;
                case 'overlay':
                    config['overlay'].map(function(k){
                        self.overlays.push(AndroidRRO.fromXml(k.$));
                    });
                    break;
               /* case 'protected-broadcast':
                    config['protected-broadcast'].map(function(k){
                        self.protectedBroadcast.push(Android.fromXml(k.$));
                    });
                    break;*/
                default:
                    self.__additionalContent[i] = config[i];
                    break;
            }
        }

        //console.log(self.__additionalContent);

        return self;
    }

    toXml():any{
        let o:any = {};

        o.$ = {};
        for(let i in this.attributes){
            o.$[i] = this.attributes[i];
        }

        if(this.usesPermissions.length > 0){
            o['uses-permission'] = [];
            this.usesPermissions.map(perm => {
                o['uses-permission'].push(perm.toXmlObject());
            });
        }

        if(this.permissions.length > 0){
            o['permission'] = [];
            this.permissions.map(perm => {
                o['permission'].push(perm.toXmlObject());
            });
        }

        if(this.permissionGroups.length > 0){
            o['permission-group'] = [];
            this.permissionGroups.map(perm => {
                o['permission-group'].push(perm.toXmlObject());
            });
        }

        if(this.permissionTrees.length > 0){
            o['permission-tree'] = [];
            this.permissionTrees.map(perm => {
                o['permission-tree'].push(perm.toXmlObject());
            });
        }

        if(this.instrumentation != null && this.instrumentation.length > 0){
            o['instrumentation'] = [];
            this.instrumentation.map(perm => {
                o['instrumentation'].push(perm.toXmlObject());
            });
        }

        if(this.usesPermissionsSdk23 != null && this.usesPermissionsSdk23.length > 0){
            o['uses-permission-sdk-23'] = [];
            this.usesPermissionsSdk23.map(perm => {
                o['uses-permission-sdk-23'].push(perm.toXmlObject());
            });
        }

        if(this.usesConfiguration != null && this.usesConfiguration.length > 0){
            o['uses-configuration'] = [];
            this.usesConfiguration.map(perm => {
                o['uses-configuration'].push(perm.toXmlObject());
            });
        }

        if(this.usesFeatures != null && this.usesFeatures.length > 0){
            o['uses-feature'] = [];
            this.usesFeatures.map(perm => {
                o['uses-feature'].push(perm.toXmlObject());
            });
        }

        if(this.usesSdk != null && this.usesSdk.length > 0){
            o['uses-sdk'] = [];
            o['uses-sdk'].push(this.usesSdk);
        }

        if(this.supportsScreens != null && this.supportsScreens.length > 0){
            o['supports-screens'] = [];
            this.supportsScreens.map(perm => {
                o['supports-screens'].push(perm.toXmlObject());
            });
        }
        if(this.compatibleScreens != null && this.compatibleScreens.length > 0){
            o['compatible-screens'] = [];
            this.compatibleScreens.map(perm => {
                o['compatible-screens'].push(perm.toXmlObject());
            });
        }
        if(this.supportsGlTextures != null && this.supportsGlTextures.length > 0){
            o['supports-gl-texture'] = [];
            this.supportsGlTextures.map(perm => {
                o['supports-gl-texture'].push(perm.toXmlObject());
            });
        }
        if(this.usesFeatures != null && this.usesFeatures.length > 0){
            o['uses-feature'] = [];
            this.usesFeatures.map(perm => {
                o['uses-feature'].push(perm.toXmlObject());
            });
        }
        if(this.overlays != null && this.overlays.length > 0){
            o['overlay'] = [];
            this.overlays.map(over => {
                o['overlay'].push(over.toXmlObject());
            });
        }

        o.application = this.application.toXmlObject();

        if(Object.keys(this.__additionalContent).length > 0){
            for(let i in this.__additionalContent){
                o[i] = this.__additionalContent[i];
            }
        }

        return o;
    }

    setAttributes(attrs:any){
        this.attributes = attrs;
    }

    getAttrVersionCode():string{
        return this.attributes['android:versionCode'];
    }

    getAttrVersionName():string{
        return this.attributes['android:versionName'];
    }

    /**
     * To get the application package name
     *
     * @return {string} Package name
     * @method
     */
    getAttrPackage():string{
        return this.attributes['package'];
    }

    getAttrPlatformBuildVersionCode():string{
        return this.attributes['platformBuildVersionCode'];
    }

    getAttrPlatformBuildVersionName():string{
        return this.attributes['platformBuildVersionName'];
    }

    getAttrXmlNS():string{
        return this.attributes['xmlns:android'];
    }

    getMinSdkVersion():string{
        return this.usesSdk['android:minSdkVersion'];
    }

    getTargetSdkVersion():string{
        return this.usesSdk['android:targetSdkVersion'];
    }

    /**
     * To get the Application description as declared into the manifest
     * @returns {AndroidApplication} The manifest's description of the application
     */
    getApplication():AndroidApplication{
        return this.application;
    }

    /**
     * To get the permissions of the applciaton as declared into the manifest
     *
     */
    getPermissions(){
        return this.permissions;
    }

    /**
     * To check is the application require the given permission
     * @param {ModelPermission | String} perm The permission to search
     * @returns {Boolean} Return TRUE if the given permission is required, else FALSE
     */
    requirePermission(perm:ModelPermission|string):boolean{
        let res:boolean = false;
        if(perm instanceof ModelPermission){
            this.usesPermissions.map(function(p){
                if(p.getName()===perm.getName())
                    res = true;
            })
        }else{
            this.usesPermissions.map(function(p){
                if(p.getName()===perm)
                    res = true;
            })
        }
        return res;
    }

    hasEntries( pPpt:string):boolean {
        return this[pPpt].length > 0;
    }

    isRuntimeResourceOverlay():boolean {
        return (this.overlays.length >0);
    }

    /**
     * To extract shared user info from <manifest>
     *
     * @return {Nullable<AndroidSharedUser>} Info about shared user or null
     * @method
     */
    getSharedUser():Nullable<AndroidSharedUser> {

        if(this.attributes['android:sharedUserId']==null){
            return null;
        }

        const info:AndroidSharedUser = {
            id:  this.attributes['android:sharedUserId'],
            label:  this.attributes['android:sharedUserLabel'],
            maxSdkVersion: null
        };


        if(info.maxSdkVersion!=null && (typeof info.maxSdkVersion=='string')){
            info.maxSdkVersion = parseInt(info.maxSdkVersion as any);
        }

        return info;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        const o = {
            uuid: this.uuid,
            attributes: {},
            usesPermissions: [],
            permissions: [],
            permissionTrees: [],
            permissionGroups: [],
            instrumentation: [],
            usesPermissionsSdk23: [],
            usesSdk: {},
            usesConfiguration: [],
            usesFeatures: [],
            supportsScreens: [],
            compatibleScreens: [],
            supportsGlTextures: [],
            application: this.application,
            overlays: [],
            __additionalContent: {},
            tags: []
        }

        return o;
    }

    getAttr(pKey:string):Nullable<string>{
        return this.attributes[pKey];
    }
}
AndroidManifest.TYPE.builder(AndroidManifest);