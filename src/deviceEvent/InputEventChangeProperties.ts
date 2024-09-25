export default class InputEventChangeProperties  {
    desc?:any;
    min?: number;
    max?: number;
    fuzz?: number;
    flat?: number;
    resolution?: number;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }
}