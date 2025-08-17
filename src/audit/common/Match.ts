import {Metadata} from "./Metadata.js";

export interface MatchOccurence<T> {
    node: T; // (INodeRef|INode);
    meta?: Metadata[];
    ruleIdx:number
}