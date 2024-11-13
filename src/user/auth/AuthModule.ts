import {Nullable} from "@dexcalibur/dxc-core-api";
import {SecurityZone} from "../../security/SecurityZone.js";
import {AuthenticationSettings} from "./AuthenticationSettings.js";
import {ValidationRule} from "@dexcalibur/dexcalibur-orm";

export enum AuthModuleType {
    LOCAL_PASSWD='local_pwd',
    OIDC='oidc'
}

export interface SelfRegistrationStatus {
    orgMember:boolean;
    external:boolean;
    guests:boolean;
}

export interface AuthModuleOptions {
    type?:AuthModuleType;
    uid?:string;
    name?:string;
    active?:boolean;
    btnImg?:Buffer;
    selfReg?:SelfRegistrationStatus;
    [extra:string]:any;
}

export class AuthModule {

    static VALIDATE:Record<string, ValidationRule> = {
        type: ValidationRule.newPinklistAssert([ AuthModuleType.OIDC, AuthModuleType.LOCAL_PASSWD ]),
        uid: ValidationRule.newRegexpAssert(/^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}$/),
        name: ValidationRule.newRegexpAssert(/^[0-9a-zA-Z-_]{3,64}$/),
        active: ValidationRule.newPinklistAssert([ true, false ])
    }


    type:AuthModuleType;

    uid:string = null;

    name:string;

    active = false;

    btnImg:Nullable<Buffer> = null;

    selfReg:SelfRegistrationStatus = {
        orgMember: false,
        external: false,
        guests: false
    };

    constructor(pOptions:AuthModuleOptions) {
        this.update(pOptions);
    }

    getUID():string {
        return this.uid;
    }

    setUID(pUUID:string):void {
        this.uid = pUUID;
    }

    update(pOptions:AuthModuleOptions|AuthModule) {
        this.type = pOptions.type!;
        this.uid = pOptions.uid!;
        this.name = pOptions.name!;
        this.active = pOptions.active!;
        this.btnImg = pOptions.btnImg!;
        this.selfReg = pOptions.selfReg!;
    }

    async testConnection(pAuthSettings:AuthenticationSettings):Promise<boolean> {

        return false;
    }

    toJsonObject(pZone:SecurityZone = SecurityZone.PUBLIC):any{
        return {
            type: this.type,
            uid: this.uid,
            name: this.name,
            active: this.active,
            btnImg: this.btnImg,
            selfReg: this.selfReg
        };
    }
}