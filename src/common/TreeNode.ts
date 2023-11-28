export interface TreeNode<T> {

    _entries: T[];

    add(pNode:T):void;

    update(pOptions:any):void;

}