import {AppIcon, AppIconFormat} from "../../AppIcon.js";


export class AppIconData extends AppIcon {
    fmt = AppIconFormat.PNG;
    data:Buffer;

    constructor(pFormat:AppIconFormat) {
        super();
    }

    setData(pData:Buffer):void {
        this.data = pData;
    }

    /**
     *
     */
    toJsonObject(): any {
        const o = this.toJsonObject();
        o.fmt = this.fmt;
        if(this.data!=null){
            o.data = this.data.toString('base64');
        }
        return o;
    }
}