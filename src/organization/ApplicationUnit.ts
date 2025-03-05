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
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import { Architecture } from "../Architecture.js";
import {ValidationRule} from "../Validator.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {DeviceUUID} from "../Device.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";


export type ApplicationUnitUUID = string;

export interface ApplicationUnitOptions {
    uuid?: ApplicationUnitUUID;
    name?: string;
    description?:string;
    packageID?: string;
    icon?: Nullable<Avatar>;
    sources?: any[];
    os?:OperatingSystem;
    projects?:DexcaliburProjectUUID[];
    devices?:DeviceUUID[];
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
        members: ValidationRule.uuidList(),
        devices: ValidationRule.uuidList()
    }

    static TYPE:NodeType = (new NodeType( "application_unit", NodeInternalType.APP_UNIT, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).key(DbKeyType.PRIMARY),
        (new NodeProperty("name")).type(DbDataType.STRING),
        (new NodeProperty("organization")).single(OrganizationUnit.TYPE),
        (new NodeProperty("packageID")).type(DbDataType.STRING).def(""),
        (new NodeProperty("sources")).type(DbDataType.STRING).def([]),
        (new NodeProperty("devices")).type(DbDataType.STRING).def([]),
        (new NodeProperty("projects")).type(DbDataType.STRING).def([]),
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
                            type: x.p[k]._t
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

    uuid:ApplicationUnitUUID;
    name: string;
    description:string;
    packageID: string;
    icon: Nullable<Avatar>;
    projects: DexcaliburProjectUUID[] = [];
    sources: any[];
    devices: DeviceUUID[] = [];
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
            this.devices = (pOptions.devices!=null?pOptions.devices : []);
            this.projects = (pOptions.projects!=null?pOptions.projects : []);
            this._attr = pOptions._attr!;
        }

    }

    getUID():ApplicationUnitUUID {
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
        this.setAccessAttribute(GlobalAccessControl.attr.ORG);
    }

    attachProject( pProject:DexcaliburProject, pForce = false){
        if(pProject.getAppUnit()!=null && !pForce){

        }
        this.projects.push(pProject.getUID());
        pProject.attachToAppUnit(this);
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

    hasReleases():boolean {
        return (this.projects.length>0);
    }

    getReleases():DexcaliburProjectUUID[] {
        return this.projects;
    }

    getParentOrganization():Nullable<OrganizationUnitUUID> {
        return this.orgUnit;
    }

    getTargetDevices():DeviceUUID[] {
        return this.devices;
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
            devices: this.devices,
            os: this.os,
            projects: this.projects,
            tags: this.tags
        };

        return o;
    }

    /**
     * To assign a device to this application unit
     * @param {DeviceUUID} pDevice Device UUID
     * @param {boolean} pRollback  Default FALSE. If TRUE, it deassign the device from app
     * @method
     */
    assignDevice(pDevice: DeviceUUID, pRollback = false) {
        if(!pRollback){
            if(this.devices.indexOf(pDevice)==-1){
                this.devices.push(pDevice);
            }
        }else{
            this.devices = this.devices.filter(d => d!==pDevice);
        }

        console.log("assignDevice > ", this.devices );
    }
}
ApplicationUnit.TYPE.builder(ApplicationUnit);