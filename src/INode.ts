import {NodeInternalType} from "./NodeInternalType";

export interface INode {
    __:NodeInternalType;
    getUID():string;
}

export interface INodeMap {
    [nodeUID:string] :INode
}