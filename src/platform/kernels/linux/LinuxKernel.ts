import {Kernel} from "../common/Kernel.js";
import {KernelFactory} from "../common/KernelFactory.js";
import {OperatingSystem} from "../../OperatingSystem.js";
import {Architecture} from "../../../Architecture.js";
import InputSubsystem from "../../InputSubsystem.js";
import {InputDeviceType} from "../common/InputDeviceType.js";
import InputEventType from "../../InputEventType.js";
import {
    LinuxAbsEventCodes, LinuxFfEventCodes, LinuxFfStatusEventCodes, LinuxLedEventCodes,
    LinuxMscEventCodes, LinuxPwrEventCodes,
    LinuxRelEventCodes, LinuxRepEventCodes, LinuxSndEventCodes, LinuxSwEventCodes,
    LinuxSynEventCodes
} from "./LinuxInputEventCodes.js";





KernelFactory.KERNELS.push(new Kernel({
    name: OperatingSystem.LINUX,
    arch: Architecture.AARCH64,
    version: "4.14.175",
    inputSubsystem: new InputSubsystem({
        devices: {
            // event interface
            event: new InputDeviceType({
                name: "generic event interface",
                pathPattern: /^\/dev\/input\/event(?<num>\d+)$/,
                eventTypes: [
                    new InputEventType(
                        {key: "EV_SYN", value: 0x00,  codes: LinuxSynEventCodes,
                            description: "Serve as delineators between distinct events, which can be separated either temporally or " +
                                "spatially. An example of spatial separation can be observed in the multitouch protocol."}),
                    new InputEventType(
                        {key: "EV_KEY", value: 0x01,  codes: LinuxSynEventCodes,
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
            })
        }
    })
}));