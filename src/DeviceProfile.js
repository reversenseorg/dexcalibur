

const TYPE = {
    mobile: 'mobile',
    watch: 'watch',
    tv: 'tv',
    other: 'other'
};

/**
 * 
 * @class
 * @author Georges-B MICHEL
 */
class SystemProfile
{
    constructor(){
        this.prop = {};
    }

    is(pData){
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

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    setProperty( pName, pValue){
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
    getABI(){
        return this.prop['ro.product.cpu.abi'];
    }

    /**
     * To get SDK version
     * 
     * @method
     */
    getSdkVersion(){
        return this.prop['ro.build.version.sdk'];
    }

    /**
     * To get device architecture
     * @method     
     */
    getArchitecture(){
        let abi = this.prop['ro.product.cpu.abi'];
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

    static fromJsonObject( pJson){
        let o = new SystemProfile();
        for(let i in pJson)
            o[i] = pJson[i];
        return o;
    }

    toJsonObject(){
        let o = {};
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
class BuildProfile
{
    constructor(){
        this.prop = {};
    }

    is(pData){
        const patterns = [
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.hwui\.'),
            new RegExp('^ro\.build\.'),
            new RegExp('^ro\.error\.'),
            new RegExp('^.*\.dalvik\.'),
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    getAbi(){
        return this.prop['ro.cpu']
    }

    setProperty( pName, pValue){
        this.prop[pName] = pValue;
    }

    getArchitecture(){

    }

    getVersion(){
        
    }

    toJsonObject(){
        let o = {};
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
class NetworkProfile
{
    constructor(){
        this.prop = {};
    }

    is(pData){
        const patterns = [
            new RegExp('^.*\.radio\.'),
            new RegExp('^.*\.net\.'),
            new RegExp('^.*\.wlan\.'),
            new RegExp('^.*\.telephony\.'),    
            new RegExp('^.*\.ril\.'),     
            new RegExp('^.*\.wifi\.'),            
        ];

        for(let i=0; i<patterns.length; i++){
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
    setProperty( pName, pValue){
        this.prop[pName] = pValue;
    }

    /**
     * 
     * @param {*} pJson 
     * @static
     */
    static fromJsonObject( pJson){
        let o = new NetworkProfile();
        for(let i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject(){
        let o = {};
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
class DeviceProfile
{
    /**
     * 
     * @param {*} pOptions 
     * @constructor
     */
    constructor( pOptions = {}){

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
    isMobileDevice(){
        return this.type == TYPE.mobile;
    }

    /**
     * @method
     */
    isWatch(){
        return this.type == TYPE.watch;
    }

    /**
     * @method
     */
    isTV(){
        return this.type == TYPE.tv;
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     * @method
     */
    addProperty( pName, pValue){
        let profiled = false;

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
    getSystemProfile(){
        return this.profiles.system;
    }

    /**
     * @method
     */
    getBuildProfile(){
        return this.profiles.build;
    }

    /**
     * 
     * @param {*} pJson 
     * @method
     * @static
     */
    static fromJsonObject( pJson){
        let o = new DeviceProfile();

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
    toJsonObject(){
        let o = {};

        for(let i in this){
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

module.exports = DeviceProfile;