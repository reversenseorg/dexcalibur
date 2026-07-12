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

import {DeviceTemplate} from "../template/DeviceTemplate.js";
import {Device, EmuCommand} from "../../Device.js";
import {UserAccount} from "../../user/UserAccount.js";
import DeviceManager from "../../DeviceManager.js";
import AvdHelper from "./AvdHelper.js";
import AemuHelper from "./AemuHelper.js";
import {VirtualDeviceFactoryException} from "../error/VirtualDeviceFactoryException.js";
import {VdevEvent, VdevEventType} from "./VdevEvent.js";
import {Observable, Subject} from "rxjs";
import {DeviceInstance} from "./DeviceInstance.js";
import Util from "../../Utils.js";

export const ADB_CONSOLE_PORT_MIN = 5554;
export const ADB_CONSOLE_PORT_MAX = 5682 ;


export class AndroidVirtualDeviceFactory {

    private _dm:DeviceManager;

    constructor(pDevMgr:DeviceManager) {
        this._dm = pDevMgr;
    }


    /**
     * To allocate a new android device (virtual or physical) accordingly to the template
     * @param pTemplate
     */
    async allocateDevice( pUserAccount:UserAccount, pTemplate:DeviceTemplate):Promise<Observable<VdevEvent>> {

        const devUUID = this._dm.generateUID();

        // create virtual device
        const systemImageID = await AvdHelper.createDevice(
            pUserAccount.getUID(),
            devUUID,
            pTemplate
        );

        // allocate ports, and lock it in DM (risk of race condition)
        // port should be locked
        const devConsolePort = await this.findFreeAdbPort();

        // start device
        const instance:Subject<VdevEvent> = await AemuHelper.firstStart(
            pUserAccount.getUID(),
            devUUID,
            pTemplate,
            devConsolePort
        );

        instance.subscribe(async ( vEvent)=>{
            if(vEvent.type===VdevEventType.SPAWNED){
                await this._dm.scan();
                const dev = this._dm.getConnectedDeviceByExternalId(`emulator-${vEvent.data.port}`);

                dev.setUID(devUUID);
                dev.setEmulatorOpts(EmuCommand.START, vEvent.data.startCmd);
                dev.setTemplate(pTemplate);

                if(await this._dm.enroll(dev, {profiling:{}})){

                    const inst = await this._dm.createDeviceInstance(new DeviceInstance({
                        device: dev.getUID(),
                        started: Util.time(),
                        pid: vEvent.data.process.pid
                    }));

                    instance.next({
                        type: VdevEventType.READY,
                        data: {
                            device: dev,
                            process: vEvent.data.process,
                            inst: inst
                        }
                    })
                    return dev;
                }else{
                    throw VirtualDeviceFactoryException.CANNOT_ENROLL_VDEV(dev.getUID());
                }
            }
        })

        return instance;
    }

    /**
     *
     */
    async findFreeAdbPort():Promise<number> {
        //await this._dm.scan();
        const busyPorts:number[] = Object.values(this._dm.getAll()).map(d => {
            if(d.isConnected() && d.id.indexOf('emulator-')==0){
                return parseInt(d.id.slice(9));
            }
        });
        let freePort = ADB_CONSOLE_PORT_MIN;

        while(busyPorts.indexOf(freePort)>-1 && freePort<=ADB_CONSOLE_PORT_MAX){
            // port MUST be incremented by 2 because each device listen over 2 ports :
            // one for the console, one for ADB. The console port should be even, and adjacent adb port should be odd
            // example : 5554 (console) / 5555 (adb)
            freePort+=2;
        }

        if(freePort>ADB_CONSOLE_PORT_MAX){
            throw VirtualDeviceFactoryException.ANDROID_NO_FREE_PORT()
        }

        return freePort;
    }



    /**
     * To start a device
     *
     * @param {UserAccount} pUserAccount
     * @param {Device} pDevice
     * @returns
     */
    async startDevice(pUserAccount:UserAccount, pDevice:Device):Promise<Observable<VdevEvent>> {

        // allocate ports, and lock it in DM (risk of race condition)
        // port should be locked
        const devConsolePort = await this.findFreeAdbPort();

        // start device
        const instance:Subject<VdevEvent> = await AemuHelper.start(
            pUserAccount.getUID(),
            pDevice,
            devConsolePort
        );

        instance.subscribe(async ( vEvent)=>{
            if(vEvent.type===VdevEventType.SPAWNED){
                await this._dm.scan();
                let d = this._dm.getDevice(pDevice.getUID());
                //const dev = this._dm.getConnectedDeviceByExternalId(`emulator-${vEvent.data.port}`);
                d.setEmulatorOpts(EmuCommand.RUNNING_PID, vEvent.data.process.pid);
                console.log(d);
                await this._dm.save();

                const inst = await this._dm.createDeviceInstance(new DeviceInstance({
                    device: d.getUID(),
                    started: Util.time(),
                    pid: vEvent.data.process.pid
                }));

                instance.next({
                    type: VdevEventType.READY,
                    data: {
                        device: d,
                        process: vEvent.data.process,
                        inst: inst
                    }
                })
                return d;
            }
        })

        return instance;
    }


    /**
     * To start a device
     *
     * @param {UserAccount} pUserAccount
     * @param {Device} pDevice
     * @returns
     */
    async stopDevice(pUserAccount:UserAccount, pDevice:Device, pInstance:DeviceInstance):Promise<number> {

        // start device
        return await AemuHelper.stop(
            pUserAccount.getUID(),
            pDevice,
            pInstance
        );
    }
}