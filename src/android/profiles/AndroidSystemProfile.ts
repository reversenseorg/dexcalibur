
import {ABI, AbiManager, InstructionSet} from "../../binary/ABI.js";
import {AbiException} from "../../errors/AbiException.js";
import {OperatingSystem} from "../../OperatingSystem.js";
import {Architecture} from "../../Architecture.js";
import { GenericSystemProfile } from "../../device/profile/GenericSystemProfile.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";
import * as Log from "../../Logger.js";
import {IProfile} from "../../device/profile/IProfile.js";


const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export default class AndroidSystemProfile extends GenericSystemProfile implements NosyProfile{

    uid = "Android_System";

    requireRoot = false;

    nosy = true;

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
            //new RegExp('^ro\.product\.cpu\.abi.*'),
            new RegExp('^uname$'),
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }

    async performProfiling(pBridge: IBridge, pOptions?: DeviceProfilingOptions): Promise<IProfile> {

        let success:IProfile;
        try{
            const uname:string = pBridge.shellWithEHsync("uname -a").toString();
            pOptions.profile.addProperty('uname', uname);
            success = this;
        }catch(err){
            Logger.error(err.message);
            Logger.error(err.stack);
            success = null;
        }

        return success;
    }

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
            list = this.prop['ro.product.cpu.abilist']; // ro.product.cpu.abi
        }else if(pAddrSize===64){
            list = this.prop['ro.product.cpu.abilist'];
        }else {
            list = this.prop['ro.product.cpu.abilist'];
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

    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson):AndroidSystemProfile{
        const o:AndroidSystemProfile = new AndroidSystemProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}