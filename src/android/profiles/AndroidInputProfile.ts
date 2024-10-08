import * as Log from "../../Logger.js";
import {NosyProfile} from "../../device/profile/NosyProfile.js";
import {IBridge} from "../../Bridge.js";
import {IProfile} from "../../device/profile/IProfile.js";
import GenericInputProfile from "../../device/profile/GenericInputProfile.js";
import {Nullable} from "../../core/IStringIndex.js";
import {KernelInfo} from "../../platform/kernels/common/Kernel.js";
import {InputDevice, InputDeviceOptions} from "../../platform/kernels/common/InputDevice.js";
import InputEventType from "../../platform/InputEventType.js";
import DeviceProfile from "../../device/DeviceProfile.js";
import {OperatingSystem} from "../../platform/OperatingSystem.js";
import {InputDeviceType} from "../../platform/kernels/common/InputDeviceType.js";
import InputEventCode from "../../platform/InputEventCode.js";
import InputEventCodeProperties from "../../platform/InputEventCodeProperties.js";
import {Endianness} from "../../core/Endianness.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface ParsedEventCode {
    code?:number,
    extra?: {
        value?:number,
        min?:number,
        max?:number,
        flat?:number,
        fuzz?:number,
        resolution?:number
    }
}
interface ParsedEventType {
    code?:number,
    name?:string,
    evcodes?: ParsedEventCode[]
}

/**
 * To detect input devices from kernel input subsystems
 *
 * @class
 * @since 1.1.0
 */
export default class AndroidInputProfile extends GenericInputProfile implements NosyProfile{

    requireRoot = true;

    nosy = true;

    terminated = false;

    private _devices:InputDevice[] = [];
    private _rawDev:InputDevice[] = [];

    onAfter = (vProf:DeviceProfile, vOptions:any):void =>{
        Logger.info("[DEVICE PROFILE][INPUT][os=android] onAfter trigged");
        // get kernel info
        let devKInfo:KernelInfo;
        try{
            devKInfo = vProf.getSystemProfile().getClosestKernelInfo();
        }catch(error){
            Logger.error(error.message);
            Logger.error(error.stack);
        }

        // retrieve event type/codes definition from KernelInfo (retrieved by system profile) for each
        // event type/code supported by each input device
        this._rawDev.map((vInput:InputDevice) => {

            const opts = vInput;

            let dev = new InputDevice({
                name: vInput.name
            });

            opts.supportedEvents = [];

            let devType:InputDeviceType, evtType:InputEventType, newEvtType:InputEventType,  evtTypeRaw:ParsedEventType;
            try{

                devType = devKInfo.inputSubsystem.getInputDeviceByBusType(OperatingSystem.ANDROID, vInput.id.bustype);

                vInput.type = devType;

                // import (merge) event type from InputDeviceType into InputDevice
                for(let name in vInput.misc.rawEventType.evtype){
                    evtTypeRaw = vInput.misc.rawEventType.evtype[name];
                    // evtTypeRaw.code is a string
                    evtType = devType.getEventTypeById(evtTypeRaw.code);

                    if(evtType==null){
                        newEvtType = new InputEventType({
                            key: name,
                            value: (typeof evtTypeRaw.code=="string"? parseInt(evtTypeRaw.code,16): evtTypeRaw.code)
                        });
                    }else{
                        // merge info from kernel knowledge DB with device info
                        // drop event codes from new evt type
                        newEvtType = evtType.newDerivation({
                            // token info
                            value: evtTypeRaw.code,
                            key: evtTypeRaw.name
                        });
                    }



                    // retrieve support event code from kernel info
                    evtTypeRaw.evcodes.map((vCode:ParsedEventCode) => {
                        const evCode = evtType.getEventCodeById(vCode.code);
                        if(evCode!=null){
                            newEvtType.codes.push(evCode.newDerivation({
                                value: vCode.code,
                                properties: new InputEventCodeProperties(vCode.extra)
                            }))
                        }else{
                            newEvtType.codes.push(new InputEventCode({
                                // encoded token
                                value: vCode.code,
                                key: vCode.code+"",
                                endianness: Endianness.LITTLE_ENDIAN,
                                byteSize: 2,
                                // ppt
                                properties: new InputEventCodeProperties(vCode.extra)
                            }));
                        }

                    })

                    vInput.supportedEvents.push(newEvtType);
                }

                delete vInput.misc.rawEventType;
                this._devices.push(vInput);
            }catch(err){
                console.log(err);
                Logger.error(err.message);
                Logger.error(err.stack);
            }
        });

        this._devices = this._rawDev;
        delete this._rawDev;
        console.log(this._devices);
        this._devices.map(x => {
            console.log(x.supportedEvents)
        });
    }

