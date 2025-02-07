import * as _path_ from 'path';
import * as _fs_ from 'fs';
import * as _util_ from "util";
import * as _ps_ from "child_process";

import {DeviceTemplate} from "../template/DeviceTemplate.js";
import Util from "../../Utils.js";
import {Device, DeviceUUID} from "../../Device.js";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";
import {UserAccountUUID} from "../../user/UserAccount.js";
import {ValidationRule} from "../../Validator.js";
import {External} from "../../external/External.js";
import * as Log from "../../Logger.js";
import {EmulatorOption, EmulatorOptionID, OptsPurpose} from "./EmulatorOption.js";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Observable, Subject} from "rxjs";
import {VdevEvent, VdevEventType} from "./VdevEvent.js";
import {DeviceInstance} from "./DeviceInstance.js";


const _exec_ = _util_.promisify(_ps_.exec);
let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export interface AemuInstance {
    process: any,
    startCmd: string[]
}
/*

gsm - GSM/CSD (min 150, max 550).
hscsd - HSCSD (min 80, max 400).
gprs - GPRS (min 35, max 200).
edge - EDGE/EGPRS (min 80, max 400).
umts - UMTS/3G (min 35, max 200).
hsdpa - HSDPA (min 0, max 0).
lte - LTE (min 0, max 0).
evdo - EVDO (min 0, max 0).
none - No latency, the default (min 0, max 0).
num - Specifies exact latency.
min:max -
 */

/**
 * Android Virtual Device (AVD) Helper
 *
 * @class
 */
export default class AemuHelper extends External.ExternalHelper {

