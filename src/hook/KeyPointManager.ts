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

import KeyPoint, {KeyPointOptions, VirtualID} from "./KeyPoint.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {KeyPointManagerException} from "../errors/KeyPointManagerException.js";
import {KeyPointGenerator, KeyPointOptionsOptions} from "./KeyPointGenerator.js";
import {IDatabase, IDbCollection, INode} from "@dexcalibur/dexcalibur-orm";
import {MongodbDbCollection} from "@dexcalibur/dexcalibur-orm-mongodb";
import {OperatingSystem} from "@dexcalibur/dxc-core-api";
import {Nullable} from "../core/IStringIndex.js";
import {NodeInternalType, NodeInternalTypeName}
from "@dexcalibur/dxc-core-api";;

export enum KeyPointCondition {
    ONLOAD="load",
    DLOPEN="dlo",
    DLSYM="dlsym",
    LINK="link",
    AFTER="aft",
    BEFORE="bef",
    READ="read",
    WRITE="write",
    OPEN="open",
    CLOSE="close",
    DEL="del",
    MEM_MAP="mmap",
    DEFINE='def',
    VISIBILITY='vis',
    FIRST_NEW='new_1st',
    ANY_NEW='new_*',
}
export enum DEOPT_TYPE {
    NONE,
    BOOT,
    ALL // override others
}

export interface KeyPointMap {
    [name:string] :KeyPoint
}

export interface KeyPointTarget {
    __:NodeInternalType;
    uid:string;
}

export interface KeyPointCreateOptions {
    condition?:string,
    weight?:number,
    name?:string,
    token?:string,
    parent?:any,
    code?:string
}

