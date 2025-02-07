import {IChange} from "../common/Change.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";
import {UserAccountUUID} from "../user/UserAccount.js";
import {Nullable} from "@dexcalibur/dxc-core-api";

export enum PolicyZone {
    NONE='none',
    APP='app',
    ORG='org',
    PRJ='prj'
}

export type PolicyUUID = string;

export interface PolicyOptions {
    uuid?:PolicyUUID;
    name?:string;
    description?:string;
    version?:string;
    changes?:IChange[];
    scope?:PolicyScope<any>;
    enabled?:boolean;
}

/**
 * Define what is the scope where this policy must be applied
 *
 * @interface
 */
export interface PolicyScope<T> {
    type: PolicyZone;
    uid?: T;
}


/**
 * This object help to define how to analyze scan result, and
 * what are the calls to action (CTA)
 *
 * This is a superclass for more specialized domain-driven policy
 *
 * @class
 */
export class Policy {

    uuid:PolicyUUID;

    name:string;

    description:string;

    version:string;

    changes:IChange[]=[];

    scope:PolicyScope<any> = {
        type: PolicyZone.NONE
    };

    enabled = false;

    tags:TagUUID[] = [];

    constructor(pOptions:PolicyOptions = {}) {
        if(pOptions.uuid!=null) this.uuid = pOptions.uuid;
        if(pOptions.name!=null) this.name = pOptions.name;
        if(pOptions.description!=null) this.description = pOptions.description;
        if(pOptions.version!=null) this.version = pOptions.version;
        if(pOptions.changes!=null) this.changes = pOptions.changes;
        if(pOptions.scope!=null) this.scope = pOptions.scope;
        if(pOptions.enabled!=null) this.enabled = pOptions.enabled;
    }


    /**
     * To prepare to json serialized
     *
     * @method
     */
    toJsonObject():any{
        return {
            uuid:this.uuid,
            name: this.name,
            description: this.description,
            version: this.version,
            changes: this.changes,
            scope:this.scope,
            tags:this.tags,
            enabled: this.enabled
        };
    }
}