    static OS = OperatingSystem.ANDROID;

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        apiVersion: ValidationRule.uintString(),
        memory: ValidationRule.uintString(),
        // valid port range 5554 to 5682
        port: ValidationRule.uintString(),
        portList: ValidationRule.uintStringComposite(","),
        networkType: ValidationRule.newPinklistAssert([
            "gsm","hscsd","gprs","edge","umts","hsdpa","lte","evdo","none"
        ]),
        engine: ValidationRule.newPinklistAssert([
            "auto","classic","qemu2"
        ]),
        selinux: ValidationRule.newPinklistAssert([
            "disabled","permissive"
        ]),
        screenMode: ValidationRule.newPinklistAssert([
            "touch","multi-touch","no-touch"
        ])
    }

    /*
     * https://developer.android.com/studio/run/emulator-commandline#common
     */
    static options:EmulatorOption[] = [
        new EmulatorOption({
            name:"-memory", value:"2048", required:true, rule:AemuHelper.VALIDATE.memory, descr:"Specifies the physical RAM size, from 1536 to 8192 MBs." }),
        new EmulatorOption({
            name:"-sdcard", required:true, descr:"Specifies the filename and path to an SD card partition image file" }),
        new EmulatorOption({
            name:"-wipe-data", required:false, descr:"Deletes user data and copies data from the initial data file" }),

        // network
        new EmulatorOption({
            name:"-dns-server", purpose:OptsPurpose.NETWORK, required:true, descr:"List of used DNS servers" }),
        new EmulatorOption({
            name:"-http-proxy", purpose:OptsPurpose.NETWORK, required:true, descr:"Makes all TCP connections through a specified HTTP/HTTPS proxy" }),
        new EmulatorOption({
            name:"-netdelay", purpose:OptsPurpose.NETWORK, rule:AemuHelper.VALIDATE.networkType,  required:true, descr:"Sets network latency emulation" }),
        new EmulatorOption({
            name:"-netspeed", purpose:OptsPurpose.NETWORK, rule:AemuHelper.VALIDATE.networkType, required:true, descr:"Sets the network speed emulation" }),
        new EmulatorOption({
            name:"-port", purpose:OptsPurpose.NETWORK, rule:AemuHelper.VALIDATE.port, required:true, descr:"Sets the TCP port number that's used for the console and adb" }),
        new EmulatorOption({
            name:"-ports", purpose:OptsPurpose.NETWORK, rule:AemuHelper.VALIDATE.portList, required:true, descr:"Sets the TCP ports numbers that's used for the console and adb" }),
        new EmulatorOption({
            name:"-tcpdump", purpose:OptsPurpose.NETWORK, rule:AemuHelper.VALIDATE.port, required:true, descr:"Captures network packets and stores them in a file" }),

        // system
        new EmulatorOption({
            name:"-engine", purpose:OptsPurpose.SYSTEM, rule:AemuHelper.VALIDATE.engine, required:true, descr:"Emulator engine" }),
        new EmulatorOption({
            name:"-selinux", purpose:OptsPurpose.SYSTEM, rule:AemuHelper.VALIDATE.selinux, required:true, descr:"Set SELinux mode" }),

        // ui
        new EmulatorOption({
            name:"-no-boot-anim", purpose:OptsPurpose.UI, descr:"Disable boot animation to faster boot" }),
        new EmulatorOption({
            name:"-screen", purpose:OptsPurpose.UI, rule:AemuHelper.VALIDATE.screenMode, required:true, descr:"Set SELinux mode" }),

        // ui
        new EmulatorOption({
            name:"-no-audio", purpose:OptsPurpose.DEFAULT, descr:"Disable audio emulation" }),
        new EmulatorOption({
            name:"-no-window", purpose:OptsPurpose.DEFAULT, descr:"Disable graphical window display" }),


        new EmulatorOption({
            name:"-prop", purpose:OptsPurpose.DEFAULT, required:true, descr:"Set Android property at boot <key>=<value>" }),
        new EmulatorOption({
            name:"-report-console", purpose:OptsPurpose.NETWORK, required:true, descr:"Reports the console port to a remote third party before starting emulation" }),
        new EmulatorOption({
            name:"-shell", purpose:OptsPurpose.NETWORK, required:true, descr:"Reports the console port to a remote third party before starting emulation" }),

    ]
    /**
     * To get the path of AVD manager runtime
     *
     * @returns {string} Path of AVD runtime
     * @method
     */
    static getRuntime():string {

        let rt:string;
        if(process.env.ANDROID_HOME != null){
            let base = process.env.ANDROID_HOME;
            if(_path_.basename(process.env.ANDROID_HOME)!=='sdk'){
                base = _path_.join(base,'sdk')
            }
            rt = _path_.join(base,'emulator','emulator');
        }else{
            rt = AemuHelper.getExtPath();
        }

        if(!_fs_.existsSync(rt)){
            throw VirtualDeviceFactoryException.AEMU_RUNTIME_NOT_FOUND(rt);
        }

        return rt;
    }


    /**
     * To build the absolute path to the directory containing android images
     * for the corresponding `androidSysImgId`
     *
     * This method checks if the directory exists and if the `androidSysImgId` is
     * populated
     *
     * @param {DeviceTemplate} pTemplate The customized template of the device
     * @returns {string} Absolute path to the directory containing Android images
     * @method
     * @static
     */
    static buildSysImgDir(pTemplate:DeviceTemplate):string {

        const imageId = pTemplate.getExtraOption('androidSysImgId');

        if(imageId==null){
            throw VirtualDeviceFactoryException.MISSING_ANDROID_IMAGE(pTemplate.getUID())
        }

        const imgParts = imageId.split(";")

        let base = process.env.ANDROID_HOME;
        if(_path_.basename(base)!='sdk'){
            base = _path_.join(base,'sdk');
        }

        const sysDir = _path_.join(
            base,
            'system-images',
            imgParts[1] /* android-{VERSION} */,
            imgParts[2] /* VARIANT : default , aosp, google_apis, ... */,
            imgParts[3] /* ARCH : arm64-v8a, ...  */,
        );

        if(!_fs_.existsSync(sysDir)){
            throw VirtualDeviceFactoryException.MISSING_ANDROID_SYSDIR(pTemplate.getUID(),sysDir);
        }

        return sysDir;
    }

    /**
     * to build arg strings
     *
     * @param pTemplate
     */
    static buildOptionsChain(pTemplate:DeviceTemplate, pAsArray = false):string|string[] {
        let opts: Record<EmulatorOptionID, EmulatorOption> = {};
        AemuHelper.options.map(o => {
            opts[o.getName()] = o;
        });


        let args = (pAsArray? [] : "");
        let base = "";



        if(pTemplate.extra.avdOpts==null || (typeof pTemplate.extra.avdOpts!='object')){
            return "";
        }

        for(let optID in pTemplate.extra.avdOpts){
            if(opts[optID] != null){
                // isValid() throws an exception if the value doesnt match the format
                if(opts[optID].required && opts[optID].isValid(pTemplate.extra.avdOpts[optID])){
                    if(pAsArray){
                        (args as string[]).push(opts[optID].getName());
                        (args as string[]).push(pTemplate.extra.avdOpts[optID]);
                    }else{
                        args += " "+opts[optID].getName()+" "+pTemplate.extra.avdOpts[optID];
                    }
                }else if(!opts[optID].required){
                    if(pAsArray){
                        (args as string[]).push(opts[optID].getName());
                    }else{
                        args += " "+opts[optID].getName();
                    }
                }
            }else{
                throw VirtualDeviceFactoryException.OPTION_NOT_SUPPORTED(AemuHelper.OS,optID);
            }
        }

        return args;
    }

    /**
     * To create a virtual device in AVD from a device template
     *
     * @return {Promise<string>}  arguments chain
     * @async
     * @static
     */
    static firstStart(pUserAccount:UserAccountUUID, pDUID:DeviceUUID, pTemplate:DeviceTemplate, pConsolePort:number):Subject<VdevEvent> {

        const vdevEvents:Subject<VdevEvent> = new Subject<VdevEvent>();

        const args:string[] = AemuHelper.buildOptionsChain(pTemplate,true) as string[];
        const systemImg = AemuHelper.buildSysImgDir(pTemplate);

        const child = _ps_.spawn(
            AemuHelper.getRuntime(),
            [
                '-avd',pDUID,
                '-sysdir',systemImg,
                '-prop',`dxc.uuid=${pDUID}`,
                '-prop',`dxc.type=vdev`,
                '-port', pConsolePort+""
            ].concat(args),
            {
                detached: true
            }
        );


        child.stdout.on('data', (data) => {
            Logger.success(`[AEMU][${pDUID}][firstStart] stdout : ${data}`);
            if(data.indexOf('INFO    | Boot completed in')>-1){
                vdevEvents.next({
                    type: VdevEventType.SPAWNED,
                    data: {
                        process: child,
                        startCmd: args,
                        port: pConsolePort
                    }
                })
            }
        });

        child.stderr.on('data', (data) => {
            Logger.error(`[AEMU][${pDUID}][firstStart] stderr : ${data}`);
        });

        child.on('close', (code) => {
            Logger.info(`[AEMU][${pDUID}][firstStart] close : Process terminated (code=${code})`);

            vdevEvents.next({
                type: VdevEventType.ABORTED,
                data: {
                    process: child,
                    port: pConsolePort,
                    code: code
                }
            })
        });

        return vdevEvents;
    }

    /**
     * To start a virtual device in AVD from a device template
     *
     * @return {Promise<string>}  arguments chain
     * @async
     * @static
     */
    static async start(pUserAccount:UserAccountUUID, pDevice:Device, pDevConsolePort:number):Promise<Subject<VdevEvent>> {

        const vdevEvents:Subject<VdevEvent> = new Subject<VdevEvent>();
        const systemImg = AemuHelper.buildSysImgDir(pDevice.getTemplate());

        const child = _ps_.spawn(
            AemuHelper.getRuntime(),
            [
                '-avd',pDevice.getUID(),
                '-sysdir',systemImg,
                '-prop',`dxc.uuid=${pDevice.getUID()}`,
                '-prop',`dxc.type=vdev`,
                '-port', pDevConsolePort+"",
                "-shell"
            ].concat(pDevice.getEmuStartOpts()),
            {
                detached: true
            }
        );


        Logger.info(`[AEMU][${pDevice.getUID()}][start] Command : ${AemuHelper.getRuntime()} ${[
            '-avd',pDevice.getUID(),
            '-sysdir',systemImg,
            '-prop',`dxc.uuid=${pDevice.getUID()}`,
            '-prop',`dxc.type=vdev`,
            '-port', pDevConsolePort+"",
            '-shell'
        ].concat(pDevice.getEmuStartOpts()).join(' ')}`);

        child.stdout.on('data', (data) => {

            Logger.success(`[AEMU][${pDevice.getUID()}][start] ${data}`);

            if(data.indexOf('INFO    | Boot completed in')>-1){ // || data.indexOf('| Setting display')>-1){
                vdevEvents.next({
                    type: VdevEventType.SPAWNED,
                    data: {
                        process: child,
                        startCmd: pDevice.getEmuStartOpts(),
                        port: pDevConsolePort
                    }
                })
            }


            if(data.indexOf('| Setting display')>-1){

                child.stdin.write('getprop',(err)=>{
                    console.log("stdin write error: ",err);
                })

                vdevEvents.next({
                    type: VdevEventType.SPAWNED,
                    data: {
                        process: child,
                        startCmd: pDevice.getEmuStartOpts(),
                        port: pDevConsolePort
                    }
                })
            }
        });

        child.stderr.on('data', (data) => {
            Logger.error(`[AEMU][${pDevice.getUID()}][start] ${data}`);
        });

        child.on('close', (code) => {
            Logger.info(`[AEMU][${pDevice.getUID()}][start] Process terminated (code=${code})`);

            vdevEvents.next({
                type: VdevEventType.ABORTED,
                data: {
                    process: child,
                    port: pDevConsolePort,
                    code: code
                }
            })
        });

        return vdevEvents;
    }


    /**
     * To create a virtual device in AVD from a device template
     *
     * @return {Promise<string>}  arguments chain
     * @async
     * @static
     */
    static async stop(pUserAccount:UserAccountUUID, pDevice:Device, pInstance:DeviceInstance):Promise<number> {

        const buff = _ps_.execSync(`kill ${pInstance.getPID()}`);
        console.log(`kill ${pInstance.getPID()}`);
        console.log(buff.toString());

        return pInstance.getPID();
    }

    /**
     * To create a virtual device in AVD from a device template
     *
     * @return {Promise<boolean>}  TRUE if ready, else FALSE
     * @async
     * @static
     * @method
     */
    static async openShell(pUserAccount:UserAccountUUID, pDUID:DeviceUUID, pShell:string):Promise<boolean> {

        const out = await Util.execAsync(
            `${AemuHelper.getRuntime()} ${pDUID} -shell`
        );

        if(out.stderr != null && out.stderr.length > 0){
            Logger.error(out.stderr);
        }

        Logger.success(out.stdout);

        return true;
    }
}
