import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../Auditable.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {OrganizationUnit, OrganizationUnitUUID} from "./OrganizationUnit.js";
import {Avatar} from "@dexcalibur/dxc-orgs";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";
import DexcaliburProject from "../DexcaliburProject.js";
import { Architecture } from "../Architecture.js";
import {ValidationRule} from "../Validator.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";


export interface ApplicationUnitOptions {
    uuid?: string;
    name?: string;
    description?:string;
    packageID?: string;
    icon?: Nullable<Avatar>;
    sources?: string;
    os?:OperatingSystem;
    projects?:string[];
    orgUnit?:OrganizationUnitUUID;
    _attr?:AccessAttributeMap;
}

export class ApplicationUnit extends Auditable implements INode {


    static VALIDATE:Record<string, ValidationRule> = {
        uuid: ValidationRule.uuid(),
        name: ValidationRule.utf8String(),
        description: ValidationRule.utf8String(),
        packageID: ValidationRule.utf8String(),
        orgUnit: ValidationRule.uuid(),
        members: ValidationRule.uuidList()
    }

    static TYPE:NodeType = (new NodeType( "application_unit", NodeInternalType.APP_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("organization")).single(OrganizationUnit.TYPE),
        (new NodeProperty("packageID")).type(DbDataType.STRING).def(""),
        (new NodeProperty("sources")).type(DbDataType.STRING).def([]),
        (new NodeProperty("projects")).type(DbDataType.STRING).def(null),
        (new NodeProperty("orgUnit")).type(DbDataType.STRING).def(null),
        (new NodeProperty("icon")).type(DbDataType.STRING).def(null),
        (new NodeProperty("tags")).type(DbDataType.STRING).def(null),
        (new NodeProperty("os")).type(DbDataType.STRING).def(OperatingSystem.NONE),
        (new NodeProperty("_attr"))
            .type(DbDataType.STRING)
            .wakeUp( (x:NodePropertyState) => {
                if(x.p!=null){
                    const m:AccessAttributeMap = {};
                    for(let k in x.p){
                        m[k] = AccessAttribute.from({
                            name: x.p[k]._n,
                            value: x.p[k]._v,
                        });
                    }
                    return m;
                }else{
                    return {};
                }
            })
            .def({})
    ]));

    __:NodeInternalType = NodeInternalType.APP_UNIT;

    uuid:string;
    name: string;
    description:string;
    packageID: string;
    icon: Nullable<Avatar>;
    projects: string[] = [];
    sources: string;
    orgUnit:OrganizationUnitUUID = null;
    os: OperatingSystem = OperatingSystem.NONE;
    //archs: Architecture[] = [];
    //abi:string[] = [];

    tags:TagUUID[] = [];

    constructor(pOptions:Nullable<ApplicationUnitOptions>) {
        super({});

        if(pOptions!=null){
            this.uuid = pOptions.uuid!;
            this.name = pOptions.name!;
            this.description = pOptions.description!;
            this.packageID = pOptions.packageID!;
            this.icon = pOptions.icon!;
            this.sources = pOptions.sources!;
            this.os = (pOptions.os!=null?pOptions.os : OperatingSystem.NONE);
            this.orgUnit = (pOptions.orgUnit!=null?pOptions.orgUnit : null);
            this._attr = pOptions._attr!;
        }

    }

    getUID():string {
        return this.uuid;
    }


    /**
     * To init ACL attributes of ApplicationUnit instances
     *
     * Supported attributes:
     * - `OrganizationAccessControl.attr.APP_MEMBER`
     *
     * @return {void}
     * @method
     */
    initAccessAttributes(){
        this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER);
    }

    attachProject( pProject:DexcaliburProject){
        this.projects.push(pProject.getUID());
    }

    addMembers(pAccounts:UserAccountUUID[]):ApplicationUnit {
        pAccounts.map( (vAcc:UserAccountUUID)=>{
            this.appendToAccessAttribute(
                OrganizationAccessControl.attr.APP_MEMBER,
                vAcc
            );
        });

        return this;
    }

    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            icon: this.icon,
            sources: this.sources,
            packageID: this.packageID,
            orgUnit: this.orgUnit,
            os: this.os,
            projects: this.projects,
        };

        return o;
    }
}
ApplicationUnit.TYPE.builder(ApplicationUnit);