

export abstract class PassportStrategy {

    /**
     * Strategy name
     */
    name:string;
    abstract authenticate(vReq:any, vOptions:any): any;
}