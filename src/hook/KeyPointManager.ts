import KeyPoint from "./KeyPoint.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import SqliteDbCollection from "../../connectors/sqlite/SqliteDbCollection.js";
import {SqliteDb} from "../../connectors/sqlite/SqliteDb.js";
import {KeyPointGenerator, KeyPointOptions} from "./KeyPointGenerator.js";
import {IDatabase, IDbCollection} from "@dexcalibur/dexcalibur-orm";

export enum DEOPT_TYPE {
    NONE,
    BOOT,
    ALL // override others
}

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
    private _db:IDbCollection;

    private _project:DexcaliburProject = null;
    private _os:number = OS.ANDROID;
    private targetPlatform:any = null;


    private generator:KeyPointGenerator = null;

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
        this.generator = new KeyPointGenerator(this);
    }

    static newForAndroid(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.ANDROID;
        return (new KeyPointManager(pConfig)).setProject(pProject).init(pProject.getDB());
    }


    static newForIOS(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.IOS;
        return (new KeyPointManager(pConfig)).setProject(pProject).init(pProject.getDB());
    }

    static newForLinux(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.LINUX;
        return (new KeyPointManager(pConfig)).setProject(pProject).init(pProject.getDB());
    }

    static newForWindows(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OS.WIN;
        return (new KeyPointManager(pConfig)).setProject(pProject).init(pProject.getDB());
    }

    setProject(pProject:DexcaliburProject):KeyPointManager {
        this._project = pProject;
        return this;
    }

    getProject():DexcaliburProject {
        return this._project;
    }

    generateToken(pKeyPoint:KeyPoint, pOptions:KeyPointOptions):string{
        return this.generator.generateToken(null, pKeyPoint, pOptions.getConditionName());
    }

    private _createBinLoadKeyPoint(){
        const kp:KeyPoint = new KeyPoint({
            name: KeyPointManager.INTERNAL_SUFFIX+"bin.load",
            description: "At this point, classes.dex file is loaded and every Android API is available.",
            token: "@@__KP::LIB_LOAD__@@",
            code: `
                Java.perform(()=>{ 
                    /*@@__CONTENT__@@*/
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

    private _createJavaAppKeyPoint(){
        const kp:KeyPoint = new KeyPoint({
            name: KeyPointManager.INTERNAL_SUFFIX+"java.app",
            description: "At this point, classes.dex file is loaded and every Android API is available.",
            token: "@@__KP::JAVA_APP_LOADED__@@",
            code: `
Java.perform(()=>{ 
    /*@@__CONTENT__@@*/
});
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
   
/*@@__CONTENT__@@*/
            `
            /*
            generator: function(vCode:string):string{
                return "Java.deoptimizeEverything(); \n\n"+vCode;
            }*/
        });

        this.addInternalKeyPoint(kp);
    }

    /**
     * To get all external/shared libs/code required
     *
     * @return {string[]}
     * @method
     */
    public getGlobalRequirements():string[] {
        const reqs:string[] = [];
        this.getKeyPoints().map( (kp:KeyPoint) => {
            if(kp.hasDependencies()){
                kp.getDependencies().map( d => {
                    if(reqs.indexOf(d) == -1){
                        reqs.push(d);
                    }
                });
            }
        });
        return reqs;
    }


    /**
     * To detect if deoptimize is required
     */
    public needDeoptimize():DEOPT_TYPE {
        let mode:DEOPT_TYPE = DEOPT_TYPE.NONE;
        let kp:KeyPoint = this.getKeyPoint('core.java.boot.before');
        if(kp != null && kp.hasNodes()){
            return DEOPT_TYPE.BOOT;
        }

        kp = this.getKeyPoint('core.java.boot');
        if(kp != null && kp.hasNodes()){
            return DEOPT_TYPE.ALL;
        }
    }

    public hasActiveInstructionHook():boolean {
        return this._project.getHookManager().hasActiveInstructionHook();
    }

    /**
     * To generate the template of a key point's code
     *
     * @param pKP
     * @param pModel
     */
    public generate( pKP:KeyPoint, pOptions:KeyPointOptions):KeyPoint{
        return this.generator.generate(pKP, pOptions);
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

        this._db = (pDB as SqliteDb).getCollection( KeyPoint.TYPE.getName(), KeyPoint.TYPE) ;
        (this._db as SqliteDbCollection).getAll(false, true);


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
     * To remove one or more keypoint by token name instead of UID
     *
     * Can be used as alternative to remove an existing key point because
     * token are unique.
     *
     * @param pToken {string} KeyPoint replacement token
     * @method
     */
    removeByToken(pToken:string):boolean {
        const e:KeyPoint[] = (this._db as SqliteDbCollection).getAll(true, true);
        let rem = 0;
        e.map( (vKP:KeyPoint) => {
            if(vKP.getToken()===pToken){
                this.remove(vKP);
                rem++;
            }
        } )

        return (rem > 0);
    }

    update(pKeyPoint:KeyPoint):void {
        this._db.updateEntry(pKeyPoint);
        pKeyPoint.updated();
    }

    /**
     * To remove all key points
     */
    removeAll():void {
        const e:KeyPoint[] = (this._db as SqliteDbCollection).getAll(true, true);
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

    /**
     * To get all key points
     *
     *
     * @return {KeyPoint[]} List of KPs
     * @method
     */
    getKeyPoints():KeyPoint[] {
        return this._db.getAll(true);
    }

    /**
     * To get a list ok KP without ancestor, and sorted by weight
     * Highest weight is lowest offset
     *
     *     (+)   (+)  (+)    <==== SELECTED KP
     *    /  \         |
     *   +   +         +
     *   |   |        / \
     *   +   +       +  +
     *
     *
     * @return {KeyPoint[]} List of top level KP
     * @method
     */
    getTopLevelKeyPoints():KeyPoint[] {
        const kps:KeyPoint[] = [];

        // gather KP node without ancestor
        this._db.map( (i:number, kp:KeyPoint)=>{
            if(!kp.hasAncestor()) kps.push(kp);
        });

        // sort the list by node weight
        kps.sort( (a, b)=>{
            return (b.getWeight() - a.getWeight());
        });

        return kps;
    }

    /**
     * To get the list of key points without children keypoints
     *
     * @return {KeyPoint[]} List of terminal KP
     * @method
     */
    getLeafKeyPoints():KeyPoint[] {
        const kps:KeyPoint[] = [];

        this._db.map( (i:number, kp:KeyPoint)=>{
            if(!kp.hasChildrenKeyPoints()) kps.push(kp);
        });

        return kps;
    }
}