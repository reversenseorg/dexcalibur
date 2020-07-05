

enum TYPE {
    mobile= 'mobile',
    watch= 'watch',
    tv= 'tv',
    other= 'other'
}


export interface Profile {
    prop:any;

    is(pData:any):boolean;
    setProperty(pName:string, pValue:any);
    toJsonObject():any;
}

/**
 * 
 * @class
 * @author Georges-B MICHEL
 */
export class SystemProfile implements  Profile
{
    prop:any;

    constructor(){
        this.prop = {};
    }

    is(pData:any):boolean{
        const patterns = [
            new RegExp('^ro\.adb\.'),
            new RegExp('^ro\.product\.'),
            new RegExp('^ro\.secure\.'),
            new RegExp('^sukernel\.'),
            new RegExp('^sys\.'),
            new RegExp('^.*\.recovery_id\.*'),


            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.hwui\.'),
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.error\.'),
            new RegExp('^.*\.dalvik\.'),
        ];

        for(let i:number=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }
     
    /*
    findProperty( pPatterns){
        for(let i=0; i<pPatterns.length; i++){
            if(pPatterns[i].test())
        }product
    }*/

    /**
     * To get ABI
     * 
     * @method   
     */
    getABI():string{
        return this.prop['ro.product.cpu.abi'];
    }

    /**
     * To get SDK version
     * 
     * @method
     */
    getSdkVersion():string{
        return this.prop['ro.build.version.sdk'];
    }

    /**
     * To get device architecture
     * @method     
     */
    getArchitecture():string{
        let abi:string = this.prop['ro.product.cpu.abi'];
        if(abi == null){
            throw new Error('[DEVICE PROFILE] Architecture of targeted device cannot be retrieved through CPU ABI.')
        }

        if(abi.startsWith('arm64'))
            return 'arm64';
        else if(abi.startsWith('arm'))
            return 'arm';
        else if(abi.startsWith('x86_64'))
            return 'x86_64';
        else
            return abi;
    }

    static fromJsonObject( pJson:any):SystemProfile{
        let o:SystemProfile = new SystemProfile();
        for(let i in pJson)
            o[i] = pJson[i];
        return o;
    }

    toJsonObject():any{
        let o:any = {};
        for(let i in this){
            o[i] = this[i];
        }
        return o;
    }
}

/**
 * 
 * @class
 * @author Georges-B MICHEL
 */
export class BuildProfile implements Profile
{
    prop:any;

    constructor(){
        this.prop = {};
    }

    is(pData:any):boolean{
        const patterns = [
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.hwui\.'),
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.error\.'),
            new RegExp('^.*\.dalvik\.'),
        ];

        for(let i:number=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    getAbi(){
        return this.prop['ro.cpu']
    }

    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }


    toJsonObject():any{
        let o:any = {};
        for(let i in this){
            o[i] = this[i];
        }
        return o;
    }
}

/**
 * 
 * @class
 * @author Georges-B MICHEL
 */
export class NetworkProfile implements Profile
{
    prop:any;

    constructor(){
        this.prop = {};
    }

    is(pData:any){
        const patterns = [
            new RegExp('^.*\.radio\.'),
            new RegExp('^.*\.net\.'),
            new RegExp('^.*\.wlan\.'),
            new RegExp('^.*\.telephony\.'),    
            new RegExp('^.*\.ril\.'),     
            new RegExp('^.*\.wifi\.'),            
        ];

        for(let i:number=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     */
    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }

    /**
     * 
     * @param {*} pJson 
     * @static
     */
    static fromJsonObject( pJson):NetworkProfile{
        let o:NetworkProfile = new NetworkProfile();
        for(let i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject():any{
        let o:any = {};
        for(let i in this){
            o[i] = this[i];
        }
        return o;
    }
}


/**
 * 
 * @class
 * @author Georges-B MICHEL
 */
export default class DeviceProfile
{
    type:TYPE;
    sys_prop:any;
    profiles:any;

    /**
     * 
     * @param {*} pOptions 
     * @constructor
     */
    constructor( pOptions:any = {}){

        this.type = TYPE.mobile;
        this.sys_prop = {};

        this.profiles = {
            //build: new BuildProfile(),
            //board: null,
            //radio: null,
            //dalvik: null,
            system: new SystemProfile(),
            network: new NetworkProfile()
        }

        for(let i in pOptions){
            this[i] = pOptions[i];
        }
    }


    /**
     * To check if the device is a mobile
     * 
     * @returns {Boolean}
     * @method
     */
    isMobileDevice():boolean{
        return this.type == TYPE.mobile;
    }

    /**
     * @method
     */
    isWatch():boolean{
        return this.type == TYPE.watch;
    }

    /**
     * @method
     */
    isTV():boolean{
        return this.type == TYPE.tv;
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     * @method
     */
    addProperty( pName:string, pValue:any):boolean{
        let profiled:boolean = false;

        this.sys_prop[pName] = pValue;
        for(let i in this.profiles){
            if(this.profiles[i].is(pName)){
                this.profiles[i].setProperty(pName, this.sys_prop[pName]);
                profiled = true;
            }
        }
        return profiled;
    }

    /**
     * @method
     */
    getSystemProfile():SystemProfile{
        return this.profiles.system;
    }

    /**
     * @method
     */
    getBuildProfile():BuildProfile{
        return this.profiles.build;
    }

    /**
     * 
     * @param {*} pJson 
     * @method
     * @static
     */
    static fromJsonObject( pJson):DeviceProfile{
        let o:DeviceProfile = new DeviceProfile();

        for(let i in pJson){
            if(i == "profiles"){
                o.profiles = {};
                for(let k in pJson[i]){
                    switch(k){
                        case 'system':
                            o.profiles.system = SystemProfile.fromJsonObject(pJson[i][k]);
                        case 'network':
                            o.profiles.network = NetworkProfile.fromJsonObject(pJson[i][k]);
                    }
                } 
            }else
                o[i] = pJson[i];
        }
        return o;
    }

    /**
     * @method
     */
    toJsonObject( pExcludeList:any={}):any{
        let o:any = {};

        for(let i in this){
            if(pExcludeList[i] === true) continue;
            
            if(i == "profiles"){
                o.profiles = {};
                for(let k in this.profiles){
                    o.profiles[k] = this.profiles[k].toJsonObject();
                }
            }else
                o[i] = this[i];
        }

        return o;
    }
}
