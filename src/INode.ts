import {NodeInternalType} from "./NodeInternalType";
import {IPersistent} from "./persist/orm/IPersistent";

export interface INode extends IPersistent{
    __:NodeInternalType;
    getUID():string;
    tags:number[];
}

export class Node implements INode{
    __:NodeInternalType;
    uid:string;
    tags:number[];

    constructor(pConfig:any = null) {
        if(pConfig != null){
            for(const  i in pConfig) this[i]=pConfig[i];
        }
    }

    getUID():string {
        return this.uid;
    }
}

export interface INodeMap {
    [nodeUID:string] :INode
}