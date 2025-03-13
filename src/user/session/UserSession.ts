import {UserAccount} from "../UserAccount.js";
import {SessionCode, SessionException} from "./SessionException.js";
import Util from "../../Utils.js";
import {ConnectionHandler, ConnectionHandlerMap} from "../../remote/ConnectionHandler.js";
import DexcaliburEngine from "../../DexcaliburEngine.js";
import DexcaliburProject, {DexcaliburProjectUUID} from "../../DexcaliburProject.js";
import AccessControl from "../acl/AccessControl.js";
import {ProjectAccessControl} from "../acl/rbac/ProjectAccessContol.js";
import {IDexcaliburEngine} from "../../IDexcaliburEngine.js";
import {NodeInternalType}
from "@dexcalibur/dxc-core-api";
import {IPersistent} from "../../persist/orm/IPersistent.js";
import {SessionData} from "./SessionData.js";
import {CoreDebug} from "../../core/CoreDebug.js";
import {INode, NodeType, SerializeOptions} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "../../core/IStringIndex.js";
import * as Log from "../../Logger.js";
import {Cookie, CookieOptions} from "./Cookie.js";
import {SessionMiddlewareOptions} from "./SessionMiddleware.js";
import {CryptoUtils} from "../../CryptoUtils.js";
import {SecurityZone} from "../../security/SecurityZone.js";



let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export interface UserSessionOptions {
    _uid?: string;
    _acc?: UserAccount;
    _created? :number;
    _destroyed? :number;
    _project?:Record<string, DexcaliburProject>;
    _defaultProject?:DexcaliburProject;
    _data?:Record<string, SessionData>;
    _data_hash?:string;
    _must_set_cookie?:boolean;
    expires?:number;
    cookie?:Cookie;
    savedHash?:string;
    trustProxy?:boolean;
    passport?:any;

    req?:any;
    id?:any;
}


export interface SessionEnvelopeOptions {
    request: any,
    cookie?: CookieOptions,
    trustProxy: boolean
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
    _created: number = -1;

    /**
     * unix timestamp
     */
    _destroyed: number = -1;

    // uid of project associated to the current session
    // TODO : add instance UID instead of project UID
    _project: Record<DexcaliburProjectUUID, DexcaliburProject> = {};
    _defaultProject: DexcaliburProject = null;

    _data:Record<string, SessionData> = {};

    _data_hash:string = null;

    _conn:ConnectionHandlerMap = {};

    _must_set_cookie = false;

    tags:number[] = [];

    expires:number;

    forms:Record<string, any> = {};

    _cookie:Nullable<Cookie> = null;

    // Legacy API for Express
    req: any;

    savedHash:string;
    /**
     * Flag. If true reverse proxy is trusted and
     * can't threat cookie
     * @field
     */
    trustProxy = false;

    /**
     * !! IMPORTANT
     * Mandatory field expected by Passport to store authenticated user
     * @field
     */
    passport:any = {};

    constructor( pConfig:Nullable<UserSessionOptions> = null) {

        if(pConfig !=null){
            for(const i in pConfig){
                this[i] = pConfig[i];
            }
        }

        if(this._created === -1){
            this._created = Date.now();
        }
    }

    get id():string {
        return this._uid;
    }

    set cookie(pCookie:Cookie) {
        this._cookie = pCookie;
        this.resetMaxAge();
    }

    get cookie():Cookie {
        return this._cookie;
    }

