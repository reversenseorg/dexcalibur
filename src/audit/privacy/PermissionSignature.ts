
export class PermissionSignature {

    protocol:string;

    pattern:string;

    constructor(pProtocol:string, pPattern:string) {
        this.protocol = pProtocol;
        this.pattern = pPattern;
    }
}