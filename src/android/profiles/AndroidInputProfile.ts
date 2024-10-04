
import * as Log from "../../Logger.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {IBridge} from "../../Bridge.js";
import {IProfile} from "../../device/profile/IProfile.js";
import GenericInputProfile from "../../device/profile/GenericInputProfile.js";
import {Nullable} from "../../core/IStringIndex.js";
import {Kernel} from "../../platform/kernels/common/Kernel.js";
import {InputDevice, InputDeviceId, InputDeviceOptions} from "../../platform/kernels/common/InputDevice.js";
import InputEventType from "../../platform/InputEventType.js";
import {LinuxBusType} from "../../platform/kernels/linux/LinuxInputEventCodes.js";
import {Readable} from "stream"

const Logger:Log.Logger = Log.newLogger() as Log.Logger;


/**
 * To detect input devices from kernel input subsystems
 *
 * @class
 * @since 1.1.0
 */
export default class AndroidInputProfile extends GenericInputProfile implements NosyProfile{

    requireRoot = true;

    nosy = true;

    private _kernel:Nullable<Kernel> = null;
    private _devices:InputDevice[] = [];

    is(pData:any){
        const patterns = [
        ];

        for(let i=0; i<patterns.length; i++){
            if(patterns[i].test(pData)){
                return true;
            }
        }

        return false;
    }


    /**
     * parse bus infos
     *
     * I: Bus=0006 Vendor=0000 Product=0000 Version=0000
     * N: Name="virtio_input_multi_touch_11"
     * P: Phys=virtio18/input0
     * S: Sysfs=/devices/platform/3f000000.pcie/pci0000:00/0000:00:0d.0/virtio18/input/input10
     * U: Uniq=
     * H: Handlers=event10
     * B: PROP=0
     * B: EV=2b
     * B: KEY=802 0 0 0 0 0
     * B: ABS=6f3800000000007
     * B: SW=1
     *
     *
     * https://github.com/torvalds/linux/blob/0c559323bbaabee7346c12e74b497e283aaafef5/drivers/input/input.c#L1157
     *
     * @param pBuffer
     */
    static parseBusInfo(pBuffer:Buffer):InputDevice[] {
        const RE_ID = new RegExp("(?<key>[A-Za-z]+)=(?<val>[0-9a-f]+)\s*","g");
        const dev:InputDevice[] = [];


        let cr = pBuffer.indexOf("\n\n"), line:Buffer, offset = 0, ro=0, eolo = 0, i:number=0, sub:Buffer, devOpts:InputDeviceOptions, id:any; //InputDeviceId;

        while(cr > -1){
            devOpts = { misc:{ }};
            sub = pBuffer.subarray(offset+(offset==0?0:1),cr);

            eolo = 0;
            ro = 0;
            while(ro<sub.length){

                eolo = sub.indexOf("\n",ro+1);  // EOL offset
                line = sub.subarray(ro, eolo==-1? sub.length : eolo);

                switch (line.readUint8(0)){
                    case 73 /* I */:
                        id = {};
                        // I: Bus=0006 Vendor=0000 Product=0000 Version=0000
                        [...line.subarray(2).toString().matchAll(RE_ID)].map(x => {
                            switch(x.groups.key.toLowerCase()){
                                case "bus": id.bustype = parseInt(x.groups.val, 16); break;
                                case "vendor": id.vendor = parseInt(x.groups.val, 16); break;
                                case "product": id.product = parseInt(x.groups.val, 16); break;
                                case "version": id.version = parseInt(x.groups.val, 16); break;
                            }
                        });

                        devOpts.id = id;
                        break
                    case 78 /* N */ :
                        // N: Name="virtio_input_multi_touch_11"
                        devOpts.name = line.subarray(line.indexOf('=')+2,line.length-1).toString();
                        break
                    case 80 /* P */ :
                        // catch only the first equal (after key name technically)
                        i = line.indexOf('=');
                        if(i>-1){
                            devOpts.phyPath = line.subarray(i+1,line.length).toString();
                        }
                        break
                    case 83 /* S */ :
                        // catch only the first equal (after key name technically)
                        i = line.indexOf('=');
                        if(i>-1){
                            devOpts.sysfsPath = line.subarray(i+1,line.length).toString();
                        }
                        break
                    case 85 /* U */ :// catch only the first equal (after key name technically)
                        i = line.indexOf('=');
                        if(i>-1){
                            devOpts.uid = line.subarray(i+1,line.length).toString();
                        }
                        break
                    case 72 /* H */ :// catch only the first equal (after key name technically)
                        i = line.indexOf('=');
                        if(i>-1){
                            devOpts.handles = line.subarray(i+1,line.length).toString().split(' ').filter(x => x.length>0) ;
                        }
                        break
                    case 66 /* B */ :
                        i = line.indexOf('=');
                        if(i==-1) break;
                        // empty bits are skipped
                        // https://github.com/torvalds/linux/blob/0c559323bbaabee7346c12e74b497e283aaafef5/drivers/input/input.c#L1131
                        switch(line.subarray(3,i).toString()){
                            case "PROP":
                                // B: PROP=0
                                break;
                            case "EV":
                                // B: EV=2b
                                devOpts._bitmap = parseInt(line.subarray(i+1).toString(),16);
                                break;
                            case "KEY":
                                // B: KEY=802 0 0 0 0 0
                                devOpts.misc.key = parseInt(line.subarray(i+1).toString(),16);
                                break;
                            case "ABS":
                                // B: ABS=6f3800000000007
                                devOpts.misc.abs = parseInt(line.subarray(i+1).toString(),16);
                                break;
                            case "SW":
                                // B: SW=1
                                devOpts.misc.switches = parseInt(line.subarray(i+1).toString(),16);
                                break;
                            case "LED":
                                // B: SW=1
                                devOpts.leds = parseInt(line.subarray(i+1).toString(),16);
                                break;
                            case "FF":
                                // B: SW=1
                                devOpts.misc.ff = parseInt(line.subarray(i+1).toString(),16);
                                break;
                        }
                        break
                }

                ro += line.length+1;
                if(ro>=sub.length) break;
            }

            dev.push(new InputDevice(devOpts));

            offset += sub.length;
            cr = pBuffer.indexOf("\n\n",offset+2);

            if(offset>=pBuffer.length){
                break;
            }


        }


        return dev;
    }



