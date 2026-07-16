/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
import {Auditable} from "../../Auditable.js";
import {Secret, SecretUUID} from "../../core/secrets/Secret.js";
import {SecurityZone} from "../../security/SecurityZone.js";
import {DbDataType, DbKeyType, NodeProperty, NodeType, TagUUID, ValidationRule} from "@reversense/dexcalibur-orm";
import {Credential} from "./Credential.js";


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
    help?: string;
    descr?: string;
    values?: any[];
}

export interface FieldMapping {
    name: string;
    field: string;
    help?: string;
    descr?: string;
    values?: any[];
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
    APPSTORE="appstore",
    OPENAI="openai",
    CLAUDE="claude",
    LLM="llm",
    SCW="scw",
    AWS="aws",
    GCP="gcp",
    CORL="corl"
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
        { name:"OPENAI", value:ConnectionProtocol.OPENAI, disabled:false, label:"OpenAI", icon:["fas","brain"] },
        { name:"CLAUDE", value:ConnectionProtocol.CLAUDE, disabled:false, label:"Claude", icon:["fas","brain"] },
        { name:"LLM", value:ConnectionProtocol.LLM, disabled:false, label:"LLM", icon:["fas","brain"] },
        { name:"AWS", value:ConnectionProtocol.AWS, disabled:false, label:"AWS", icon:["fab","aws"] },
        { name:"GCP", value:ConnectionProtocol.GCP, disabled:false, label:"Google Cloud", icon:["fab","google"] },
        { name:"CORL", value:ConnectionProtocol.CORL, disabled:true, label:"Corellium", icon:["fab","google"] }
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
            ConnectionProtocol.APPSTORE,
            ConnectionProtocol.GCP,
            ConnectionProtocol.AWS,
            ConnectionProtocol.OPENAI,
            ConnectionProtocol.CLAUDE,
            ConnectionProtocol.LLM
        ])
    }

    __:NodeInternalType = NodeInternalType.CONNECTION;


    static TYPE:NodeType = (new NodeType( "connection", NodeInternalType.CONNECTION, [
        (new NodeProperty("uuid"))
            .type(DbDataType.STRING)
            .descr("The UUID of the connection")
            .schema({ type: "string", format: "uuid" })
            .key(DbKeyType.PRIMARY),
        (new NodeProperty("name"))
            .descr("The human-ready name of the connection")
            .schema({ type: "string" })
            .type(DbDataType.STRING),
        (new NodeProperty("address"))
            .descr("The URI of the connection. It can be a simple string, or an URL.")
            .schema({ type: "string" })
            .type(DbDataType.STRING),
        (new NodeProperty("type"))
            .descr("The type of the protocol used by this connection. It can be HTTP, FTP, SSH, etc ...")
            .schema({ type: "string", enum: Object.values(ConnectionProtocol) as ConnectionProtocol[] })
            .type(DbDataType.STRING),
        (new NodeProperty("description"))
            .descr("A description of the purpose of this connection")
            .schema({ type: "string" })
            .type(DbDataType.STRING)
            .def(""),
       // (new NodeProperty("credential")).single(Credential.TYPE).embed(),
        (new NodeProperty("owner"))
            .type(DbDataType.STRING)
            .def(null),
        (new NodeProperty("fields"))
            .type(DbDataType.STRING)
            .descr("A map of parameters used by this connection. The key is the name of the fields, and the value is the value of the field.")
            .schema({ type: "object", patternProperties: { "^.+$": { type: "string" }} })
            .def(null),
        (new NodeProperty("secrets"))
            .type(DbDataType.STRING)
            .descr("A map of secrets used by this connection. The key is the name of the secret, and the value is the UUID of the secret.")
            .schema({ type: "object", patternProperties: { "^.+$": { type: "string", format: "uuid" }} })
            .def(null),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
            .descr("List of tags")
            .schema({ type: "string" })
            .def(null),
    ])).descr(`
    A connection is a generic representation of a way to connect to a remote service and pull resources. 
    It can be a generic protocol such remote HTTP server, a remote FTP server, a remote SSH server, etc ... 
    as well as a specific resources using proprietary protocols such as Google PlayStore, APKPure, F-Droid, Huawei App Gallery, etc ...
    
    Any action performed on a remote resource will be performed using a connection. 
    `);



    uuid:ConnectionUUID;
    type: ConnectionProtocol;
    name: string;
    description:string;
    address: string;
    tags:TagUUID[] = [];
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
Connection.TYPE.builder(Connection);