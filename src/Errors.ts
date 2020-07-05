export class AdbWrapperError extends Error
{
    static DEVICE_NOT_FOUND:number = 1;

    name:string;
    code:number|string;

    constructor(pCode:number|string, pMessage:string) {
        super(pMessage);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.code = pCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static newDeviceNotFound( pMessage:string = ""){
        return new AdbWrapperError( AdbWrapperError.DEVICE_NOT_FOUND, pMessage);
    }
}

export class DeviceBridgeError extends Error
{
    name:string;

    constructor(message:string) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}
