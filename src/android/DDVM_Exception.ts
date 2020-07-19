
/**
 *
 */
export default class DDVM_Exception extends Error
{
    code:string = '';

    constructor( pCode:string, pMessage:string){
        super(pMessage);
        // Ensure the name of this error is the same as the class name
        this.name = this.constructor.name;
        this.code = pCode;
        Error.captureStackTrace(this, this.constructor);
    }
}