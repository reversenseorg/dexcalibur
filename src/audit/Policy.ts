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

import {IChange} from "../common/Change.js";
import {DbDataType, NodeProperty, NodePropertyState, NodeType, TagUUID} from "@reversense/dexcalibur-orm";
import {NodeInternalType, Nullable} from "@reversense/dxc-core-api";
import {ValidationRule} from "@reversense/dexcalibur-orm";
import {ProjectInputPurpose} from "../analyzer/ProjectInput.js";
import {PolicyRule, PolicyRuleOptions} from "./PolicyRule.js";
import {PolicyException} from "./errors/PolicyException.js";
import {AssuranceModelUUID} from "./common/AssuranceModel.js";
import {BusinessPlan} from "../billing/BusinessPlan.js";

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
    rules?:PolicyRule[];
    model?:AssuranceModelUUID;
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

    static SUPPORTED_ZONES:PolicyZone[] = [
        PolicyZone.APP, PolicyZone.ORG,
        PolicyZone.PRJ, PolicyZone.NONE
    ];

    static VALIDATE = {
        scopeZone: ValidationRule.newPinklistAssert(Policy.SUPPORTED_ZONES)
    };

    static TYPE:NodeType = (new NodeType( "policy", NodeInternalType.POLICY, [
        (new NodeProperty("uuid")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("name")).type(DbDataType.STRING).notnull(),
        (new NodeProperty("description")).type(DbDataType.STRING),
        (new NodeProperty("version")).type(DbDataType.INTEGER).def(-1),
        (new NodeProperty("changes")).type(DbDataType.BLOB),
        (new NodeProperty("scope")).type(DbDataType.BLOB),
        (new NodeProperty("enabled")).type(DbDataType.BLOB),
        (new NodeProperty("rules"))
            .type(DbDataType.BLOB)
            .sleep( (x:NodePropertyState) => {
                if(x.p==null) return [];
                return x.p.map(r => r.toJsonObject());
            })
            .wakeUp( (x:NodePropertyState) => {
                if(x.p==null) return [];

                /*const bp = BusinessPlan.fromJsonObject(x.p);
                bp.setWallet(x.p.wallet.map(p => {
                    return new Purchase(p);
                }));*/

                return x.p.map( r => new PolicyRule(r));
            })
            .def([]),
        (new NodeProperty("tags")).type(DbDataType.BLOB),
        (new NodeProperty("model")).type(DbDataType.STRING)
    ])).dataSource("PROJECT_DB");

    __:NodeInternalType = NodeInternalType.POLICY;

    // COMMON

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

    // CUSTOM

    rules:PolicyRule[] = [];

    model:Nullable<AssuranceModelUUID> = null;


    constructor(pOptions:PolicyOptions = {}) {
        if(pOptions.uuid!=null) this.uuid = pOptions.uuid;
        if(pOptions.name!=null) this.name = pOptions.name;
        if(pOptions.description!=null) this.description = pOptions.description;
        if(pOptions.version!=null) this.version = pOptions.version;
        if(pOptions.changes!=null) this.changes = pOptions.changes;
        if(pOptions.scope!=null) this.scope = pOptions.scope;
        if(pOptions.rules!=null) this.rules = pOptions.rules;
        if(pOptions.enabled!=null) this.enabled = pOptions.enabled;
        if(pOptions.model!=null) this.model = pOptions.model;
    }

    /**
     *
     */
    getUID():PolicyUUID {
        return this.uuid;
    }

    /**
     *
     * @param vUid
     */
    setUID(vUid:PolicyUUID):void {
        this.uuid = vUid;
    }

    /**
     * To add or replace a rule in the policy
     *
     * @param {PolicyRule} pRule
     * @method
     */
    addRule(pRule:PolicyRule):void {

        for(let i=0; i<this.rules.length; i++){
            if(this.rules[i].name===pRule.name){
                // replace existing rule
                this.rules[i] = pRule;
                return;
            }
        }

        // the rule is not already in the list
        this.rules.push(pRule);
        return;
    }

    /**
     * To remove a rule by the instance or name
     *
     * @param {PolicyRule|string} pRule
     * @method
     */
    removeRule(pRule:PolicyRule|string):void {
        if(pRule==null){
            throw PolicyException.CANNOT_REMOVE_RULE(this.name, 'rule is null');
        }

        if(typeof pRule==='string'){
            this.rules = this.rules.filter( r => r.name!=pRule);
        }else{
            this.rules = this.rules.filter( r => r.name!=pRule.name);
        }
    }

    /**
     * To prepare to json serialized
     *
     * @method
     */
    toJsonObject():any{
        const o = {
            uuid:this.uuid,
            name: this.name,
            description: this.description,
            version: this.version,
            changes: this.changes,
            scope:this.scope,
            tags:this.tags,
            enabled: this.enabled,
            model: this.model,
            rules: []
        };

        this.rules.map(r => {
            o.rules.push( r.toJsonObject());
        })

        return o;
    }

    static fromUnsafeObject(pOptions:PolicyOptions) {
        const policy = new Policy({
            ...pOptions,
            rules: []
        });

        if(pOptions.rules!=null ){
            pOptions.rules.map(((vRule) => {
                policy.addRule(new PolicyRule(vRule));
            }));
        }


        return policy;
    }
}