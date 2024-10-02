// Source: https://lxr.linux.no/#linux+v3.9.5/include/uapi/linux/input.h#L49

export default class InputEventCodeProperties {
    desc?:any;
    min?: number; // Specifies minimum value for the axis.
    max?: number; // Specifies maximum value for the axis.
    fuzz?: number; // Specifies fuzz value that is used to filter noise from the event stream
    flat?: number; // Values that are within this value will be discarded by joydev interface and reported as 0 instead.
    resolution?: number; // Specifies resolution for the values reported for the axis.

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}