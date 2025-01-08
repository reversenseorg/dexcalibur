import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../../Auditable.js";
import {Secret} from "../../core/secrets/Secret.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {ValidationRule} from "../../Validator.js";





export interface SecretMapping {
    name: string;
    secret: any;
}

export interface FieldMapping {
    name: string;
    field: string;
}

export interface ProtocolMapping {
    secrets: SecretMapping[],
    fields: FieldMapping[],
}

export enum ConnectionProtocol {
    DOCKER="docker_registry",
    HTTP="http",
    HTTP_BASIC="http_basic",
    HTTP_REALM="http_realm",
    FTP="ftp",
    SSH="ssh",
    PLAYSTORE="playstore",
    APPSTORE="appstore"
}

export enum ConnectionSubject {
    USER="user",
    GROUP="group",
    APP="app"
}

export type ConnectionUUID = string;

export interface ConnectionOptions {
    uuid?:ConnectionUUID;
    type?: ConnectionProtocol;
    name?: string;
    description?:string;
    address?: string;
    secrets?:Record<string, Secret>;
    fields?:Record<string, string>;
}

export class Connection extends Auditable   {

    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        address: ValidationRule.utf8String(),
        type: ValidationRule.newPinklistAssert([
            ConnectionProtocol.HTTP,
            ConnectionProtocol.HTTP_BASIC,
            ConnectionProtocol.HTTP_REALM,
            ConnectionProtocol.DOCKER,
            ConnectionProtocol.FTP,
            ConnectionProtocol.SSH,
            ConnectionProtocol.PLAYSTORE,
            ConnectionProtocol.APPSTORE
        ])
    }

    __:NodeInternalType = NodeInternalType.CONNECTION;

    uuid:ConnectionUUID;
    type: ConnectionProtocol;
    name: string;
    description:string;
    address: string;
    tags:number[] = [];
    secrets:Record<string, Secret> = {};
    fields:Record<string, string> = {};

    constructor(pOptions:Nullable<ConnectionOptions>) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.description = pOptions.description!;
            this.type = pOptions.type!;
            this.address = pOptions.address!;
            this.fields = (pOptions.fields!=null ? pOptions.fields : {});
            this.secrets = (pOptions.secrets!=null ? pOptions.secrets : {});
        }

    }

    getUID():ConnectionUUID {
        return this.uuid;
    }


    /**
     * To init ACL attributes of OrganizationUnit instances
     *
     * Supported attributes:
     * - `OrganizationAccessControl.attr.ORG_MEMBER`
     *
     * @return {void}
     * @method
     */
    initAccessAttributes(){

    }

    toJsonObject(pOption?: any, pZone:SecurityZone = SecurityZone.PUBLIC): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            type: this.type,
            address: this.address,
            secrets: {},
            fields: this.fields,
            tags:  this.tags
        };

        if(pZone == SecurityZone.PUBLIC){
            for(let k in this.secrets) o.secrets[k] = this.secrets[k].getUID();
        }

        return o;
    }

    getName() {
        return this.name;
    }

    setName(pName:string):void {
        /*if(!Connection.VALIDATE.name.test(pName)){
            throw OrganizationManagerException.INVALID_USER_ACCOUNTS_LIST();
        }*/

        this.name = pName;
    }

    setDescription(pVal:string):void {
        this.description = pVal;
    }

    setType(pVal:ConnectionProtocol):void {
        this.type = pVal;
    }

    setAddress(pVal:string):void {
        this.address = pVal;
    }

    mapField(pFieldName: string, pFieldValue: any) {
        this.fields[pFieldName] = pFieldValue;
    }

    mapSecret(pSecretName: string, pSecret: Secret) {
        this.secrets[pSecretName] = pSecret;
    }
}