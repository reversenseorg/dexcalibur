import {NodeInternalType} from "./NodeInternalType";

export interface INode {
    __:NodeInternalType;
    getUID():string;
}

export class Node implements INode{
    __:NodeInternalType;
    uid:string;

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