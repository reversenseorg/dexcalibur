import DexcaliburProject from "../DexcaliburProject.js";
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
import {RuntimeSession} from "./RuntimeSession.js";
import {UserPreferences} from "../user/UserPreferences.js";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {INode, NodeUtils} from "@dexcalibur/dexcalibur-orm";
import {INodeRef} from "../INode.js";

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
            owner: pUser.getUID()
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
}