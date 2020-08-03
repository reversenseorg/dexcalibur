import AndroidApplication from "./android/AndroidApplication";
import {Device} from "./Device";
import DexcaliburProject from "./DexcaliburProject";

export class ApplicationBinary
{
    ctx:DexcaliburProject;

    constructor(pContext:DexcaliburProject) {
        this.ctx = pContext;
    }


    start(pDevice:Device):number{
        throw new Error('[IOS APPLICATION] "start" operation is not implemented.');
        return -1;
    }

    kill(pDevice:Device, pPID:number=-1):boolean{
        throw new Error('[IOS APPLICATION] "kill" operation is not implemented.');
        return false;
    }

    isRunning(pDevice:Device):boolean{
        throw new Error('[IOS APPLICATION] "isRunning" operation is not implemented.');
        return false;
    }

    getPID(pDevice:Device):number{
        throw new Error('[IOS APPLICATION] "getPID" operation is not implemented.');

        return -1;
    }
}

export default class Application
{
    app:ApplicationBinary;

    constructor(pApp:any=null) {
        this.app = null;
    }

    start(pDevice:Device){
        return this.app.start(pDevice);
    }

    kill(pDevice:Device){
        return this.app.kill(pDevice);
    }

    isRunning(pDevice:Device){
        return this.app.isRunning(pDevice);
    }

    getPID(pDevice:Device){
        return this.app.getPID(pDevice);
    }
}