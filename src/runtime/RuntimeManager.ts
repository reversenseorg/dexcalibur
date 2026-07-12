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

import DexcaliburProject, {DexcaliburProjectUUID} from "../DexcaliburProject.js";
import {UserAccount} from "../user/UserAccount.js";
import AccessControl from "../user/acl/AccessControl.js";
import {ProjectAccessControl} from "../user/acl/rbac/ProjectAccessContol.js";
import {OrganizationAccessControl} from "../user/acl/rbac/OrganizationAccessContol.js";
import {GlobalAccessControl} from "../user/acl/rbac/GlobalAccessContol.js";
import HookSession from "../HookSession.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import {Device, DeviceUUID} from "../Device.js";
import * as Log from "../Logger.js";
import {RuntimeManagerException} from "../errors/RuntimeManagerException.js";
import {RuntimeSession, RuntimeSessionUUID} from "./RuntimeSession.js";
import {UserPreferences} from "../user/UserPreferences.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {INode, NodeUtils} from "@dexcalibur/dexcalibur-orm";
import {INodeRef} from "../INode.js";
import FuzzSession from "../fuzzing/FuzzSession.js";
import {RuntimeEvent} from "../hook/RuntimeEvent.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface RuntimeHookSessionOpts{
    script?:string;
    pid?:string;
    app?:string;
}

/**
 * Manage runtime events, sessions and actions for a given project
 *
 * It exposes API to retrieve, batch or atomic, events and session from DB
 *
 * @class
 * @since 1.12.1
 */
export class RuntimeManager {

    private _ctx:DexcaliburProject;

    constructor(pCtx:DexcaliburProject) {
        this._ctx = pCtx;
    }

    private _checkAccess(pUser:UserAccount){
        AccessControl.isAuthorized(
            AccessControl.access.PROJ_OPEN_OWN,
            pUser,
            this._ctx, // the resource
            [
                ProjectAccessControl.attr.OWNER,
                ProjectAccessControl.attr.TESTER,
                OrganizationAccessControl.attr.APP_MEMBER,
                GlobalAccessControl.attr.ORG
            ]
        );
    }

    /**
     *
     * @param pSession
     * @private
     */
    private async _createSessions(pSession:RuntimeSession):Promise<RuntimeSession>{

        pSession.uuid = await this._ctx.getProjectDB().generateFreeUuid(
                RuntimeSession.TYPE.getType(),
                RuntimeSession.TYPE.getPrimaryKey().getName());

        return await (this._ctx.getProjectDB()
            .getCollectionOf(RuntimeSession.TYPE.getType()) as MongodbDbCollection)
            .asyncAddEntry({ uuid: pSession.getUID() }, pSession);
    }

    async getSessionsStats(pUser: UserAccount) {
        // Security check : acl
        this._checkAccess(pUser);

        const sess = await this._ctx.getProjectDB().getCollectionOf(HookSession.TYPE.getType()).getAsList();



        return [];
    }

    async startSession(pUser:UserAccount, pDevice:Nullable<DeviceUUID> = null):Promise<RuntimeSession> {
        let dev:DeviceUUID = pDevice;
        let sess = new RuntimeSession({
            project: this._ctx.getUID(),
            owner: pUser.getUID(),
            date: (new Date()).getTime()
        });

        if(pDevice==null){
            const prefs = await this._ctx.getContext().getUserService().getUserPrefs(pUser);
            if(prefs==null){
                throw new Error("No device selected for this session");
            }else{
                dev = prefs.getPreferredDevice(this._ctx.getUID());
            }
        }

        if(dev==null){
            throw RuntimeManagerException.NO_DEVICE_SELECTED();
        }

        sess.setContext(this._ctx);
        sess.setDevice(dev);

        sess = await this._createSessions(sess);

        return sess;
    }


    async stopSession(pUser:UserAccount, pSession:RuntimeSessionUUID):Promise<void> {

        const sess = await this._ctx.getProjectDB().search({
            _uid: pSession
        }, RuntimeSession.TYPE.getType())

        if(sess==null || sess.length==0){
            throw RuntimeManagerException.SESS_NOT_FOUND(pSession);
        }

        let s:any;
        for(let i=0; i<sess.length; i++){
            s = await this._ctx.getHookManager().getSession(sess[i].getUID());
            console.log(s);
        }

        //sess[0].getActiveSessions();
        //await sess[0].stop();

    }


    async pause(pUser:UserAccount, pSession:RuntimeSessionUUID):Promise<void> {
        return null;
    }