/**
 * @class
 */
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
    private _os:OperatingSystem = OperatingSystem.ANDROID;
    private targetPlatform:any = null;


    private generator:KeyPointGenerator = null;

    private defaultLoadKP: Nullable<KeyPoint> = null;
    private defaultUnloadKP: Nullable<KeyPoint> = null;

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
        pConfig._os = OperatingSystem.ANDROID;
        return (new KeyPointManager(pConfig)).setProject(pProject).init();
    }


    static newForIOS(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OperatingSystem.IOS;
        return (new KeyPointManager(pConfig)).setProject(pProject).init();
    }

    static newForLinux(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OperatingSystem.LINUX;
        return (new KeyPointManager(pConfig)).setProject(pProject).init();
    }

    static newForWindows(pProject:DexcaliburProject, pConfig:any={}){
        pConfig._os = OperatingSystem.WINNT;
        return (new KeyPointManager(pConfig)).setProject(pProject).init();
    }

    setProject(pProject:DexcaliburProject):KeyPointManager {
        this._project = pProject;
        return this;
    }

    getProject():DexcaliburProject {
        return this._project;
    }

    generateToken(pKeyPoint:KeyPoint, pOptions:Nullable<KeyPointOptions> = null):string{
        return this.generator.generateToken(null, pKeyPoint, pOptions.condition ?? pKeyPoint.condition);
    }

    private async _nextVID():Promise<VirtualID>{
        const s = (await this.getKeyPoints()).sort( (a, b)=>{
            return (b.getVirtualID() - a.getVirtualID());
        });

        return s[0].getVirtualID()+1;
    }

    private async _createBinLoadKeyPoint():Promise<void>{
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

        await this.addInternalKeyPoint(kp);
    }

    /**
     */
    private async _createJavaAppKeyPoint(pName:string):Promise<void>{
        const kp:KeyPoint = new KeyPoint({
            name: pName,
            description: "At this point, classes.dex file is loaded and every Android API is available.",
            token: "@@__KP::JAVA_APP_LOADED__@@",
            code: `
Java.perform(()=>{ 
    /*@@__CONTENT__@@*/
});
            `,
            generatorCode: null
            /*generator: function(vCode:string):string{

                function(vCode){
                    return "Java.perform(()=>{ \n\n"+vCode+"});";
                }
            }*/
        });

        await this.addInternalKeyPoint(kp);
    }

    /**
     *
     */
    private async _createBootReadyKeyPoint(pName:string):Promise<void>{
        const kp:KeyPoint = new KeyPoint({
            name: pName,
            description: "At this point, Dalvik packages and classes.dex files are not loaded, only most basic classes are avilable.",
            token: "@@__KP::BOOT_LOADED__@@",
            code: `
Java.deoptimizeEverything();
   
/*@@__CONTENT__@@*/
            `,
            generatorCode: null
            /*
            generator: function(vCode:string):string{
                return "Java.deoptimizeEverything(); \n\n"+vCode;
            }*/
        });

        await this.addInternalKeyPoint(kp);
    }

    /**
     * To get all external/shared libs/code required
     *
     * @return {string[]}
     * @method
     */
    async getGlobalRequirements():Promise<string[]> {
        const reqs:string[] = [];
        const all = await this.getKeyPoints();

        all.map( (kp:KeyPoint) => {
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
    async needDeoptimize():Promise<DEOPT_TYPE> {
        let mode:DEOPT_TYPE = DEOPT_TYPE.NONE;
        let kp:KeyPoint = await this.getKeyPointByAttr({name:'core.java.boot.before'});
        if(kp != null && kp.hasNodes()){
            return DEOPT_TYPE.BOOT;
        }

        kp = await this.getKeyPointByAttr({name:'core.java.boot'});
        if(kp != null && kp.hasNodes()){
            return DEOPT_TYPE.ALL;
        }
    }

    /**
     * To check if some instruction-level are deployed
     *
     * In such case, more action can be done and hooks are more accurate,
     * but application can become instable
     *
     * @return {boolean}
     * @method
     */
    public hasActiveInstructionHook():boolean {
        return this._project.getHookManager().hasActiveInstructionHook();
    }

    /**
     * To generate the template of a key point's code
     *
     * @param pKP
     * @param pModel
     */
    public async generate( pKP:KeyPoint, pOptions:Nullable<KeyPointOptions> = null):Promise<KeyPoint>{
        const up = [];
        if(pKP.getVirtualID()==null){
            pKP.setVirtualID(await this._nextVID());
            up.push("vid");
        }

        const kp = await this.generator.generate(pKP, pOptions);
        await this.update(kp);
        return kp;
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
    async init():Promise<KeyPointManager>{

        this._db = this._project.getProjectDB().getCollectionOf(KeyPoint.TYPE.getType());

        const all = await this._db.getAsList();
        if(all.length == 0){
            switch (this._os){
                case OperatingSystem.ANDROID:
                    await this._createBootReadyKeyPoint(KeyPointManager.INTERNAL_SUFFIX+"java.boot");
                    await this._createJavaAppKeyPoint(KeyPointManager.INTERNAL_SUFFIX+"java.app");

                    // add Tags
                    this.defaultLoadKP = this._kps[KeyPointManager.INTERNAL_SUFFIX+"java.app"];
                    this.defaultUnloadKP = null;
                    break;
            }
        }


        return this;
    }

    getDefaulLoadKP():Nullable<KeyPoint> {
        return this.defaultLoadKP;
    }

    getDefaulUnloadKP():Nullable<KeyPoint> {
        return this.defaultUnloadKP;
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
     * @return {number} Count of key points removed
     * @method
     */
    async removeByToken(pToken:string):Promise<number> {

        const removed = await this.removeFilter((vKP:KeyPoint)=> {
            return (vKP.getToken()===pToken);
        });

        return removed.length;
    }

    /**
     * To save a key point in db (insert or update)
     *
     * @param pKeyPoint
     */
    async update(pKeyPoint:KeyPoint, pFields:string[] = []):Promise<KeyPoint> {
        const o:any = {upsert:true};
        if(pFields.length>0) o.set = pFields;
        await this._db.asyncUpdateEntry(pKeyPoint, o);
        pKeyPoint.updated();
        return pKeyPoint;
    }

    /**
     *
     *
     * @param pCondition
     * @return {Promise<KeyPoint[]> } Removed keypoints
     * @method
     */
    async removeFilter( pCondition:((vKP:KeyPoint)=>boolean)):Promise<KeyPoint[]> {

        const removed:KeyPoint[] = [];
        const e:KeyPoint[] = await this._db.getAsList();

        for(let i=0; i<e.length; i++){
            if(pCondition.apply(null,[e[i]])){
                await this.remove(e[i]);
                removed.push(e[i]);
            }
        }

        return removed;
    }

    /**
     * To remove all key points
     *
     * @method
     */
    async removeAll():Promise<number> {
        const removed = await this.removeFilter((vKP:KeyPoint)=>true);
        return removed.length;
    }

    /**
     *
     * @param pKeyPoint
     */
    async addInternalKeyPoint( pKeyPoint:KeyPoint ):Promise<void>{
        if(pKeyPoint.getName().indexOf(KeyPointManager.INTERNAL_SUFFIX)!=0){
            pKeyPoint.setName(KeyPointManager.INTERNAL_SUFFIX+pKeyPoint.getName())
        }

        await this.addKeyPoint(pKeyPoint);
    }

    async addKeyPoint(pKeyPoint:KeyPoint ):Promise<void>{
        await (this._db as MongodbDbCollection).asyncAddEntry(pKeyPoint.getName(), pKeyPoint);
    }

    /**
     * To get a key point from DB
     * @param pName
     */
    async getKeyPoint(pName:string):Promise<KeyPoint> {
        const kps = await (this._project.getProjectDB().search({ name:pName },KeyPoint.TYPE.getType()));
        return kps.length>0 ? kps[0] : null;// (this._db as MongodbDbCollection).asyncGetEntry(pName);
    }

    /**
     * To get a key point from DB
     * @param pName
     */
    async getKeyPointByAttr(pAttr:any):Promise<KeyPoint> {
        return await (this._db as MongodbDbCollection).asyncGetEntry(pAttr);
    }
    /**
     * To get all key points
     *
     *
     * @return {KeyPoint[]} List of KPs
     * @method
     */
    async getKeyPoints():Promise<KeyPoint[]> {
        return await (this._db as MongodbDbCollection).getAsList();
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
    async getTopLevelKeyPoints():Promise<KeyPoint[]> {
        const kps:KeyPoint[] = [];

        const all:KeyPoint[] = await (this._db as MongodbDbCollection).getAsList();
        // gather KP node without ancestor
        all.map( (kp:KeyPoint)=>{
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
    async getLeafKeyPoints():Promise<KeyPoint[]> {
        const kps:KeyPoint[] = [];

        const all:KeyPoint[] = await (this._db as MongodbDbCollection).getAsList();

        all.map( (kp:KeyPoint)=>{
            if(!kp.hasChildrenKeyPoints()) kps.push(kp);
        });

        return kps;
    }

    /**
     * To create a new key point
     *
     * @param pKpTarget
     * @param pKpCreateOptions
     */
    async createKeyPoint(pKpTarget:INode, pKpCreateOptions:KeyPointOptions):Promise<KeyPoint> {

        let kp:KeyPoint = new KeyPoint();
        //let node:INode[];
        //const opts:KeyPointOptions = new KeyPointOptions(pKpCreateOptions);

        try{
            // search node
            // node = this._project.getAnalyzer().searchNode( pKpTarget.__, pKpTarget.uid);

            //node = await this._project.getProjectDB().search({ _uid: pKpTarget.getUID() }, pKpTarget);

            if(pKpTarget == null){
                throw KeyPointManagerException.INVALID_TARGET_NODE(pKpTarget);
            } else{
                kp.addNode(pKpTarget); //node[0] as INode);
            }

            if(pKpCreateOptions.hasOwnProperty('condition'))
                kp.setCondition(pKpCreateOptions.condition);

            if(pKpCreateOptions.hasOwnProperty('name')){
                kp.setName(pKpCreateOptions.name);
            }else{
                // x.name = "core."+x.condition+(x.node.lengt>0 ? "."+x.node[0].uid : "");
                kp.setName("user."+NodeInternalTypeName[pKpTarget.__]+"."+pKpCreateOptions.condition+"."+pKpTarget.getUID());
            }

            if(pKpCreateOptions.hasOwnProperty('token')) kp.setToken(pKpCreateOptions.token);
            if(pKpCreateOptions.hasOwnProperty('descr')) kp.setDescription(pKpCreateOptions.description);
            if(pKpCreateOptions.hasOwnProperty('weight')) kp.setWeight(pKpCreateOptions.weight );
            if(pKpCreateOptions.hasOwnProperty('type')) kp.setKeypointType(pKpCreateOptions.type);

            if(kp.getToken()==null){
                kp.setToken( this.generateToken( kp, pKpCreateOptions));
            }

            kp = await this.update(kp);

        }catch(err){

        }

        return kp;
    }
}