import {UserAccount} from "../UserAccount.js";
import {SessionCode, SessionException} from "./SessionException.js";
import Util from "../../Utils.js";
import {ConnectionHandler, ConnectionHandlerMap} from "../../remote/ConnectionHandler.js";
import DexcaliburEngine, {DexcaliburProjectMap} from "../../DexcaliburEngine.js";
import DexcaliburProject from "../../DexcaliburProject.js";
import AccessControl from "../acl/AccessControl.js";
import {AccessZone} from "../acl/Zones.js";
import {ProjectAccessControl} from "../acl/rbac/ProjectAccessContol.js";
import {IDexcaliburEngine} from "../../IDexcaliburEngine.js";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";;
import {IPersistent} from "../../persist/orm/IPersistent.js";
import {SessionData} from "./SessionData.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {INode, NodeType} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../../core/IStringIndex.js";
import * as Log from "../../Logger.js";



let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface UserSessionOptions {
    _uid?: string;
    _acc?: UserAccount;
    _created? :number;
    _destroyed? :number;
    _project?:Record<string, DexcaliburProject>;
    _defaultProject?:DexcaliburProject;
    _data?:Record<string, SessionData>;
    _must_set_cookie?:boolean;
}

export class UserSession implements IPersistent, INode {

    static TYPE:NodeType = new NodeType(
        'session',
        NodeInternalType.USER_SESSION,
        [
        ]
    ).dataSource("ENGINE_DB");

    __:NodeInternalType = NodeInternalType.USER_SESSION;

    private _uid:string;
    private _acc: UserAccount;

    /**
     * unix timestamp
     */
    _created: number;

    /**
     * unix timestamp
     */
    _destroyed: number = -1;

    // uid of project associated to the current session
    // TODO : add instance UID instead of project UID
    _project: DexcaliburProjectMap = {};
    _defaultProject: DexcaliburProject = null;

    _data:Record<string, SessionData> = {};


    _conn:ConnectionHandlerMap = {};

    _must_set_cookie = false;

    tags:number[] = [];

    constructor( pConfig:Nullable<UserSessionOptions> = null) {

        if(pConfig !=null){
            for(const i in pConfig){
                this[i] = pConfig[i];

            }
        }

    }

    static create( pSessUID:string, pAccount: UserAccount):UserSession {

        if((pAccount instanceof UserAccount)==false)
            throw new SessionException("Session cannot be created : invalid user account", SessionCode.INVALID_ACCOUNT);

        if(Util.isEmpty(pSessUID, Util.FLAG_CR | Util.FLAG_WS))
            throw new SessionException("Session cannot be created : invalid user account", SessionCode.EMPTY_SESSID);

        return new UserSession({
            _uid: pSessUID,
            _acc: pAccount,
            _created:  Date.now()
        });
    }


    isMustSetCookie():boolean {
        return this._must_set_cookie;
    }

    /**
     * To check is the current session is owned by the given account
     *
     * @param pAccount
     */
    isOwnedBy( pAccount:UserAccount):boolean {
        return this._acc.is(pAccount);
    }

    destroy():void {
        this._destroyed = Date.now();
    }

    getUserAccount():UserAccount {
        return this._acc;
    }


    /**
     * To check if a session have been destroyed or not
     *
     * @return {boolean} TRUE if destroyed, else FALSE
     * @method
     */
    isActive():boolean {
        return (this._destroyed <= 0);
    }

    /**
     * To get session UID
     *
     * @return {string} Session UID
     */
    getSessUID():string {
        return this._uid;
    }

    getUID(): any {
        return this._uid;
    }

    /**
     * To get time
     *
     * @param pType
     */
    getTime(pType:string):number {
        switch(pType){
            case 'created':
                return this._created;
                break;
            default:
                return null;
        }
    }

    /**
     * To refresh the list of active projects associated to this session
     *
     * @param pEngine
     */
    refreshActiveProject( pEngine:IDexcaliburEngine):void {

        // TODO : add ACL which allows non-owner but authorized auditor (group/team) to work on this project
        this._project = pEngine.getActiveProjects(this.getUserAccount());

        if(this._defaultProject == null){
            const PUIDS = Object.keys(this._project);
            if(PUIDS.length > 0){
                this._defaultProject = this._project[PUIDS[0]];
            }
        }
    }

