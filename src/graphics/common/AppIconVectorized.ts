import {AppIcon, AppIconFormat} from "../../AppIcon.js";

export interface VectorComponent {
    type:string;
    attr?:Record<string, any>;
    children?:VectorComponent[];
}

export class AppIconVectorized extends AppIcon {
    fmt = AppIconFormat.VECTOR;
    data:VectorComponent[] = [];

    constructor() {
        super();
    }

    setData(pData:any):void {
        this.data = pData;
    }

    /**
     *
     */
    toJsonObject(): any {
        const o = this.toJsonObject();
        o.fmt = this.fmt;
        if(this.data!=null){
            o.data = this.data;
        }
        return o;
    }
}