import {UserAccount} from "../UserAccount";
import {SessionCode, SessionException} from "./SessionException";
import Util from "../../Utils";
import {ConnectionHandler, ConnectionHandlerMap} from "../../remote/ConnectionHandler";
import DexcaliburEngine, {DexcaliburProjectMap} from "../../DexcaliburEngine";
import DexcaliburProject from "../../DexcaliburProject";
import AccessControl from "../acl/AccessControl";
import {AccessZone} from "../acl/Zones";
import {ProjectAccessControl} from "../acl/rbac/ProjectAccessContol";
import {Settings} from "../../Settings";
import {IDexcaliburEngine} from "../../IDexcaliburEngine";

export class UserSession {

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

    _data:any = {};

    _conn:ConnectionHandlerMap = {};

    constructor( pSessUID:string, pAccount: UserAccount) {

        if((pAccount instanceof UserAccount)==false)
            throw new SessionException("Session cannot be created : invalid user account", SessionCode.INVALID_ACCOUNT);

        if(Util.isEmpty(pSessUID, Util.FLAG_CR | Util.FLAG_WS))
            throw new SessionException("Session cannot be created : invalid user account", SessionCode.EMPTY_SESSID);

        this._uid = pSessUID;
        this._acc = pAccount
        this._created = Date.now();
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

        this._data[pName] = pValue;
    }

    getData( pName:string = null):any  {
        if(this._destroyed > -1)
            throw new SessionException("Data cannot be read : Session has been destroyed.", SessionCode.DESTROYED);

        return (pName==null ? this._data : this._data[pName]);
    }
}