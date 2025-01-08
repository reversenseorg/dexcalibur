import {ABI, AbiManager, InstructionSet} from "../../binary/ABI.js";
import {AbiException} from "../../errors/AbiException.js";
import {OperatingSystem} from "../../platform/OperatingSystem.js";
import {Architecture} from "../../Architecture.js";
import {GenericSystemProfile} from "../../device/profile/GenericSystemProfile.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {DeviceProfilingOptions, IBridge} from "../../Bridge.js";
import * as Log from "../../Logger.js";
import {IProfile} from "../../device/profile/IProfile.js";
import {UnsafeValue} from "@dexcalibur/dexcalibur-orm";


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
            new RegExp('^ro\.boot\.'),
            new RegExp('^ro\.kernel\.'),
            new RegExp('^vendor\.dxc\.'),
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
            const os:string = pBridge.shellWithEHsync("uname -o").toString();
            if(os!=null){
                //if(ValidationRule)
                switch (os.substring(0,os.length-1).toLowerCase()){
                    case OperatingSystem.TOYBOX:
                        this.os = OperatingSystem.TOYBOX;
                        break;
                    case OperatingSystem.LINUX:
                        this.os = OperatingSystem.LINUX;
                        break;
                    case OperatingSystem.DARWIN:
                        this.os = OperatingSystem.DARWIN;
                        break;
                }
            }

            const arch:string = pBridge.shellWithEHsync("uname -m").toString();
            if(arch!=null){
                switch (arch.substring(0,arch.length-1).toLowerCase()){
                    case "arm64":
                    case "aarch64":
                        this.arch = Architecture.AARCH64;
                        break;
                }
            }


            const version:string = pBridge.shellWithEHsync("uname -r").toString();
            if(version!=null){
                // TODO : encapsulate such value into Incomingvalue
                let i:number;
                if((i = version.indexOf('-'))>-1){
                    this.version = version.substring(0,i);
                }else{
                    this.version = version;
                }
            }

            //pOptions.profile.addProperty('uname', pBridge.shellWithEHsync("uname").toString());

            pOptions.profile.addProperty('uname', {
                os: os,
                arch: arch,
                version:version,
                raw: pBridge.shellWithEHsync("uname").toString()
            });


            //const iomem:string = pBridge.privilegedShell("cat /proc/iomem").toString();

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
        /*if(this.os != null && !pUpdate) return this.os;


        const uname:any = this.prop['uname'];

        if(uname == null && this.os!=null){
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
     * To check from props if the device is an emulator
     *
     * @return {boolean} TRUE if emulated else FALSE
     */
    isEmulator():boolean {
        return
            (this.prop['ro.boot.serialno'].indexOf('EMULATOR')>-1) ||
            (this.prop['ro.bootimage.build.fingerprint'].indexOf('emulator')>-1) ||
            (this.prop['ro.build.product'].indexOf('emu')>-1) ||
            (this.prop['ro.product.vendor.device'].indexOf('emulator')>-1) ||
            (this.prop['vendor.dxc.type'].indexOf('vdev')>-1) ||
            (this.prop['ro.kernel.qemu']=='1') ||
            (Object.keys(this.prop).filter((x)=>(x.indexOf('ro.kernel.qemu.')==0))) ||
            this.emulated;
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
    static fromJsonObject( pJson:any):AndroidSystemProfile{
        const o:AndroidSystemProfile = new AndroidSystemProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}