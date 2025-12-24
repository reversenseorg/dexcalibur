import {
    DbDataType,
    DbKeyType,
    INode,
    NodeProperty, NodePropertyState,
    NodeType,
    SerializeOptions,
    TagUUID, ValidationRule
} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType, Nullable, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Auditable} from "../Auditable.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {OrganizationUnit, OrganizationUnitUUID} from "./OrganizationUnit.js";
import {AccessAttribute, AccessAttributeMap} from "../user/acl/AccessAttribute.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import { Architecture } from "../Architecture.js";
import {UserAccount, UserAccountUUID} from "../user/UserAccount.js";
import {Device, DeviceUUID} from "../Device.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import {Policy, PolicyUUID} from "../audit/Policy.js";
import {randomUUID} from "crypto";
import {ImageFormat} from "../platform/ImageFormat.js";
import {Connection} from "./conn/Connection.js";


export type ApplicationUnitUUID = string;


export interface ApplicationIcon {
    name?:string;
    format: ImageFormat,
    data: string| Buffer
}

export interface ApplicationUnitOptions {
    uuid?: ApplicationUnitUUID;
    name?: string;
    description?:string;
    packageID?: string;
    icon?: Nullable<ApplicationIcon>;
    os?:OperatingSystem;
    projects?:DexcaliburProjectUUID[];
    devices?:DeviceUUID[];
    orgUnit?:OrganizationUnitUUID;
    policies?:Policy[];
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
        (new NodeProperty("uuid"))
            .type(DbDataType.STRING)
            .key(DbKeyType.PRIMARY)
            .descr("The UUID  of the application unit")
            .addValidationRule(ValidationRule.uuid())
            .schema({ type: "string", format: "uuid" }),
        (new NodeProperty("name"))
            .type(DbDataType.STRING)
            .descr("The name of the application in the application store")
            .schema({ type: "string" }),
        (new NodeProperty("organization"))
            .single(OrganizationUnit.TYPE)
            .descr("The parent organization containing this application unit")
            .schema({ type: "string", format: "uuid" }),
        (new NodeProperty("packageID"))
            .type(DbDataType.STRING)
            .def("")
            .descr("The package identifier of the application, such as : `com.facebook.lite`, `com.google.android.apps.maps`, etc ...")
            .schema({ type: "string" }),
        (new NodeProperty("devices"))
            .type(DbDataType.STRING)
            .def([])
            .schema(Device.TYPE.getPrimaryKey().toJSONSchemaPart(true))
            .descr("List of devices assigned to this application unit. It is an array of DeviceUUID"),
        (new NodeProperty("projects"))
            .type(DbDataType.STRING)
            .def([])
            .schema(DexcaliburProject.TYPE.getPrimaryKey().toJSONSchemaPart(true))
            .descr("List of DexcaliburProject instance contained into this application unit"),
        (new NodeProperty("orgUnit")).type(DbDataType.STRING).def(null),
        (new NodeProperty("icon"))
            .type(DbDataType.BLOB)
            .def(null)
            .descr("The icon of the application unit. Can be null and contains tt is a base64 encoded image using this format : `interface ApplicationIcon { name?:string ,format: ImageFormat, data: string| Buffer }`"),
        (new NodeProperty("tags"))
            .type(DbDataType.STRING)
            .def([]),
        (new NodeProperty("os")).type(DbDataType.STRING)
            .def(OperatingSystem.NONE)
            .addValidationRule(ValidationRule.os())
            .schema({ type: "string", enum: Object.values(OperatingSystem) as OperatingSystem[] })
            .descr("The operating system targeted by this application unit"),
        (new NodeProperty("policies"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                let o:any[] = [];
                x.p.map((s:any) => {
                    o.push(s.toJsonObject());
                });
                return o;
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return [];
                return x.p.map((x:any) => {
                    return Policy.fromUnsafeObject(x);
                });
            })
            .def([])
            .descr("The policies where scan preferences and post-processing actions are stored. The policy can reflect privacy policy of the organization as well as custom expectations"),
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
    ])).descr(`
Represent an **application_unit** node - such as "Microsoft Copilot" - in the universal representation.          
ApplicationUnit represents all version of an application for the same package identifier and operating system.
An OrganizationUnit has many ApplicationUnit, one per couple of operating system / package identifier.
An ApplicationUnit contains at several DexcaliburProject, mainly one per version of the target application and 
sources.
    `);

    __:NodeInternalType = NodeInternalType.APP_UNIT;

    uuid:ApplicationUnitUUID;
    name: string;
    description:string;
    packageID: string;
    icon: Nullable<ApplicationIcon>;
    projects: DexcaliburProjectUUID[] = [];
    devices: DeviceUUID[] = [];
    orgUnit:OrganizationUnitUUID = null;
    os: OperatingSystem = OperatingSystem.NONE;
    policies: Policy[] = [];
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
            this.os = (pOptions.os!=null?pOptions.os : OperatingSystem.NONE);
            this.orgUnit = (pOptions.orgUnit!=null?pOptions.orgUnit : null);
            this.devices = (pOptions.devices!=null?pOptions.devices : []);
            this.projects = (pOptions.projects!=null?pOptions.projects : []);
            this.policies = (pOptions.policies!=null?pOptions.policies : []);
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
        // a list of user allowed
        this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER);
        // a list a user group allowed
        this.setAccessAttribute(OrganizationAccessControl.attr.APP_MEMBER_GRP);
        // the Org UUID
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

    setIcon(pFormat:ImageFormat, pData:string|Buffer):void {
        this.icon = {
            format: pFormat,
            data: pData
        }
    }


    toJsonObject(pOption?: SerializeOptions): any {
        const o:any = {
            uuid: this.uuid,
            name: this.name,
            description: this.description,
            icon: this.icon,
            packageID: this.packageID,
            orgUnit: this.orgUnit,
            devices: this.devices,
            os: this.os,
            projects: this.projects,
            policies: this.policies.map(x => x.toJsonObject()),
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

    /**
     * To check if a project is a part of this app
     *
     * @param pProjectUUID
     * @since 1.8.28
     */
    hasRelease(pProjectUUID: DexcaliburProjectUUID) {
        return (this.projects.indexOf(pProjectUUID)>-1);
    }

    /**
     * To remove a release from the list
     *
     * @param pProjectUUID Project to remove
     * @since 1.8.28
     */
    removeRelease(pProjectUUID: DexcaliburProjectUUID) {
        this.projects = this.projects.filter(x => (x!=pProjectUUID));
    }


    /**
     * To add or update a policy
     *
     * @param pPolicy
     */
    addPolicy(pPolicy:Policy):Nullable<Policy> {

        let uuid:PolicyUUID;

        if(pPolicy.getUID()==null){
            do{
                uuid = randomUUID();
            }while(this.policies.find((p) => (p.getUID()===uuid))!=null);
            pPolicy.setUID(uuid);
        }else{
            // update if UUID exists
            for(let i=0; i<this.policies.length; i++){
                if(this.policies[i].getUID()==pPolicy.getUID()){
                    this.policies[i] = pPolicy;
                    return pPolicy;
                }
            }
        }

        this.policies.push(pPolicy);
        return pPolicy;
    }

    /**
     *
     * @param pPolicy
     */
    removePolicy(pPolicy:PolicyUUID):void {
        this.policies = this.policies.filter(p => (p.getUID()!=pPolicy));
    }

    /**
     *
     * @param pPolicy
     */
    getPolicy(pPolicy:PolicyUUID):Nullable<Policy> {
        return this.policies.find(r => (r.getUID()===pPolicy));
    }
}
ApplicationUnit.TYPE.builder(ApplicationUnit);