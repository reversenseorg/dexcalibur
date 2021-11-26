import KeyPoint from "./KeyPoint";
import DexcaliburProject from "../DexcaliburProject";
import {IDatabase, IDbCollection} from "../persist/orm/DbAbstraction";
import DataScope, {DataScopePpts} from "../DataScope";
import {UTIL_CONST} from "../util/UtilConstants";
import {KeyPointManagerException} from "../errors/KeyPointManagerException";
import SqliteDbCollection from "../../connectors/sqlite/SqliteDbCollection";
import {SqliteDb} from "../../connectors/sqlite/SqliteDb";


export interface KeyPointMap {
    [name:string] :KeyPoint
}

enum OS  {
    ANDROID,
    IOS,
    WIN,
    LINUX
}
export default class KeyPointManager {



    static INTERNAL_SUFFIX = "core.";

    /**
     * To hold key points by name
     *
     * It points to a persistent collection where key point configurations are stored,
     * By default, it's project DB
     *
     * @private
     */
    private _db:SqliteDbCollection;


    private _os:number = OS.ANDROID;
    private targetPlatform:any = null;

    /**
     * To hold key points by name
     * @field
     * @type {KeyPointMap}
     * @private
     */
    private _kps:KeyPointMap = {};

    constructor(pConfig:any={}) {
        for(let i in pConfig){
            this[i] = pConfig[i];
        }
    }

    /*
    load(pDB:SqliteDb):KeyPointManager {
        if(pDB == null) throw KeyPointManagerException.INVALID_DB();

        this._db = pDB.newCollection( KeyPoint.TYPE.getName(), KeyPoint.TYPE);

        if(this._db.size() == 0){

        }

        return this;
    }*/

    static newForAndroid(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.ANDROID;
        return (new KeyPointManager(pConfig)).init(pProject.getDB());
    }


    static newForIOS(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.IOS;
        return (new KeyPointManager(pConfig)).init(pProject.getDB());
    }

    static newForLinux(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.LINUX;
        return (new KeyPointManager(pConfig)).init(pProject.getDB());
    }

    static newForWindows(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.WIN;
        return (new KeyPointManager(pConfig)).init(pProject.getDB());
    }

    private _createJavaAppKeyPoint(){
        const kp:KeyPoint = new KeyPoint({
            name: KeyPointManager.INTERNAL_SUFFIX+"java.app",
            description: "At this point, classes.dex file is loaded and every Android API is available.",
            token: "@@__KP::JAVA_APP_LOADED__@@",
            code: `
                Java.perform(()=>{ 
                    @@__CONTENT__@@
                });"
            `
            /*generator: function(vCode:string):string{

                function(vCode){
                    return "Java.perform(()=>{ \n\n"+vCode+"});";
                }
            }*/
        });

        this.addInternalKeyPoint(kp);
    }

    private _createBootReadyKeyPoint(){
        const kp:KeyPoint = new KeyPoint({
            name: KeyPointManager.INTERNAL_SUFFIX+"java.boot",
            description: "At this point, Dalvik packages and classes.dex files are not loaded, only most basic classes are avilable.",
            token: "@@__KP::BOOT_LOADED__@@",
            code: `
                Java.deoptimizeEverything();
                   
                @@__CONTENT__@@
            `
            /*
            generator: function(vCode:string):string{
                return "Java.deoptimizeEverything(); \n\n"+vCode;
            }*/
        });

        this.addInternalKeyPoint(kp);
    }

    /*
    private _createDalvikReadyKeyPoint(){
        const kp:KeyPoint = new KeyPoint({
            name: KeyPointManager.INTERNAL_SUFFIX+"java.dalvik",
            description: "At this point, classes.dex file is loaded and every Android API is available.",
            token: "@@__KP::DALVIK_LOADED__@@",
            generator: function(vCode:string):string{
                return "Java.perform(()=>{ \n\t"+vCode+"});";
            }
        });

        this.addInternalKeyPoint(kp);
    }*/



    /**
     * To init KP manager according to target OS
     */
    init( pDB:IDatabase):KeyPointManager{
        if(pDB == null) throw KeyPointManagerException.INVALID_DB();

        this._db = (pDB as SqliteDb).newCollection( KeyPoint.TYPE.getName(), KeyPoint.TYPE) ;
        this._db.getAll(false, true);

        if(this._db.size() == 0){
            switch (this._os){
                case OS.ANDROID:
                    this._createBootReadyKeyPoint();
                    // this._createDalvikReadyKeyPoint();
                    this._createJavaAppKeyPoint();
                    break;
            }
        }


        return this;
    }

    remove(pKeyPoint:KeyPoint):void {
        this._db.removeEntry(pKeyPoint.getUID());
        pKeyPoint.removed();
    }

    /**
     * To remove all key points
     */
    removeAll():void {
        const e:KeyPoint[] = this._db.getAll(true, true);
        e.map( x => this.remove(x) );
    }

    addInternalKeyPoint( pKeyPoint:KeyPoint ){
        if(pKeyPoint.getName().indexOf(KeyPointManager.INTERNAL_SUFFIX)!=0){
            pKeyPoint.setName(KeyPointManager.INTERNAL_SUFFIX+pKeyPoint.getName())
        }

        this.addKeyPoint(pKeyPoint);
    }

    addKeyPoint(pKeyPoint:KeyPoint ){
        this._db.addEntry(pKeyPoint.getName(), pKeyPoint);
    }

    getKeyPoint(pName:string):KeyPoint {
        return this._db.getEntry(pName);
    }

    getKeyPoints():KeyPoint[] {
        return this._db.getAll(true);
    }

    /**
     * To get a list ok KP without ancestor, and sorted by weight
     * Highest weight is lowest offset
     *
     */
    getTopLevelKeyPoints():KeyPoint[] {
        const kps:KeyPoint[] = [];

        this._db.map( (i:number, kp:KeyPoint)=>{
            if(!kp.hasAncestor()) kps.push(kp);
        });

        kps.sort( (a, b)=>{
            return (b.getWeight() - a.getWeight());
        });

        return kps;
    }

    /**
     * To get the list of key points without children keypoints
     */
    getLeafKeyPoints():KeyPoint[] {
        const kps:KeyPoint[] = [];

        this._db.map( (i:number, kp:KeyPoint)=>{
            if(!kp.hasChildrenKeyPoints()) kps.push(kp);
        });

        return kps;
    }
}