    /**
     * To get a list of active project associated to the session
     *
     * @return {string[]} Array of project UID
     */
    getActiveProjects():string[] {
        if(this._destroyed > -1)
            throw new SessionException("Data cannot be read : Session has been destroyed.", SessionCode.DESTROYED);

        return Object.keys(this._project);
    }

    getActiveProject( pUID:string = null):DexcaliburProject {

        const PUIDS = Object.keys(this._project);

        if(PUIDS.length==0){
            throw SessionException.NO_ACTIVE_PROJECT();
        }

        if(PUIDS.length>1 && pUID==null){
            throw SessionException.MULTIPLE_ACTIVE_PROJECT();
        }

        if(pUID!=null){
            if(!this._project.hasOwnProperty(pUID)){
                throw SessionException.INVALID_ACTIVE_PROJECT_UID();
            }
            return this._project[pUID];
        }else{
            return this._project[PUIDS[0]];
        }
    }

    setDefaultActiveProject( pProject:DexcaliburProject):void {
        // TODO : add ACL which allows non-owner but authorized auditor (group/team) to work on this project
        /*
        AccessControl.checkAttr(
            AccessZone.PROJECT,
            ProjectAccessControl.attr.GROUP,
            pProject,
            this.getUserAccount()
        )*/
        if(!this._project.hasOwnProperty(pProject.getUID())){
            this._project[pProject.getUID()] = pProject;
        }
        this._defaultProject = pProject;
        this.addData('prj_active', pProject);
    }

    /**
     * To get an active project by its UID
     *
     * @param pContext
     * @param pProjectUID
     */
    getActiveProjectByUID( pContext:DexcaliburEngine, pProjectUID:string):DexcaliburProject {

        // check if the user is the project owner
        // replace by read access ?
        /*AccessControl.checkAttr(
            AccessZone.PROJECT,
            ProjectAccessControl.attr.OWNER,
            pContext.getProject(pProjectUID),
            this.getUserAccount()
        );*/


        AccessControl.check(
            AccessZone.PROJECT,
            ProjectAccessControl.access.PROJ_OPEN_OWN,
            pContext.getProject(pProjectUID),
            this.getUserAccount()
        );


        return pContext.getProject(pProjectUID);
    }

    addConnection( pName:string, pHandler:ConnectionHandler):void {
        this._conn[pName] = pHandler;
    }

    getConnection( pName:string): ConnectionHandler {
        return this._conn[pName];
    }

    addData( pName:string, pValue:any):void {
        if(this._destroyed > -1)
            throw new SessionException("Data cannot be read : Session has been destroyed.", SessionCode.DESTROYED);

        this._data[pName] = new SessionData({  _sess:this, _name:pName, _value:pValue });
        //UserSession.TYPE.trigger('save_data', this._data[pName]);
    }

    getData( pName:string = null):any  {
        if(this._destroyed > -1)
            throw new SessionException("Data cannot be read : Session has been destroyed.", SessionCode.DESTROYED);

        //console.log("getData ", pName, this._data[pName],  )
        if(pName==null){
            return this._data;
        }
        else if(this._data[pName] != null){
            return this._data[pName].getValue();
        }else{
            return null;
        }
    }

    toJsonObject():any {
        const o:any = {};
        o._uid = this._uid;
        o._created = this._created;
        o._destroyed = this._destroyed;
        o._project = Object.keys(this._project);
        o._defaultProject = this._defaultProject!=null ? this._defaultProject.getUID() : null;
        o._acc = this._acc.getUID();
        //o._data = this._uid;
        o._conn = Object.keys(this._conn);
        CoreDebug.checkJsonSerialize(o,"UserSession");
        return o;
    }

    /**
     * To set user account linked to this session
     *
     * @param {UserAccount} pAccount
     * @method
     */
    setUserAccount(pAccount: UserAccount) {
        this._acc = pAccount;
    }
}

UserSession.TYPE.builder(UserSession);