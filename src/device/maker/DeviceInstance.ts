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

import {DeviceUUID} from "../../Device.js";
import {VdevEvent} from "./VdevEvent.js";
import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty,
    NodePropertyState,
    NodeType, SerializeOptions,
    TagUUID
} from "@reversense/dexcalibur-orm";
import {NodeInternalType} from "@reversense/dxc-core-api";
import {OperatingSystem} from "@reversense/dxc-core-api";
import Platform from "../../platform/Platform.js";
import DeviceProfile from "../DeviceProfile.js";
import DeviceProfileFactory from "../DeviceProfileFactory.js";
import {DeviceTemplate} from "../template/DeviceTemplate.js";
import ModelSyscall from "../../ModelSyscall.js";
import AppPackage from "../../AppPackage.js";
import {Architecture} from "../../Architecture.js";
import {IBridge, IBridgeFactory} from "../../Bridge.js";
import DeviceManager from "../../DeviceManager.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {CryptoUtils} from "../../CryptoUtils.js";



export interface DeviceInstanceOpts {
    pid:number;
    device:DeviceUUID;
    started:number;
    stopped?:number;
    logs?:any[];
}

/**
 * To store details about a running instance of a device
 *
 * @class
 */
export class DeviceInstance implements INode {

    static TYPE:NodeType = new NodeType(
        'device_instance',
        NodeInternalType.DEVICE_INST,
        [
            (new NodeProperty("uid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
            (new NodeProperty("pid")).type(DbDataType.STRING),
            (new NodeProperty("device")).type(DbDataType.STRING).def(OperatingSystem.NONE),
            (new NodeProperty("started")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("stopped")).type(DbDataType.INTEGER).def(-1),
            (new NodeProperty("logs")).type(DbDataType.BLOB).def([]),
            (new NodeProperty("tags")).type(DbDataType.BLOB).def([])
        ]
    ).dataSource("ENGINE_DB");
    __:NodeInternalType = NodeInternalType.DEVICE_INST;

    uid:string;
    pid:number = -1;
    device: DeviceUUID;
    started:number = -1;
    stopped:number = -1;
    tags:TagUUID[] = []

    events:VdevEvent[] = [];

    logs:any[] = [];

    constructor(pOpts:DeviceInstanceOpts) {
        this.pid = pOpts.pid;
        this.device = pOpts.device;
        this.started = pOpts.started;
        this.uid = CryptoUtils.sha256(`${this.device}:${this.pid}:${this.started}`,'hex',true);

        if(pOpts.stopped!=null) this.stopped = pOpts.stopped;
        if(pOpts.logs!=null) this.logs = pOpts.logs;
    }

    getUID(): string  {
        return this.uid;
    }

    isStopped():boolean {
        return (this.stopped>-1);
    }

    getPID():number {
        return this.pid;
    }

    pushEvents(pEvent:VdevEvent):void {
        this.events.push(pEvent);
    }

    appendLog(pLog:any):void {
        this.logs.push(pLog);
    }

    getLogs():any[] {
        return this.logs;
    }

    toJsonObject(pOption?: SerializeOptions, pZone:SecurityZone = SecurityZone.PUBLIC): any {
        return {
            uid: this.uid,
            pid: (pZone==SecurityZone.PUBLIC? 'REDACTED' : this.pid),
            device: this.device,
            started: this.started,
            stopped: this.stopped,
            logs: this.logs
            //events: this.events,
        }
    }
}
DeviceInstance.TYPE.builder(DeviceInstance);