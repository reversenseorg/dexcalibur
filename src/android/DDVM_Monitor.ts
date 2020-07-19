/**
 * Monitor gather CFG states explored or not.
 */
import {DDVM_State} from "./DDVM_State";


export default class DDVM_Monitor
{
    queuedStates:DDVM_State[] = null;
    exploredStates:DDVM_State[] = null;

    constructor(){
        this.queuedStates = [];
        this.exploredStates = [];
    }

    queueState( pState:DDVM_State):void{
        this.queuedStates.push(pState);
    }

    /**
     * To move state from queue to exploredState
     *
     */
    unqueueState():void{
        this.exploredStates.push( this.queuedStates.pop() );
    }
}