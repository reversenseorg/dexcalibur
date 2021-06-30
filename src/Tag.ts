

export interface TagMap {
    [hashCode:number] :Tag
}

export class Tag {
    _:number;

    label:string;
    child:Tag[];

    constructor( pUID:number, pLabel:string  ) {
        this.label = pLabel;
        this._ = pUID;
    }

    appendTag( pTag:Tag):void {
        this.child[pTag.hashCode] = pTag;
    }

    getChildren():TagMap {
        return this.child;
    }

    get hashCode():number {
        return this._;
    }
}