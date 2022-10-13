import {ABI, AbiManager, InstructionSet} from "./binary/ABI";
import {AbiException} from "./errors/AbiException";
import {Architecture} from "./Architecture";
import {OperatingSystem} from "./OperatingSystem";
import Certificate from "./formats/common/Certificate";


enum TYPE {
    mobile= 'mobile',
    watch= 'watch',
    tv= 'tv',
    automotive='automotive',
    iot='iot',
    computer='computer',
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


    /**
     * To handle the case where the final user specify this device is emulated
     */
    emulated = false;

    arch:Architecture = null;

    os:OperatingSystem = null;

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
            new RegExp('^uname$'),
        ];

        for(let i=0; i<patterns.length; i++){
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

    getISAs():InstructionSet[] {
        const devabi:ABI = this.getABI();
        if(devabi!=null){
            return devabi.instrSet;
        }else{
            throw AbiException.UNDETECTABLE_ISA(this.prop['ro.product.cpu.abi']);
        }
    }

    getOperatingSystem(pUpdate=false):OperatingSystem {
        if(this.os != null && !pUpdate) return this.os;

        const uname:string = this.prop['uname'];

        if(uname == null){
            throw new Error('[DEVICE PROFILE] Operating System cannot be retrieved : uname is null.')
        }

        if(uname.indexOf('arm64')){
            this.os = OperatingSystem.ANDROID;
        }else if(uname.startsWith('Linux')){
            this.os = OperatingSystem.LINUX;
        }else if(uname.startsWith('Darwin')){
            this.os = OperatingSystem.MACOS;
        }/*else{
            throw AbiException.UNDETECTABLE_OS(this.prop['uname']);
        }*/
        // return abi;

        return this.os;
    }



    /**
     * To get ABI
     * 
     * @method   
     */
    getABI():ABI {
        const abis = AbiManager.from(this.prop['ro.product.cpu.abi']);

        if(abis.length>0){
            return abis[0];
        }else{
            return null;
        }
    }

    /**
     * To check from props if the device is an emulator r
     */
    isEmulator():boolean {
        return this.prop['ro.build.product'].startsWith('emulat') || this.emulated;
    }


    /**
     * To get ABI
     *
     * @method
     */
    getABIlist(pAddrSize=-1):ABI[]{
        let list:string = null;
        if(pAddrSize===32){
            list = this.prop['ro.product.cpu.abi'];
        }else if(pAddrSize===64){
            list = this.prop['ro.product.cpu.abi'];
        }else {
            list = this.prop['ro.product.cpu.abi'];
        }

        if(list != null){
            return AbiManager.from(list.split(','));
        }else{
            return null;
        }
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
    getArchitecture(pUpdate=false):Architecture{

        if(this.arch != null && !pUpdate) return this.arch;

        const abi:string = this.prop['ro.product.cpu.abi'];
        if(abi == null){
            throw new Error('[DEVICE PROFILE] Architecture of targeted device cannot be retrieved through CPU ABI.')
        }

        if(abi.startsWith('arm64')){
            this.arch = Architecture.AARCH64;
        }else if(abi.startsWith('arm')){
            this.arch = Architecture.AARCH32;
        }else if(abi.startsWith('x86_64')){
            this.arch = Architecture.X86_64;
        }else{
            throw AbiException.UNDETECTABLE_ISA(this.prop['ro.product.cpu.abi']);
        }
        // return abi;

        return this.arch;
    }

    static fromJsonObject( pJson:any):SystemProfile{
        const o:SystemProfile = new SystemProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    toJsonObject():any{
        const o:any = {};
        for(const i in this){
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

    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):BuildProfile{
        const o:BuildProfile = new BuildProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    toJsonObject():any{
        const o:any = {};
        for(const i in this){
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
    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }

    /**
     * 
     * @param {*} pJson 
     * @static
     */
    static fromJsonObject( pJson):NetworkProfile{
        const o:NetworkProfile = new NetworkProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject():any{
        const o:any = {};
        for(const i in this){
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
export class PermissionProfile implements Profile
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
    setProperty( pName:string, pValue:any){
        this.prop[pName] = pValue;
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):NetworkProfile{
        const o:NetworkProfile = new NetworkProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject():any{
        const o:any = {};
        for(const i in this){
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
export class TrustProfile implements Profile
{
    prop:any;

    customACs:Certificate[] = [];
    systemACs:Certificate[] = [];

    constructor(){
        this.prop = {};
    }

    is(pData:any){
        const patterns = [
            new RegExp('^cacerts-'),
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
    setProperty( pName:string, pValue:any){
        switch(pName){
            case 'cacerts-added':
                this.customACs = pValue;
                break;
            case 'cacerts':
                this.systemACs = pValue;
                break;
            default:
                this.prop[pName] = pValue;
                break;
        }
    }

    /**
     * To get custom AC certificate from the device
     *
     * @return {Certificate[]}
     * @method
     * @since 1.1.0
     */
    getCustomACs():Certificate[] {
        return this.prop['cacerts-added'];
    }

    /**
     * To get custom AC certificate from the device
     *
     * @return {Certificate[]}
     * @method
     * @since 1.1.0
     */
    getSystemACs():Certificate[] {
        return []; //this.prop['cacerts-added'];
    }

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):TrustProfile{
        const o:TrustProfile = new TrustProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }

    /**
     * @method
     */
    toJsonObject():any{
        const o:any = {};
        for(const i in this){
            switch (i){
                case 'customACs':
                    o.customACs = [];
                    this.customACs.map( (vCert)=>{ o.customACs.push(vCert.toJsonObject()) });
                    break;
                case 'systemACs':
                    o.systemACs = [];
                    this.systemACs.map( (vCert)=>{ o.systemACs.push(vCert.toJsonObject()) });
                    break;
                default:
                    o[i] = this[i];
                    break;
            }
        }
        return o;
    }
}



/**
 *
 *
 * TODO: Refactor as AndroidDeviceProfile, add IDeviceProfile interface
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
            network: new NetworkProfile(),
            trust: new TrustProfile(),
            build: new BuildProfile()
        }

        for(const i in pOptions){
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
     * @method
     */
    isComputer():boolean{
        return this.type == TYPE.computer;
    }

    /**
     * @method
     */
    isAutomotive():boolean{
        return this.type == TYPE.automotive;
    }

    /**
     * @method
     */
    isIoT():boolean{
        return this.type == TYPE.iot;
    }

    /**
     * 
     * @param {*} pName 
     * @param {*} pValue 
     * @method
     */
    addProperty( pName:string, pValue:any, pAsSys=true):boolean{
        let profiled = false;

        if(pAsSys) this.sys_prop[pName] = pValue;

        for(const i in this.profiles){
            if(this.profiles[i].is(pName)){
                this.profiles[i].setProperty(pName, pValue);
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
    getTrustProfile():TrustProfile{
        return this.profiles.trust;
    }

    /**
     * @method
     */
    getBuildProfile():BuildProfile{
        return this.profiles.build;
    }

    /**
     * @method
     */
    getNetworkProfile():NetworkProfile{
        return this.profiles.network;
    }

    /**
     * 
     * @param {*} pJson 
     * @method
     * @static
     */
    static fromJsonObject( pJson):DeviceProfile{
        const o:DeviceProfile = new DeviceProfile();

        for(const i in pJson){
            if(i == "profiles"){
                o.profiles = {};
                for(const k in pJson[i]){
                    switch(k){
                        case 'system':
                            o.profiles.system = SystemProfile.fromJsonObject(pJson[i][k]);
                            break;
                        case 'network':
                            o.profiles.network = NetworkProfile.fromJsonObject(pJson[i][k]);
                            break;
                        case 'trust':
                            o.profiles.trust = TrustProfile.fromJsonObject(pJson[i][k]);
                            break;
                        case 'build':
                            o.profiles.build = BuildProfile.fromJsonObject(pJson[i][k]);
                            break;
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
        const o:any = {};

        for(const i in this){
            if(pExcludeList[i] === true) continue;
            
            if(i == "profiles"){
                o.profiles = {};
                for(const k in this.profiles){
                    o.profiles[k] = this.profiles[k].toJsonObject();
                }
            }else
                o[i] = this[i];
        }

        return o;
    }
}