    /**
     * To create a new empty user session from incoming request
     *
     * @param {SessionEnvelopeOptions} pOptions
     */
    static fromIncomingRequest(pOptions:SessionEnvelopeOptions):UserSession{

        const sess = new UserSession({
            _uid: pOptions.request.sessionID,
            _acc: (pOptions.request.session!=null)?pOptions.request.session._acc : null,
            _data: (pOptions.request.session!=null)?pOptions.request.session._data : {},
            _created:  Date.now()
        });
        sess.req = pOptions.request;

        sess.trustProxy = pOptions.trustProxy!=null?pOptions.trustProxy:false;

        if(pOptions.cookie!=null){
            sess.updateCookie(pOptions.cookie, (pOptions.trustProxy!=null?pOptions.trustProxy:false));
        }

        return sess;
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

    setUID(pSessid:string):void {
        this._uid = pSessid;
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
    getActiveProjectByUID( pContext:DexcaliburEngine, pProjectUID:string):Nullable<DexcaliburProject> {

        // check if the user is the project owner
        // replace by read access ?
        /*AccessControl.checkAttr(
            AccessZone.PROJECT,
            ProjectAccessControl.attr.OWNER,
            pContext.getProject(pProjectUID),
            this.getUserAccount()
        );*/

        const project = pContext.getProject(pProjectUID);
        if(project==null){
            return null;
        }

        AccessControl.isAuthorized(
            AccessControl.access.PROJ_OPEN_OWN,
            this.getUserAccount(),
            project, // the resource
            [
                ProjectAccessControl.attr.OWNER,
                ProjectAccessControl.attr.TESTER
            ]
        );


        return  project;
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
        //this._data_hash = this.hash();
        //UserSession.TYPE.trigger('save_data', this._data[pName]);
    }

    getData( pName:string = null):any  {
        if(this._destroyed > -1)
            throw new SessionException("Data cannot be read : Session has been destroyed.", SessionCode.DESTROYED);

        if(pName==null){
            return this._data;
        }
        else if(this._data[pName] != null){
            return this._data[pName].getValue();
        }else{
            return null;
        }
    }

    /**
     * To compute a checksum of session data to detect
     * modifying
     *
     * @returns {string}
     * @method
     */
    hash(pOptions:Nullable<SessionMiddlewareOptions>=null):string {
        let o = {};
        for(let k in this._data){
            o[k] = (this._data[k] as SessionData).toJsonObject();
        }

        return CryptoUtils.sha256(JSON.stringify(o),'hex',true);
    }

    toJsonObject(pOtions?:SerializeOptions, pSecurityZone = SecurityZone.PUBLIC):any {
        const o:any = {};
        o._uid = this._uid;
        o._created = this._created;
        o._destroyed = this._destroyed;
        o._project = Object.keys(this._project);
        o._defaultProject = this._defaultProject!=null ? this._defaultProject.getUID() : null;
        o._acc = this._acc.getUID();
        //o._data = this._uid;
        o._conn = Object.keys(this._conn);

        if(pSecurityZone===SecurityZone.PRIVATE){
            o.forms = this.forms;
        }

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



    // Session api

    /**
     * To create cookie options related to this incoming request
     *
     * @param pOptions
     * @param pTrustProxy
     */
    updateCookie(pOptions:CookieOptions, pTrustProxy:boolean){
        this.cookie = new Cookie(pOptions);

        if (pOptions.secure === 'auto') {
            this.cookie.secure = this.isSecure(pTrustProxy);
        }
    }

    // check if session has been saved
    isSaved(pOriginalID:string) {
        return (pOriginalID === this.getUID()) && (this.savedHash === this.hash());
    }


    /**
     * To check is the session has been modified
     * @param sess
     */
    isModified(pOriginalID:string, pOriginalHash:Nullable<string> = null):boolean {
        const originalHash = (pOriginalHash==null)? this.savedHash : pOriginalHash;
        return (pOriginalID !== this.getUID()) || (originalHash !== this.hash());
    }

    // determine if session should be touched
    shouldTouch(pRequest:any, pOriginalID:string, pOriginalHash:string, pOptions:SessionMiddlewareOptions):boolean {
        // cannot set cookie without a session ID
        if (typeof pRequest.sessionID !== 'string') {
            Logger.debug('[SESSION MIDDLEWARE] session ignored because of bogus vReq.sessionID %o', pRequest.sessionID);
            return false;
        }

        return (pOriginalID === pRequest.sessionID) && !this.shouldSave(pRequest,pOriginalID,pOriginalHash,pOptions);
    }

    shouldSave(pRequest:any, pOriginalID:string, pOriginalHash:string, pOptions:SessionMiddlewareOptions ) {
        // cannot set cookie without a session ID
        if (typeof pRequest.sessionID !== 'string') {
            Logger.debug('[SESSION MIDDLEWARE] session ignored because of bogus vReq.sessionID %o', pRequest.sessionID);
            return false;
        }

        return (!pOptions.saveUninitialized && (this.savedHash==null) && (pOriginalID !== pRequest.sessionID))
            ? this.isModified(pOriginalID, pOriginalHash)
            : !this.isSaved(pOriginalID)
    }

    /**
     * To detect
     * @param pTrustProxy
     */
    isSecure(pTrustProxy:boolean):boolean{
        // socket is https server
        if (this.req.connection && this.req.connection.encrypted) {
            return true;
        }

        // don't trust proxy
        if (pTrustProxy === false) {
            return false;
        }

        // no explicit trust; try req.secure from express
        if (pTrustProxy !== true) {
            return (this.req.secure === true)
        }

        // read the proto from x-forwarded-proto (XFP) header
        const header = this.req.headers['x-forwarded-proto'] || '';
        const index = header.indexOf(',');
        const proto = (index !== -1)
            ? header.slice(0, index).toLowerCase().trim()
            : header.toLowerCase().trim()

        return (proto === 'https');
    }

    touch():UserSession {
        return this.resetMaxAge();
    }

    resetMaxAge():UserSession {
        this.cookie.maxAge = this.cookie.originalMaxAge;
        return this;
    }

    /**
     * To store the session
     *
     * @param pCallback
     */
    save(pCallback:any = null):UserSession {
        Logger.debug('[SESSION MIDDLEWARE] saving %s', this.id);
        this.savedHash = this.hash();
        this.req.sessionStore.set(this.getUID(), this, pCallback || function(){});
        return this;
    }

    /**
     * Re-loads the session data _without_ altering
     * the maxAge properties. Invokes the callback `fn(err)`,
     * after which time if no exception has occurred the
     * `req.session` property will be a new `Session` object,
     * although representing the same session.
     *
     * @param {Function} fn
     * @return {Session} for chaining
     * @api public
     */
    reload(pCallback:any) {
        const req = this.req
        const store = this.req.sessionStore

        store.get(this.getUID(), function(err, sess){
            if (err) return pCallback(err);
            if (!sess) return pCallback(new Error('failed to load session'));

            store.createSession(req, sess);
            pCallback();
        });
        return this;
    }

    destroy(pCallback:any) {

        Logger.info("[SESSION][destroy] Destroy user session");
        delete this.req.session;
        this.req.sessionStore.destroy(this.getUID(), pCallback);

        this._destroyed = Date.now();

        return this;
    }

    regenerate(pCallback:any) {
        this.req.sessionStore.regenerate(this.req, pCallback);
        return this;
    }

}

UserSession.TYPE.builder(UserSession);