    is(pData:any){
        const patterns = [];

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



    /*
    add device 2: /dev/input/event9
      bus:      0006
      vendor    0000
      product   0000
      version   0000
      name:     "virtio_input_multi_touch_10"
      location: "virtio17/input0"
      id:       ""
      version:  1.0.1
      events:
        KEY (0001): 0141  014b
        ABS (0003): 0000  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                    0001  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                    0002  : value 0, min 0, max 1, fuzz 0, flat 0, resolution 0
                    002f  : value 0, min 0, max 10, fuzz 0, flat 0, resolution 0
                    0030  : value 0, min 0, max 2147483647, fuzz 0, flat 0, resolution 0
                    0031  : value 0, min 0, max 2147483647, fuzz 0, flat 0, resolution 0
                    0034  : value 0, min 0, max 90, fuzz 0, flat 0, resolution 0
                    0035  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                    0036  : value 0, min 0, max 32767, fuzz 0, flat 0, resolution 0
                    0037  : value 0, min 0, max 15, fuzz 0, flat 0, resolution 0
                    0039  : value 0, min 0, max 65535, fuzz 0, flat 0, resolution 0
                    003a  : value 0, min 0, max 1024, fuzz 0, flat 0, resolution 0
        SW  (0005): 0000
      input props:
     */

    static parseGeventOutput(pBuffer:Buffer):InputDevice[] {

        let devs:InputDevice[] = [];
        let dev:InputDeviceOptions = null;

        let end:number, start:number;
        start = end = 0;


        function parseLine(vLine:string){


            const addDevRE = /^add device (?<devnum>\d+): (?<sysfs>.+)$/;
            const inputInfoRE = /^\s+(?<key>[a-z]+):?[\s\t]+(?<devnum>[0-9a-f]{4})$/;
            const extraInfoRE = /^\s+(?<key>[a-z]+):?[\s\t]+"(?<val>[^"]*)"$/;
            const eventsDes = /^\s+events:$/;
            const eventsTypeNew = /^\s+(?<type>[A-Z_]+)\s+\((?<typecode>[0-9a-f]{4})\):\s/;
            const eventCode = /^(?<code>[0-9a-f]{4})\s*$/;
            const eventCodeRow = /^\s*(?<code>[0-9a-f]{4}\s\s*)+$/;
            const eventAbs= /^\s*(?<code>[0-9a-f]{4})\s\s:\svalue\s(?<value>[0-9]+),\smin\s(?<min>[0-9]+),\smax\s(?<max>[0-9]+),\sfuzz\s(?<fuzz>[0-9]+),\sflat\s(?<flat>[0-9]+),\sresolution\s(?<resolution>[0-9]+)$/;
            const versionRE = /^\s+version:?[\s\t]+(?<val>[0-9]+\.[0-9]+\.?[0-9]*)$/;

            let matches:any = null;

            matches = addDevRE.exec(vLine);
            if(matches != null){
                if(dev!=null){
                    devs.push(new InputDevice(dev));
                }

                dev = {
                    handles: [
                        matches.groups.sysfs.substring(matches.groups.sysfs.lastIndexOf('/'))
                    ],
                    sysfsPath:matches.groups.sysfs,
                    id: {
                        vendor: null,
                        bustype: null,
                        product: null,
                        version: null,
                    },
                    misc:{
                        rawEventType: {
                            evtype: {},
                            activeType: null
                        }
                    }
                };
                return;
            }

            matches = inputInfoRE.exec(vLine);
            if(matches != null){
                switch (matches.groups.key){
                    case "bus":
                        dev.id.bustype = parseInt(matches.groups.devnum, 16);
                        break;
                    case "product":
                        dev.id.product = parseInt(matches.groups.devnum, 16);
                        break;
                    case "vendor":
                        dev.id.vendor = parseInt(matches.groups.devnum, 16);
                        break;
                    case "version":
                        dev.id.version = parseInt(matches.groups.devnum, 16);
                        break;
                    default:
                        console.log("input ",matches.groups)
                        break;
                }
                return;
            }

            matches = extraInfoRE.exec(vLine);
            if(matches != null){
                switch (matches.groups.key){
                    case "name":
                        dev.name = matches.groups.val;
                        break;
                    case "id":
                        dev.uid = matches.groups.val;
                        break;
                    case "location":
                        dev.phyPath = matches.groups.val;
                        break;
                    default:
                        console.log("extra ",matches.groups)
                        break;
                }
                return;
            }

            matches = versionRE.exec(vLine);
            if(matches != null){
                dev.misc['getevent_version'] = matches.groups.val;
                return;
            }

            matches = eventsDes.exec(vLine);
            if(matches != null){
                return;
            }

            matches = eventsTypeNew.exec(vLine);
            if(matches != null){
                // begin of line
                dev.misc.rawEventType.activeType = matches.groups.type;
                dev.misc.rawEventType.evtype[matches.groups.type] = {
                    name: matches.groups.type,
                    code: matches.groups.typecode,
                    evcodes: []
                };

                // next part is a list of event code supported or the first event code (ABS) + info
                switch (matches.groups.type){
                    case "ABS":
                        let abs = eventAbs.exec(vLine.substring(matches[0].length));
                        if(abs != null){
                            dev.misc.rawEventType.evtype[matches.groups.type].evcodes.push({
                                code: parseInt(abs.groups.code,16),
                                extra: {
                                    value: parseInt(abs.groups.value,10),
                                    min: parseInt(abs.groups.min,10),
                                    max: parseInt(abs.groups.max,10),
                                    fuzz: parseInt(abs.groups.fuzz,10),
                                    flat: parseInt(abs.groups.flat,10),
                                    resolution: parseInt(abs.groups.resolution,10),
                                }
                            })
                        }else{
                            Logger.error("Cannot parse event code related to ABS changes > ",vLine);
                        }
                        break;
                    default:
                        vLine.substring(matches[0].length).split('  ').map(x => {
                            const m = eventCode.exec(x);
                            if(m != null){
                                dev.misc.rawEventType.evtype[dev.misc.rawEventType.activeType]
                                    .evcodes
                                    .push({
                                        code: parseInt(m.groups.code,16)
                                    });
                            }
                        });
                        break;
                }

                return;
            }

            matches = eventAbs.exec(vLine);
            if(matches != null){
                dev.misc.rawEventType.evtype[dev.misc.rawEventType.activeType].evcodes.push({
                    code: parseInt(matches.groups.code,16),
                    extra: {
                        value: parseInt(matches.groups.value,10),
                        min: parseInt(matches.groups.min,10),
                        max: parseInt(matches.groups.max,10),
                        fuzz: parseInt(matches.groups.fuzz,10),
                        flat: parseInt(matches.groups.flat,10),
                        resolution: parseInt(matches.groups.resolution,10),
                    }
                })
                return;
            }

            matches = eventCodeRow.exec(vLine);
            if(matches != null){
                vLine.split('  ').map(x => {
                    const m = eventCode.exec(x);
                    if(m != null){
                        dev.misc.rawEventType.evtype[dev.misc.rawEventType.activeType]
                            .evcodes
                            .push({
                                code: parseInt(m.groups.code,16)
                            });
                    }
                });
                return;
            }
            //console.log('Line not caught : "'+vLine+'"');
        }

