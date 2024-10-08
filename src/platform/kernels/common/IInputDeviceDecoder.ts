import InputEvent from "../../InputEvent.js";
import InputEventType from "../../InputEventType.js";
import InputEventCode from "../../InputEventCode.js";
import InputSubsystem from "../../InputSubsystem.js";
import {InputDeviceType} from "./InputDeviceType.js";


export interface IInputDeviceDecoder {
    deviceType:InputDeviceType;
    decode(pRaw: Buffer): InputEvent ;
    decodeBufferChunk(pRawChunk: Buffer): InputEvent[];
}