    static parseGeventOutput(pBuffer:Buffer):InputDevice[] {

        let stream = Readable.from(pBuffer);
        let devs:InputDevice[] = [];
        let dev:InputDeviceOptions = null;

        stream.on('line', (vLine:string)=>{
            if(vLine.startsWith("add device ")){
                if(dev!=null){
                    devs.push(new InputDevice(dev));
                    dev = { misc:{}};
                }
            }
        })

        return devs;
    }


    /**
     * Create a raw list of input devices from /proc/bus/input/devices file
     *
     * @param pBridge
     */
    async extractInputDeviceFromProcFs(pBridge:IBridge):Promise<InputDevice[]> {
        let ctn:boolean|string|Buffer = await pBridge.privilegedShell("cat /proc/bus/input/devices");

        console.log(ctn);

        if( !((ctn instanceof Buffer) || (typeof ctn == "string")) || ctn==null){
            throw Error("The file '/proc/bus/devices/input' cannot be read on the device");
        }

        if(typeof ctn == "string"){
            ctn = new Buffer(ctn);
        }

        return AndroidInputProfile.parseBusInfo(ctn);
    }

    /**
     * Create a raw list of input devices from /proc/bus/input/devices file
     *
     * @param pBridge
     */
    async extractInputDeviceFromGetevent(pBridge:IBridge):Promise<InputDevice[]> {
        let ctn:boolean|string|Buffer = await pBridge.shellAsync("getevent -lp");

        console.log(ctn);

        if( !((ctn instanceof Buffer) || (typeof ctn == "string")) || ctn==null){
            throw Error("The command 'getevent -lp' failed");
        }

        if(typeof ctn == "string"){
            ctn = new Buffer(ctn);
        }

        return AndroidInputProfile.parseBusInfo(ctn);
    }

    /**
     *
     * @param pDevice
     * @method
     * @async
     * @since 1.1.0
     */
    async performProfiling(pBridge:IBridge, pOptions = null):Promise<IProfile> {
        // cat /data/misc/adb/adb_keys
        const RE = /^(.+)\s([^@]+)@(.+)$/;
        let success:IProfile;

        this._devices = [];

        try{

            // if rooted
            // this._devices = await this.extractInputDeviceFromProcFs(pBridge);

            // if not rooted
            this._devices = await this.extractInputDeviceFromGetevent(pBridge);

            success = this;
        }catch(e){
            Logger.error("[DEVICE][PROFILING][INPUT] Input devices info cannot be dumped : "+e.message);
            success = null;
        }

        return success;
    }

    /**
     * To get every ADB public keys added by the customers
     *
     * @return {AdbKey[]} The list of configured ADB public keys
     * @method
     * @since 1.1.0
     */
    getInputDevices():InputDevice[] {
        return this._devices;
    }


    /**
     *
     * @param {*} pJson
     * @static
     */
    static fromJsonObject( pJson:any):AndroidInputProfile{
        const o:AndroidInputProfile = new AndroidInputProfile();
        for(const i in pJson)
            o[i] = pJson[i];
        return o;
    }
}