        // Android EOL is always CR
        while((end = pBuffer.indexOf("\n",start))>-1){
            if(end == start+1){
                // skip CR
                start = end+1;
                continue;
            }
            parseLine(pBuffer.subarray(start, end).toString());
            start = end+1;
        }

        //console.log("LAST LINE > ");
        parseLine(pBuffer.subarray(start, pBuffer.length).toString());

        devs.push(new InputDevice(dev));

        return devs;
    }


    /**
     * Create a raw list of input devices from /proc/bus/input/devices file
     *
     * @param pBridge
     */
    async extractInputDeviceFromProcFs(pBridge:IBridge):Promise<InputDevice[]> {
        let ctn:boolean|string|Buffer = await pBridge.privilegedShell("cat /proc/bus/input/devices");

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
        let ctn:any = await pBridge.shellAsync("getevent -ip");

        if(typeof ctn == "string"){
            ctn = new Buffer(ctn);
        }else{
            ctn = new Buffer(ctn.stdout);
        }

        return AndroidInputProfile.parseGeventOutput(ctn);
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

        this._rawDev = [];

        try{

            // if rooted
            // this._devices = await this.extractInputDeviceFromProcFs(pBridge);

            // if not rooted
            this._rawDev = await this.extractInputDeviceFromGetevent(pBridge);

            success = this;
            this.terminated = true;
        }catch(e){
            Logger.error("[DEVICE][PROFILING][INPUT] Input devices info cannot be dumped : "+e.message);
            Logger.error(e.stack);
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

    /**
     *
     * @param {*} pJson
     * @static
     */
    toJsonObject():any{
        const o:any = {};

        for(const i in this){
            switch (i){
                case "_devices":
                    o._devices = [];
                    if(this._devices!=null){
                        this._devices.map((x:InputDevice) => {
                            o._devices.push(x.toJsonObject());
                        })
                    }
                    break;
                case "_rawDev":
                    break;
            }
        }
        return o;
    }
}