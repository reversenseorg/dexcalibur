import InputEvent from "./InputEvent.js";

export interface IPhysicalEventDecoder {
    decode(pRaw: string | Buffer): InputEvent;
}