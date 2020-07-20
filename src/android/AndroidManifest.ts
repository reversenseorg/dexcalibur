import DexcaliburProject from "../DexcaliburProject";
import {AndroidPermission, AndroidPermissionGroup, AndroidPermissionSdk23, AndroidPermissionTree} from "./Permissions";
import AndroidApplication from "./AndroidApplication";
import {AndroidAttributeSet} from "./AndroidAttribute";
import {
    AndroidConfiguration, AndroidFeature,
    AndroidGlTexture,
    AndroidInstrumentation,
    AndroidScreen,
    AndroidSupportedScreen
} from "./DeviceComponent";

export class AndroidManifest
{
    attributes:AndroidAttributeSet = {};

    usesPermissions:AndroidPermission[] = [];
    permissions:AndroidPermission[] = [];
    permissionTrees:AndroidPermissionTree[] = [];
    permissionGroups:AndroidPermissionGroup[] = [];
    instrumentation:AndroidInstrumentation[] = [];
    usesPermissionsSdk23:AndroidPermissionSdk23[] = [];

    usesSdk:any = {};

    usesConfiguration:AndroidConfiguration[] = [];
    usesFeatures = [];

    supportsScreens:AndroidSupportedScreen[] = null;
    compatibleScreens:AndroidScreen[] = [];
    supportsGlTextures:AndroidGlTexture[] = [];
    application:AndroidApplication = null;

    __context:DexcaliburProject = null;
    __additionalContent:any = {};

    constructor(ctx:DexcaliburProject=null){


        this.usesSdk = {
            'android:minSdkVersion': null,
            'android:targetSdkVersion': null,
        };

        this.__context = ctx;
    }

    static fromXml(config:any, context:DexcaliburProject){
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
                        self.usesPermissions.push(AndroidPermission.fromXml(k.$));
                    });
                    break;
                case 'permission':
                    config['permission'].map(function(k){
                        self.permissions.push(AndroidPermission.fromXml(k.$));
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
                        self.application = AndroidApplication.fromXml(config[i][0]);
                        context.trigger({
                            name: "app.application.new",
                            data: self.application
                        })

                    }
                    self.application.setManifest(self);
                    break;
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
     * @param {AndroidPermission | String} perm The permission to search
     * @returns {Boolean} Return TRUE if the given permission is required, else FALSE
     */
    requirePermission(perm:AndroidPermission|string):boolean{
        let res:boolean = false;
        if(perm instanceof AndroidPermission){
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


}
