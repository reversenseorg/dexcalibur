class AdbWrapperError extends Error
{
    static DEVICE_NOT_FOUND = 1;

    constructor(pCode, pMessage) {
        super(pMessage);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.code = pCode;
        Error.captureStackTrace(this, this.constructor);
    }

    static newDeviceNotFound( pMessage = ""){
        return new AdbWrapperError( AdbWrapperError.DEVICE_NOT_FOUND, pMessage);
    }
}

class DeviceBridgeError extends Error
{
    constructor(message) {
        super(message);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        Error.captureStackTrace(this, this.constructor);
    }
}

module.exports = {
    DeviceBridgeError,
    AdbWrapperError
};