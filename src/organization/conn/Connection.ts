import {NodeInternalType, Nullable} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../../Auditable.js";
import {Secret, SecretUUID} from "../../core/secrets/Secret.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {ValidationRule} from "../../Validator.js";


export interface ConnectionProtocolType {
    name: string,
    value: ConnectionProtocol,
    label: string,
    icon: string[],
    disabled: boolean
}

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
    APKPURE="apkpure",
    FDROID="fdroid",
    HUAWAIAPPG="huawaiappstore",
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
    secrets?:Record<string, SecretUUID>;
    fields?:Record<string, string>;
}

export class Connection extends Auditable   {

    static SUPPORTED:ConnectionProtocolType[] = [
        { name:"HTTP", value:ConnectionProtocol.HTTP, disabled:false, label:"Anonymous HTTP", icon:["fas","webhook"] },
        { name:"HTTP_BASIC", value:ConnectionProtocol.HTTP_BASIC, disabled:false, label:"HTTP Basic authentication", icon:["fas","lock"] },
        { name:"HTTP_REALM", value:ConnectionProtocol.HTTP_REALM, disabled:false, label:"HTTP Bearer authentication", icon:["fas","lock"] },
        { name:"DOCKER", value:ConnectionProtocol.DOCKER, disabled:true, label:"Docker Registry", icon:["fab","docker"] },
        { name:"FTP", value:ConnectionProtocol.FTP, label:"FTP / SFTP / FTPS", disabled:true, icon:["fas","download"] },
        { name:"SSH", value:ConnectionProtocol.SSH, label:"SSH", disabled:false, icon:["fas","train-tunnel"] },
        { name:"PLAYSTORE", value:ConnectionProtocol.PLAYSTORE, disabled:false, label:"Google PlayStore", icon:["fab","google-play"] },
        { name:"APKPURE", value:ConnectionProtocol.APKPURE, disabled:false, label:"APK Pure", icon:["fab","google-play"] },
        { name:"FDROID", value:ConnectionProtocol.FDROID, disabled:false, label:"F-Droid", icon:["fab","google-play"] },
        { name:"HUAWAIAPPG", value:ConnectionProtocol.HUAWAIAPPG, disabled:false, label:"Huawei App Gallery", icon:["fab","google-play"] },
        { name:"APPSTORE", value:ConnectionProtocol.APPSTORE, disabled:true, label:"Apple AppStore", icon:["fab","app-store-ios"] },
    ];

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
            ConnectionProtocol.FDROID,
            ConnectionProtocol.APKPURE,
            ConnectionProtocol.HUAWAIAPPG,
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
    secrets:Record<string, SecretUUID> = {};
    fields:Record<string, string> = {};

    private _secrets:Record<SecretUUID, Secret>={};

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
     * - `OrganizationAccessControl.attr.MEMBER_GRP`
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

        // _secrets must be never exported

        for(let k in this.secrets) o.secrets[k] = this.secrets[k];

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

    mapSecret(pSecretName: string, pSecret: SecretUUID) {
        this.secrets[pSecretName] = pSecret;
    }

    hasField(pName:string):boolean {
        return (this.fields[pName]!=null);
    }

    hasSecret(pName:string):boolean {
        return (this.secrets[pName]!=null);
    }

    getField(pName:string):string {
        return (this.fields[pName]);
    }

    getSecretByName(pName:string):Nullable<SecretUUID> {
        return this.secrets[pName];
    }
}