    /**
     * Start a new hook session for a given user and device.
     *
     * If device is missing, the user preferences are used to select the device.
     *
     * @param pUser
     * @param pDevice
     * @returns
     */
    async startHookSession(pUser: UserAccount, pType:string,
                           pDevice:Nullable<DeviceUUID> = null,
                           pOptions:RuntimeHookSessionOpts = {}):Promise<{ rt:RuntimeSession, hs:HookSession }> {

        let sess = await this.startSession(pUser, pDevice);
        let hs = await this.newHookSession(pUser, sess, pType, pOptions);

        return { rt:sess, hs:hs };
    }

    async newHookSession(pUser:UserAccount, pSess:RuntimeSession,
                                 pType:string, pOptions:RuntimeHookSessionOpts = {}):Promise<HookSession>{

        let sess = await this._ctx.getHookManager().newSession();
        // add session owner
        sess.setOwner(pUser.getUID());
        // append hook session
        pSess.addHookSession(sess.getUID());
        // attach device
        sess.setDeviceUID(pSess.device);




        switch(pType){
            case "spawn-self":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${this._ctx.getPackageName()}, type=spawn-self]`);
                sess = await this._ctx.getHookManager().asyncStartBySpawn(this._ctx.getPackageName(), sess, pOptions.script);
                break;
            case "spawn":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${pOptions.app}, type=spawn]`);
                sess = await this._ctx.getHookManager().asyncStartBySpawn(pOptions.app, sess, pOptions.script);
                break;
            case "attach-gadget":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [pid=Gadget, type=attach-gadget]`);
                sess = await this._ctx.getHookManager().asyncStartByAttachToGadget(sess, pOptions.script);
                break;
            case "attach-app-self":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${this._ctx.getPackageName()}, type=attach-app-self]`);
                sess = await this._ctx.getHookManager().asyncStartByAttachToApp(this._ctx.getPackageName(), sess, pOptions.script);
                break;
            case "attach-app":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [app=${pOptions.app}, type=attach-app-x]`);
                sess = await this._ctx.getHookManager().asyncStartByAttachToApp(pOptions.app, sess, pOptions.script);
                break;
            case "attach-pid":
                Logger.info(`[HOOK MANAGER][WEBSOCKET] Start hooking [pid=${pOptions.pid}, type=attach-to-pid`);
                sess = await this._ctx.getHookManager().asyncStartByAttachTo(pOptions.pid, sess, pOptions.script );
                break;
            default:
                Logger.error('[HOOK MANAGER] Invalid start type');
                throw  new Error('[HOOK MANAGER] Invalid start type' );
                break;
        }

        // save session
        pSess = await this._save<RuntimeSession>(pSess, ['hksess','device']);
        return sess;
    }


    private async _saveHS(pSession:HookSession, pOptions?:string[]):Promise<HookSession> {
        return await this._ctx.getProjectDB().save(pSession,null,pOptions) as HookSession;
    }

    private async _save<T extends INode>(pSession:T, pOptions?:string[]):Promise<T> {
        return await this._ctx.getProjectDB().save(pSession,null,pOptions) as T;
    }

    async getSession(pUser: UserAccount, pSess:RuntimeSessionUUID):Promise<RuntimeSession> {
        // Security check : acl
        this._checkAccess(pUser);

        const sess:RuntimeSession[] = await this._ctx.getProjectDB().search({
                uuid: pSess
            },RuntimeEvent.TYPE.getType()
        );

        if(sess==null || sess.length==0)
            return null;
        else
            return sess[0];
    }

    async listSessions(pUser: UserAccount, pProject:DexcaliburProjectUUID, pStat = false):Promise<RuntimeSession[]> {
        // Security check : acl
        this._checkAccess(pUser);

        const sess = await this._ctx.getProjectDB().search(
            { project: pProject },
            RuntimeSession.TYPE.getType()
        );

        if(pStat) return sess;

        for(let i=0; i<sess.length; i++){

            sess[i].hksess = await this._ctx.getProjectDB().search({
                filter: {
                    _uid: { $in: sess[i].hksess }
                }
            },HookSession.TYPE.getType(), { raw: true });

            sess[i].hksess = sess[i].hksess.map( (v:HookSession) => {
                return {
                    date: v.time,
                    len: v.offset,
                    pid: v.frida.pid,
                    _uid: v.getUID()
                }
            });
        }

        return sess;
    }

    async listEvents(pUser: UserAccount, pSess:RuntimeSessionUUID, pOpts:any):Promise<RuntimeEvent<any>[]> {
        // Security check : acl
        this._checkAccess(pUser);


        const sess = await this.getSession(pUser, pSess);
        if(sess==null){
            throw RuntimeManagerException.SESS_NOT_FOUND(pSess);
        }

       /* sess.hksess

        const evts = await this._ctx.getProjectDB().search(
            {
                project: pProject
            },
            RuntimeEvent.TYPE.getType()
        );*/


        return [];
    }
}