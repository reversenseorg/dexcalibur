import ModelUiEventType from "./models/ModelUiEventType.js";
import ModelUiRole from "./models/ModelUiRole.js";
import {GuiAnalyzerException} from "./errors/GuiAnalyzerException.js";
import ModelUiComponentType from "./models/ModelUiComponentType.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {IDbCollection} from "@dexcalibur/dexcalibur-orm";
import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {ProjectDatabase} from "../database/ProjectDatabase.js";

export class GuiTypesManager {


    private _ctx:DexcaliburProject;

    evtTypes: IDbCollection; //Record<string, ModelUiEventType> = {};
    cmpTypes: IDbCollection; //Record<string, ModelUiEventType> = {};
    roles: IDbCollection; //Record<string, ModelUiRole> = {};

    constructor(pProject:DexcaliburProject) {
        this._ctx = pProject;

        // init refs to collections
        this.setProjectDB(this._ctx.getProjectDB());
    }

    /**
     * To change the project database used as backend
     *
     * @param {ProjectDatabase} pDB Project database where GUI types and instances are stored
     * @method
     */
    setProjectDB(pDB:ProjectDatabase):void {
        this.evtTypes = pDB.getCollectionOf(NodeInternalType.UI_EVT_TYPE);
        this.cmpTypes = pDB.getCollectionOf(NodeInternalType.UI_CMP_TYPE);
        this.roles = pDB.getCollectionOf(NodeInternalType.UI_ROLE);
    }

    /**
     * To add a new event type
     * @param pType
     */
    async addEventType(pType:ModelUiEventType):Promise<void> {
        if(await this.evtTypes.getEntry(pType.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_EVT_TYPE(pType.getUID());
        }

        await this.evtTypes.asyncAddEntry(pType);
    }

    /**
     * To add a new component type
     * @param pType
     */
    async addCmpType(pType:ModelUiComponentType):Promise<void> {
        if(await this.cmpTypes.getEntry(pType.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_CMP_TYPE(pType.getUID());
        }

        await this.cmpTypes.asyncAddEntry(pType);
    }

    /**
     * To add a new role
     * @param pRole
     */
    async addRole(pRole:ModelUiRole):Promise<void> {
        if(await this.roles.getEntry(pRole.getUID())!=null){
            throw GuiAnalyzerException.EXISTING_ROLE(pRole.getUID());
        }

        await this.roles.asyncAddEntry(pRole);
    }
}