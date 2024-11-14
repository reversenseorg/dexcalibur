import {NodeType} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {UserAccount, UserAccountUUID} from "../../user/UserAccount.js";

export type SecretUUID = string;

export interface SecretOptions {
    uid?:SecretUUID;
    name?:string;
    description?:string;
    blob?:Buffer;
}

export class Secret {


    /*static TYPE:NodeType = new NodeType(
        'secret',
        NodeInternalType.S,
        []
    );
    __:NodeInternalType = NodeInternalType.USER_ACCOUNT;
*/
    private uid:SecretUUID;
    private name: string;
    private description: string;
    private blob: Buffer;

    constructor(pOptions:SecretOptions) {
        this.uid = (pOptions.uid!=null ? pOptions.uid : null);
        this.name = (pOptions.name!=null ? pOptions.name : null);
        this.description = (pOptions.description!=null ? pOptions.description : null);
        this.blob = (pOptions.blob!=null ? pOptions.blob : null);
    }

    getUID():SecretUUID {
        return this.uid;
    }

    getName():string {
        return this.name;
    }

    getDescription():string {
        return this.name;
    }

    readSecret(pUserAccount:UserAccount): Buffer {
        return this.blob;
    }
}