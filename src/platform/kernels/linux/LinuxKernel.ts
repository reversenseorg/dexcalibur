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

import {KernelInfo} from "../common/Kernel.js";
import {KernelInfoFactory} from "../common/KernelFactory.js";
import {OperatingSystem} from "@reversense/dxc-core-api";
import {Architecture} from "../../../Architecture.js";
import InputSubsystem from "../../InputSubsystem.js";
import {InputDeviceType} from "../common/InputDeviceType.js";
import InputEventType from "../../InputEventType.js";
import {
    LinuxAbsEventCodes,
    LinuxFfEventCodes,
    LinuxFfStatusEventCodes,
    LinuxInputEventCodes,
    LinuxKeyEventCodes,
    LinuxLedEventCodes,
    LinuxMscEventCodes,
    LinuxPwrEventCodes,
    LinuxRelEventCodes,
    LinuxRepEventCodes,
    LinuxSndEventCodes,
    LinuxSwEventCodes,
    LinuxSynEventCodes
} from "./LinuxInputEventCodes.js";
import {LinuxInputDeviceDecoder} from "./LinuxInputDeviceDecoder.js";


export const LinuxKernelInfo_aarch64_v4 = new KernelInfo({
    name: [
        OperatingSystem.LINUX,
        OperatingSystem.ANDROID,
        OperatingSystem.TIZEN,
        OperatingSystem.TOYBOX,
        OperatingSystem.FIRE_OS,
        OperatingSystem.WEB_OS,
    ],
    arch: Architecture.AARCH64,
    version: "4.14.175",
    inputSubsystem: new InputSubsystem({
        devices: {
            // event interface
            event: new InputDeviceType({
                name: "generic event interface",
                decoder: new LinuxInputDeviceDecoder(null),
                pathPattern: /^\/dev\/input\/event(?<num>\d+)$/,
                eventTypes: [
                    new InputEventType(
                        {key: "EV_SYN", value: 0x00,  codes: LinuxSynEventCodes,
                            description: "Serve as delineators between distinct events, which can be separated either temporally or " +
                                "spatially. An example of spatial separation can be observed in the multitouch protocol."}),
                    new InputEventType(
                        {key: "EV_KEY", value: 0x01,  codes: LinuxKeyEventCodes,
                            description: "Describe state changes of keyboards, buttons, or other key-like devices."}),
                    new InputEventType(
                        {key: "EV_REL", value: 0x02,  codes: LinuxRelEventCodes, description: "Describe movements on a relative axis."}),
                    new InputEventType(
                        {key: "EV_ABS", value: 0x03,  codes: LinuxAbsEventCodes, description: "Describe movements on a absolute axis."}),
                    new InputEventType(
                        {key: "EV_MSC", value: 0x04,  codes: LinuxMscEventCodes, description: "Miscellaneous input data that don't fit into other types."}),
                    new InputEventType(
                        {key: "EV_SW", value: 0x05,  codes: LinuxSwEventCodes, description: "Describe some Input Switch update."}),
                    new InputEventType(
                        {key: "EV_LED", value: 0x11,  codes: LinuxLedEventCodes, description: "Turn LEDs on devices on and off."}),
                    new InputEventType(
                        {key: "EV_SND", value: 0x12,  codes: LinuxSndEventCodes, description: "Output sound to devices."}),
                    new InputEventType(
                        {key: "EV_REP", value: 0x14,  codes: LinuxRepEventCodes, description: "Used for autorepeating devices."}),
                    new InputEventType(
                        {key: "EV_FF", value: 0x15,  codes: LinuxFfEventCodes, description: "Send force feedback commands to an input device."}),
                    new InputEventType(
                        {key: "EV_PWR", value: 0x16,  codes: LinuxPwrEventCodes, description: "A special type for power button and switch input."}),
                    new InputEventType(
                        {key: "EV_FF_STATUS", value: 0x17,  codes: LinuxFfStatusEventCodes, description: "Used to receive force feedback device status."})
                ]
            }),
            fingerprint: new InputDeviceType({
                name: "fingerprint event interface (custom)",
                decoder: new LinuxInputDeviceDecoder(null),
                pathPattern: /^\/dev\/input\/event(?<num>\d+)$/,
                eventTypes: [
                    new InputEventType({
                        key: "EV_FF",
                        value: 0x15,
                        codes: [
                            LinuxInputEventCodes.FF_PERIODIC,
                            LinuxInputEventCodes.FF_SINE,
                            LinuxInputEventCodes.FF_CUSTOM,
                            LinuxInputEventCodes.FF_GAIN,
                        ],
                        description: "Send force feedback commands to an input device."
                    })
                ]
            }),
            // https://www.cirrus.com/products/cs40l26-26b/
            hapticff: new InputDeviceType({
                name: "haptic feedback event interface (custom)",
                decoder: new LinuxInputDeviceDecoder(null),
                pathPattern: /^\/dev\/input\/event(?<num>\d+)$/,
                eventTypes: [
                    new InputEventType({
                        key: "EV_KEY",
                        value: 0x01,
                        codes: LinuxKeyEventCodes,
                        description: "Describe state changes of keyboards, buttons, or other key-like devices."
                    }),
                ]
            })
        }
    })
});
