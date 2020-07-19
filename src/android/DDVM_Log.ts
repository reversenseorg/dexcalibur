
/**
 * Class logging message from the VM.
 *
 * It handles internal VM logs and Android logs (thanks to android.Log hooks).
 *
 * @class
 * @classdesc Class logging message from the VM
 */
export default class DDVM_Log
{
    logs:string[] = null;

    constructor(){
        this.logs = [];
    }

    reset(){
        this.logs = [];
    }

    write( pMsg:string){
        this.logs.push(pMsg);
    }

    read():string[]{
        return this.logs;
    }
}
