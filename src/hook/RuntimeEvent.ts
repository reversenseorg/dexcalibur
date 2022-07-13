import {INode} from "../INode";
import HookMessageV2 from "./HookMessageV2";
import HookMessage from "../HookMessage";
import {Tag} from "../tags/Tag";
import BusEvent from "../BusEvent";

export enum RuntimeEventType {
    HOOK= 'h',
    MEMORY='m',
    NETWORK='n',
    FILESYSTEM='f'
}


/**
 * This class represents any events happening at runtime of target applications and
 * captured by Dexcalibur
 *
 * Most specifialized message - such as hook messages - are lifted to RuntimeEvent
 *
 *
 * @class
 */
export class RuntimeEvent<P> extends BusEvent {

    type:RuntimeEventType = null;

    raw: P = null;

    node:INode[] = null;

    tag:Tag[] = [];

    constructor( pConfig:any) {
        super(pConfig);

        for(const i in this){
            this[i] = pConfig[i];
        }
    }

    getMessage():P {
        return this.raw;
    }


    isHookMessage(){
        return (this.type==RuntimeEventType.HOOK);
    }
}