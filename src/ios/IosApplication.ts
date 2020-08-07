import {Device} from "../Device";
import {ApplicationBinary} from "../Application";
import DexcaliburProject from "../DexcaliburProject";

export default class IosApplication extends ApplicationBinary
{
    constructor(pContext:DexcaliburProject) {
        super(pContext);
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