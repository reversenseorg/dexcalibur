import {MonitoredError} from "../MonitoredError";

export enum AndroidErrorCode {
    GENERIC=100,
    ACTIVITY=200,
    PROVIDER=300,
    SERVICE=400,
    RECEIVER=500
}

export class AndroidApplicationException extends MonitoredError {

    constructor( pMsg:string, pCode:number = null, pExtra:any = null) {
        super('ANDROID APP', pMsg, pCode, pExtra);
    }
}