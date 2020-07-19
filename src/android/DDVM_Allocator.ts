/**
 * Class performing allocation of component such as
 * byte array
 *
 * @class
 * @classdesc Class performing allocation of some components
 */
import DDVM_VirtualArray from "./DDVM_VirtualArray";

export default class DDVM_Allocator
{
    maxMemorySize:number = -1;
    top:number = 0;
    vm:any = null;
    heap:DDVM_VirtualArray[] = null;

    constructor( pVM:any, pMemorySize:number=-1){
        this.maxMemorySize = pMemorySize;
        this.heap = [];
        this.top = 0;
        this.vm = pVM;
    }

    newArray( pType:any, pSize:number=null):DDVM_VirtualArray{
        this.top = this.heap.length;
        this.heap.push( new DDVM_VirtualArray( pType.name, pSize));

        return this.heap[this.top];
    }
}
