// global

import * as _fs_ from 'fs';
import * as _path_ from 'path';

import {SearchAPI} from "./SearchAPI.js";
import BusEvent from "./BusEvent.js";
import DexcaliburProject from "./DexcaliburProject.js";
import AnalyzerDatabase from "./AnalyzerDatabase.js";
import ModelClass from "./ModelClass.js";
import Util from "./Utils.js";
import {ModelClassReference, ModelFieldReference, ModelMethodReference} from "./ModelReference.js";
import ModelField from "./ModelField.js";
import {Modifier} from "./AccessFlags.js";
import ModelMethod from "./ModelMethod.js";
import ModelPackage from "./ModelPackage.js";
import SmaliParser from "./SmaliParser.js";

import * as Log from './Logger.js';
import ModelCall from "./ModelCall.js";
import ModelStringValue from "./ModelStringValue.js";
import {ModelBasicType, ModelObjectType} from "./ModelType.js";
import ModelBasicBlock from "./ModelBasicBlock.js";
import ModelInstruction from "./ModelInstruction.js";
import ModelDataBlock from "./ModelDataBlock.js";
import ModelFile from "./ModelFile.js";
import ModelSyscall from "./ModelSyscall.js";
import NativeAnalyzer from "./NativeAnalyzer.js";
import DataScope from "./DataScope.js";
import {ModelLocation} from "./ModelLocation.js";
import {Workflow} from "./Workflow.js";

import {NodeInternalType, OperatingSystem} from "@dexcalibur/dxc-core-api";
import {AnalyzerState} from "./AnalyzerState.js";

import {
    IDatabase,
    IDbIndex,
    IDbSet,
    INode,
    NodeUtils,
    Tag,
    TagCategory,
    TagUUID,
    ValidationRule
} from "@dexcalibur/dexcalibur-orm";
import {Nullable} from "./core/IStringIndex.js";
import {Smali} from "./parser/SmaliParser.js";
import {IMagicParser, IParser, IParserFeature, IResults} from "./parser/IParser.js";
import {DataFormatManagerException} from "./formats/error/DataFormatManagerException.js";
import ModelResource from "./ModelResource.js";
import {MerlinSearchRequest} from "./search/MerlinSearchRequest.js";
import {DataLocation, DataLocationType} from "./DataLocation.js";
import InMemoryDbIndex from "../connectors/inmemory/InMemoryDbIndex.js";
import ModelBom from "./ModelBom.js";
import {CompositionAnalyzer} from "./analyzer/CompositionAnalyzer.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var STATS = {
    idxMethod: 0,
    idxClass: 0,
    idxField: 0,
    instrCtr: 0,
    methodCalls: 0,
    fieldCalls: 0
};


export enum STATE_PPTS {
    FILES_PROCESSED = 'fp'
}



class ResolverV2
{

    private _ctx:DexcaliburProject;

    private _missingTag:Tag;
    private _abstractTag:Tag;
    private _nativeTag:Tag;



    constructor(pContext:DexcaliburProject) {
        this._ctx = pContext;
        this._missingTag = pContext.getTagManager().getTag("global.missing");
    }

    resolveInheritedField(pFieldRef:ModelFieldReference, pParentClass:ModelClass):ModelField{
        for(let i in pParentClass.fields){
            if(pParentClass.fields[i].name===pFieldRef.name){
                if(this._missingTag.match(pParentClass.fields[i])){
                    return pParentClass.fields[i];
                }

                if((pParentClass.fields[i].modifiers & Modifier.PRIVATE) == Modifier.PRIVATE){
                    pParentClass.fields[i].declaringClass = pParentClass.fields[i].enclosingClass;
                    pParentClass.fields[i].enclosingClass = pParentClass;
                    return pParentClass.fields[i];
                }
            }
        }

        if(pParentClass.extends instanceof ModelClass){
            return this.resolveInheritedField(pFieldRef, pParentClass.extends);
        }else
            return null;
    }



    resolveInheritedMethod(pMethodRef:ModelMethodReference, pParentClass:ModelClass):ModelMethod{
        for(let i in pParentClass.methods){
            if(pParentClass.methods[i].name===pMethodRef.name){
                if(this._missingTag.match(pParentClass.methods[i])){
                    return pParentClass.methods[i];
                }

                if(!(pParentClass.methods[i].modifiers & Modifier.PRIVATE)){
                    pParentClass.methods[i].declaringClass = pParentClass.methods[i].enclosingClass;
                    pParentClass.methods[i].enclosingClass = pParentClass;
                    return pParentClass.methods[i];
                }
            }
        }

        if(pParentClass.extends instanceof ModelClass){
            return this.resolveInheritedMethod(pMethodRef, pParentClass.extends);
        }else
            return null;
    }


    /**
     *
     * @param {String} fqcn FQCN of the missing class
     * @param {AnalyzerDatabase} internalDB an instance of the internal DB
     */
    createMissingClass(pFqcn:string, pAnalyzerDB:AnalyzerDatabase, pAlwaysTag:Tag[] = []):ModelClass{

        // create a class instance from the FQCN value
        const missingCls:ModelClass = SmaliParser.class("L"+pFqcn+" ");
        let pkg:ModelPackage|string = null;

        // tag the class instance "missing"
        // a missing definition can help to identify obfuscated application
        missingCls.addTag(this._missingTag);
        pAlwaysTag.map(x => missingCls.addTag(x));

        // update the internal DB[
        pAnalyzerDB.classes.setEntry(pFqcn, missingCls);
        pAnalyzerDB.missing.insert(missingCls, false);

        this._ctx.trigger({
            type: "model.class.new.missing",
            data: {
                node: missingCls
            }
        });

        // update package
        pkg = missingCls.getPackage();
        if(pkg !== null && (typeof pkg === 'string')){
            pkg = pAnalyzerDB.packages.getEntry(pkg); // TODO ???
            //if(!(pkg instanceof ModelPackage)){
            if(pkg == null){
                pkg = new ModelPackage({
                    name: missingCls.getPackage() as string ,
                    tags: [this._missingTag.getUUID()].concat(pAlwaysTag.map(x =>x.getUUID()))
                });
                pAnalyzerDB.packages.setEntry((pkg as ModelPackage).name, pkg);
            }

            missingCls.setPackage(pkg as ModelPackage);
            (pkg as ModelPackage).childAppend(missingCls);
        }

        return missingCls;
    }

    createMissingField(fieldReference:ModelFieldReference, enclosingClass:ModelClass,
                              internalDB:AnalyzerDatabase,
                       modifiers:Modifier=Modifier.PUBLIC,
                       pAlwaysTag:Tag[] = []):ModelField{

        let missingField:ModelField = fieldReference.toField(enclosingClass);

        missingField.addTag(this._missingTag);
        pAlwaysTag.map(x => missingField.addTag(x));

        //missingField.enclosingClass = enclosingClass;
        missingField.modifiers = modifiers;

        enclosingClass.fields[missingField.signature()] = missingField;


        internalDB.fields.setEntry(missingField.signature(), missingField);
        // TODO : remove from 'missing' index ?
        internalDB.missing.insert(missingField, false);

        this._ctx.trigger({
            type: "model.field.new.missing",
            data: {
                node: missingField
            }
        });
        return missingField;
    }


    createMissingMethod(methodRef:ModelMethodReference,
                        enclosingClass:ModelClass,
                        internalDB:AnalyzerDatabase,
                        modifiers:Modifier,
                        pAlwaysTag:Tag[] = []):ModelMethod{
        let missingMeth:ModelMethod = methodRef.toMethod(enclosingClass);

        missingMeth.addTag(this._missingTag);
        pAlwaysTag.map(x => missingMeth.addTag(x));

        missingMeth.modifiers = modifiers; // new Accessor.AccessFlags(modifiers);

        enclosingClass.methods[missingMeth.signature()] = missingMeth;


        internalDB.methods.setEntry(missingMeth.signature(), missingMeth);
        // TODO : remove from 'missing' index ?
        internalDB.missing.insert(missingMeth, false);


        this._ctx.trigger({
            type: "model.method.new.missing",
            data: {
                node: missingMeth
            }
        });

        return missingMeth;
    }

    type(pAnalyzerDB:AnalyzerDatabase, pClass:string|ModelClass|ModelClassReference, pAlwaysTag:Tag[]=[]):ModelClass{

        if(pClass instanceof ModelClassReference){
            if(pAnalyzerDB.classes.hasEntry(pClass.fqcn)===true)
                return pAnalyzerDB.classes.getEntry(pClass.fqcn);
            else
                return this.createMissingClass(pClass.getName(), pAnalyzerDB, pAlwaysTag);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }
        if(pClass instanceof ModelClass){
            if(pAnalyzerDB.classes.hasEntry(pClass.name)===true)
                return pAnalyzerDB.classes.getEntry(pClass.name);
            else
                return this.createMissingClass(pClass.getName(), pAnalyzerDB, pAlwaysTag);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }
        else{
            if(pAnalyzerDB.classes.hasEntry(pClass)===true)
                return pAnalyzerDB.classes.getEntry(pClass);
            else
                return this.createMissingClass(pClass, pAnalyzerDB, pAlwaysTag);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }

        // unresolvable class are created as classic Class node but are tagged "MISSING"
        // return Resolver.createMissingClass(pClass as string , pAnalyzerDB);
    }


    field(pAnalyzerDB:AnalyzerDatabase, pFieldRef:ModelFieldReference, pAlwaysTag:Tag[]=[]):ModelField{

        let field:ModelField = pAnalyzerDB.fields.getEntry(pFieldRef.signature());

        if(field instanceof ModelField){
            return field;
        }

        //  if the field is not indexed, its enclosingClass is explored
        let cls=pAnalyzerDB.classes.getEntry(pFieldRef.fqcn);

        // if enclosingClass not exists, create it
        if(cls == null){
            cls = this.createMissingClass(pFieldRef.fqcn, pAnalyzerDB, pAlwaysTag);
            return this.createMissingField( pFieldRef, cls, pAnalyzerDB, Modifier.PUBLIC, pAlwaysTag);
            //field = createMissingField(field, cls, db);
        }


        field = cls.fields[pFieldRef.signature()];

        if(field instanceof ModelField){
            return field;
        }


        // 2. else, if the class has super class, search inherit field
        if(cls.extends !== null){
            field = this.resolveInheritedField(pFieldRef, cls.extends);

            if(field instanceof ModelField){
                cls.addInheritedField(pFieldRef, field);
                pAnalyzerDB.fields.setEntry(pFieldRef.getName(), field);

                this._ctx.trigger({
                    type: "model.field.new",
                    data: {
                        node: field
                    }
                });
                return field;
            }
        }

        // Finally if reference is unsolvable, the a mock field is created and tagged "missing"

        return this.createMissingField( pFieldRef, cls, pAnalyzerDB, Modifier.PUBLIC, pAlwaysTag);
    }

     method(pDB:AnalyzerDatabase, pMethRef:ModelMethodReference, isStaticCall:boolean, pAlwaysTag:Tag[] = []):ModelMethod{

        let meth:ModelMethod = pDB.methods.getEntry(pMethRef.signature());

        // 1. search into indexed method
        if(meth instanceof ModelMethod){
            return meth;
        }

        // 2. else, search into inherited method
        let cls:ModelClass = pDB.classes.getEntry(pMethRef.fqcn);
        let access:Modifier = Modifier.PUBLIC;

        if(isStaticCall) access |= Modifier.STATIC;

        // 2.1 If there is no parent class, then the method definition is missing
        if(cls == null){
            cls = this.createMissingClass(pMethRef.fqcn, pDB, pAlwaysTag);


            return this.createMissingMethod(pMethRef, cls, pDB,  access, pAlwaysTag);
        }

        // 2.2 else, search into inherited method
        if(cls instanceof ModelClass){
            if(cls.extends instanceof ModelClass){
                meth = this.resolveInheritedMethod(pMethRef, cls.extends);

                if(meth instanceof ModelMethod){
                    cls.addInheritedMethod(pMethRef, meth);
                    pDB.methods.setEntry(pMethRef.getName(), meth);

                    this._ctx.trigger({
                        type: "model.method.new",
                        data: {
                            node: meth,
                            tmp: true
                        }
                    });

                    return meth;
                }
            }
        }

        // 4. else, mock missing method and class

        return this.createMissingMethod(pMethRef, cls, pDB,  access, pAlwaysTag);
    }
}


/**
 * All-in-on API for all code-related analyzers
 *
 * @class
 */
export default class Analyzer
{
    private _abstractTag: Nullable<Tag>;
    private _nativeTag: Nullable<Tag>;

    /**
     * @type {SmaliParser}
     * @field
     */
    parser:Smali.Parser = null;
    db:AnalyzerDatabase = null;
    tempDB:AnalyzerDatabase = null;
    context:DexcaliburProject = null;
    finder:SearchAPI = null;
    projectionEngines:any = {};
    encoding:BufferEncoding= null;

    tagCache:any;

    state:AnalyzerState = null;

    resolver: ResolverV2;

    private _errors:Record<string, Error[]> = {};


    /**
     * Instance of native analyzer
     */
    a_native:NativeAnalyzer = null;

    _wf:Workflow;




    private _diffTag:any = {
        'discover.internal': []
    }
    private _diffTagDef: Tag = null;


    static isNodeRef(pO:any):boolean {
        /*ValidationRule.structure({
          __: ValidationRule.bool(),
          _uid: ValidationRule.asciiString(ValidationRule.NULLABLE),
          tags:  ; //ValidationRule. (ValidationRule.NULLABLE),
        })*/
        const l = Object.entries(pO).length;
        if(l<1 && l>3) return false;
        if(l>=1 && !ValidationRule.nodeTypeID(false).test(pO.__)) return false;
        if(l>=2 && (pO._uid==null || typeof pO._uid!=="string")) return false;
        if(l==3 && (pO.tags==null || !ValidationRule.asArrayOf([ValidationRule.uint64()]).test(pO.tags))) return false;

        return true;
    }

    /**
     *
     * @param {string} pEncoding
     * @param {SearchAPI} pSearchAPI
     * @param {DexcaliburProject} pProject
     * @constructor
     */
    constructor( pEncoding:BufferEncoding, pProject:DexcaliburProject ) {

        // TODO : only for Android
        /*
        if(pProject.os===OperatingSystem.ANDROID){
            this.parser = DataFormatManager.getInstance().getParserByFormat("smali")[0];
        }else{
            this.parser = null; //DataFormatManager.getInstance().getParserByFormat("smali")[0];
            //this.parser = DataFormatManager.getInstance().getParserByFormat("macho")[0];
        }*/
        //this.parser = new SmaliParser(pProject); //.setContext(ctx);

        // Internal DB
        this.db = new AnalyzerDatabase(pProject);

        // temporary, in memory, database
        this.tempDB = new AnalyzerDatabase(pProject, 'inmemory');

        this.context = pProject;
        this.finder = pProject.find; //pSearchAPI; // pSearchAPI
        this.encoding = pEncoding;
        this.projectionEngines = {};
        // TODO : only for Android
        this.resolver = new ResolverV2(pProject);
        this.tagCache = {
            Discover: {
                Internal: pProject.getTagManager().getTag("discover.internal")
            }
        }


        this._abstractTag = pProject.getTagManager().getTag("obj.access.abstract");
        this._nativeTag = pProject.getTagManager().getTag("obj.access.native");

        this.registerListeners();
    }

    private async _initVisibilityTags():Promise<void> {
        const VISIBILITY = new TagCategory({ name: "obj.access" });
        const OBJ_VIS_TAGS = [
            new Tag({ name:"abstract", label:"abstract", styles:{
                bgColor: "#bdbb56",
                color: "#000"
            } }),
            new Tag({ name:"native", label:"native", styles:{
                bgColor: "#017ed6",
                color: "#d8d8d8"
            }  }),
        ];
        OBJ_VIS_TAGS.map( x => { VISIBILITY.addTag(x); });
        await this.context.getTagManager().importCategory(VISIBILITY);


        this._abstractTag = this.context.getTagManager().getTag("obj.access.abstract");
        this._nativeTag = this.context.getTagManager().getTag("obj.access.native");
    }


    /**
     * To restore the analyzer state
     *
     * @param {AnalyzerState} pState
     */
    restoreState(pState:AnalyzerState):boolean {

        this.state = pState;
        return false;
    }

    /**
     * To search a node by its type and UID value
     *
     * @param pNodeType {NodeInternalType}
     * @param pUID {string}
     * @method
     */
    searchNode( pNodeType:NodeInternalType, pUID:string):INode {
        switch(pNodeType){
            case NodeInternalType.FILE:
                console.log("[SEARCH] Dev : skip file search by ID");
                return null;
                //return this.finder.byID().file(pUID).get(0);
                break;
            case NodeInternalType.METHOD:
                return this.finder.byID().method(pUID).get(0);
                break;
            case NodeInternalType.CLASS:
                return this.finder.byID().class(pUID).get(0);
                break;
            case NodeInternalType.FIELD:
                return this.finder.byID().field(pUID).get(0);
                break;
            case NodeInternalType.PACKAGE:
                return this.finder.byID().package(pUID).get(0);
                break;
            case NodeInternalType.FUNC:
                return this.finder.byID().func(pUID).get(0);
                break;
            default:
                return null;
        }
    }

    setWorkflow(pWf:Workflow):void{
        this._wf = pWf;
        if(this.a_native != null){
            this.a_native.setWorkflow(pWf);
        }

    }

    /**
     * To create a package node into app graph
     *
     * Every parent or intermediate packages will be created if they not exit
     *
     *
     * @param {string} pName Package UID
     * @param {AnalyzerDatabase} pDb The app DB where the package must be created
     * @method
     */
    createPackage( pName:string, pDb:AnalyzerDatabase, pTags:Tag[] = []):void {
        let p = pName.split('.'),  fresh:ModelPackage=null;
        let pkg:string='', ppkg:string=p[0], ppkgo:ModelPackage=null;
        const tags:TagUUID[] = pTags.map(t => t.getUUID());
        const sastTag = this.context.getTagManager().getTag("discover.static");
        const internalTag = this.context.getTagManager().getTag("discover.internal");


        for(let i=0; i<p.length; i++){
            ppkg = pkg;
            pkg += (i==0?'':'.')+p[i];

            if(pDb.packages.hasEntry(pkg)==false){

                fresh = ModelPackage.fromJavaFQCN(pkg);
                fresh.tags = tags;

                pDb.packages.setEntry(pkg,  fresh);
                this.context.trigger({
                    type: "model.package.new",
                    data: {
                        node: fresh
                    }
                });

                if(i>0){
                    (ppkgo = pDb.packages.getEntry( ppkg)).childAppend(fresh);

                    // propagate app tag when app package have android package as parent
                    if(internalTag.match(ppkgo) && (((this._diffTagDef!=null && this._diffTagDef.getUUID()==sastTag.getUUID()))
                        || (pTags.length>0))){
                        //this.addForDelayedTagging(ppkg);
                        (pTags.map(x => ppkgo.addTag(x)));

                        //ppkgo.addTag(sastTag);
                        this.context.trigger({
                            type: "model.package.update",
                            data: {
                                node: ppkgo
                            }
                        });
                    }

                    // TODO : update package in DB
                }



            }
        }
        //pDb.packages.setEntry(pName,  ModelPackage.fromJavaFQCN(pName));
    }

    flushDelayedTagging():void {
        this._diffTag = {};
    }


    initDelayedTagging(pTag:Tag=null, pDefault=false):void{
        this._diffTag[pTag.getUID()] = [];
        if(pDefault)
            this._diffTagDef = pTag;
    }

    addForDelayedTagging(pEl:any=null, pTag:string=null):void{
        if(pTag!==null){
            this._diffTag[pTag].push(pEl);
        }else{
            if(this._diffTag==null){
                throw new Error("[ANALYZE] addForDelayedTagging : there is not default tag set");
            }
            this._diffTag[this._diffTagDef.getUID()].push(pEl);
        }
    }


    execDelayedTagging(pTag:string, pCond:Function=null) {
        if(this._diffTag==undefined){
            throw new Error("[ANALYZE] execDelayedTagging : invalid tag ["+pTag+"]");
        }
        if(pCond==null){
            this._diffTag[pTag].map( pEl => { pEl.addTag(pTag) });
        }else{
            this._diffTag[pTag].map( pEl => {
                if(pCond(pEl))
                    pEl.addTag(pTag) ;
            });

        }
    }

    /**
     * To load and init the analyzer for native files
     *
     * It creates an analyzer for the specified File database, next it restore
     * the state from the previous execution.
     *
     * State holds :
     * - libraries analyzed previously, except if the user ask to forget analysis
     *
     * @param {IDatabase} pFileDB
     * @return {NativeAnalyzer}
     * @method
     * @since 1.0.0
     */
    initNativeAnalyzer():NativeAnalyzer{
        this.a_native = new NativeAnalyzer(
            this.context,
            this.db
        );


        if(this._wf != null){
            this.a_native.setWorkflow(this._wf);
        }

        return this.a_native;
    }

    /**
     * To restore the state of  the native analyzer when the project is re-opened
     *
     * @method
     * @since 1.0.0
     */
    async restoreNativeAnalyzer():Promise<void>{

        // try to restore native anal
        let nativState:AnalyzerState = await this.context.getProjectDB().getAnalyzerState('native');

        // restore the state, and set the object holding the state
        this.a_native.restoreState(nativState);
    }


    getNativeAnalyzer():NativeAnalyzer {
        return this.a_native;
    }


    async doNativeAnalysisAsync(pScope:DataScope = null, pProfile:any={}, pOptions=null):Promise<boolean>{
        let success:boolean;
        if(pScope==null)
            success = await this.a_native.scanAllFilesAsync(pProfile);
        else
            success = await this.a_native.asyncScanFileByScope(pScope, pProfile, pOptions);

        return success;
    }

    /**
     * To analyze each instruction and resolve symbols
     *
     * @param {Method} method The method to analyse
     * @param {Object} data The database to use when resolving
     * @param {Object} stats The statistics counters
     * @function
     */
    mapInstructionFrom(pMethod:ModelMethod, data:AnalyzerDatabase, stats:any, pAlwaysTag:Tag[] = []){
        let bb:ModelBasicBlock = null, instruct:ModelInstruction = null, obj = null;
        let success:boolean=false, stmt=null, tmp:any=null, t:ModelBasicBlock=null, c:ModelCall;

        const defaultTags:TagUUID[] = pAlwaysTag.map(x => x.getUUID());

        // add visibility tags
        if(pMethod.hasModifier(Modifier.ABSTRACT) && (this._abstractTag!=null)){
            pMethod.addTag(this._abstractTag);
        }

        if((pMethod instanceof ModelMethod)===false){
            Logger.error("[!] mapping failed : method provided is not an instance of Method.");
            throw new Error("[ANALYZER] mapping failed : method provided is not an instance of Method.")
        }

        for(let i in pMethod.instr){

            bb = pMethod.instr[i];
            bb._parent = pMethod;
            // get basic blocks

            if(bb.hasCatchStatement()){
                stmt = bb.getCatchStatements();
                for(let j=0; j<stmt.length; j++){
                    if(stmt[j].getException() != null){
                        stmt[j].setException( this.resolver.type(data, stmt[j].getException().name));
                    }
                    stmt[j].setTryStart( pMethod.getTryStartBlock( stmt[j].getTryStart()));
                    stmt[j].setTryEnd( pMethod.getTryEndBlock( stmt[j].getTryEnd()));

                    if((stmt[j].getTarget() instanceof ModelBasicBlock) == false){
                        t = pMethod.getCatchBlock( stmt[j].getTarget());
                        if(t !==null)
                            stmt[j].setTarget(t);
                        else{
                            Logger.error("Target catch block not found");
                            Logger.raw( stmt[j].getTarget());
                        }
                    }
                }
            }

            // iter over each basic block and instruction
            for(let j in bb.stack){
                instruct = bb.stack[j];
                instruct.iline = bb.line;
                instruct._parent = bb;

                stats.instrCtr++;
                // skip instruction with NOP opcode
                if(instruct.isNOP()) continue;

                success = false;

                // processing instructions performing calls
                // invoke-*
                if(instruct.isDoingCall()){

                    if(instruct.right.special){
                        Logger.info("SPEC : "+instruct._raw);
                        continue;
                    }

                    instruct.right = this.resolver.method(data, instruct.right, instruct.isStaticCall(), pAlwaysTag);


                    //instruct.right._callers.push(method);
                    instruct.right.addCaller(pMethod);

                    tmp = new ModelCall({
                        tags: defaultTags
                    });

                    (tmp as ModelCall).setCaller(pMethod);
                    (tmp as ModelCall).setCalled(instruct.right); //obj,
                    (tmp as ModelCall).setInstr(instruct);

                    if(!data.call.hasEntry((tmp as ModelCall).getUID()))
                        data.call.addEntry((tmp as ModelCall).getUID(), tmp);

                    //data.call.insert(tmp, false);

                    stats.methodCalls++;


                    if(pMethod._useMethod[instruct.right.signature()] == undefined){
                        pMethod._useMethod[instruct.right.signature()] = [];
                        pMethod._useMethodCtr++;
                    }


                    //method._useMethod[instruct.right.signature()].push(instruct.right);
                    pMethod._useMethod[instruct.right.signature()].push({
                        bb: i,
                        instr: j
                    });

                    success = true;
                }
                else if(instruct.isCallingField()){

                    if(instruct.right == null){
                        Logger.debug("[SAST] Call : method name is null");
                    }

                    // Never returns NULL
                    // if field not exists, return MissingReference object

                    instruct.right = this.resolver.field(data, instruct.right);

                    /*
                    if(instruct.opcode.type==CONST.INSTR_TYPE.GETTER){
                        console.log(instruct.right);
                    }
                    */

                    //instruct.right = obj;
                    if(instruct.right === undefined || instruct.right._callers === undefined){
                        Logger.debug("[SAST] Call : method cannot be resolved : ", instruct.toString());
                    }

                    if(instruct.isSetter()){
                        instruct.right.addSetter(pMethod);
                    }else{
                        instruct.right.addGetter(pMethod);
                    }

                    instruct.right._callers.push(pMethod);


                    c = new ModelCall({
                        tags: defaultTags
                    });

                    (c as ModelCall).setCaller(pMethod);
                    (c as ModelCall).setCalled(instruct.right); //obj,
                    (c as ModelCall).setInstr(instruct);

                    //data.call.insert(c, false);

                    if(!data.call.hasEntry((c as ModelCall).getUID()))
                        data.call.addEntry((c as ModelCall).getUID(), c);


                    stats.fieldCalls++;

                    if(pMethod._useField[instruct.right.signature()] == undefined){
                        pMethod._useField[instruct.right.signature()] = [];
                        pMethod._useFieldCtr++;
                    }

                    pMethod._useField[instruct.right.signature()].push(instruct.right);


                    success = true;
                }
                else if(instruct.isUsingString()){

                    // add USAGE: NEW/READ/WRITE
                    const s = new ModelStringValue({
                        // src: [pMethod],
                        // instr: instruct,
                        value: instruct.right._value,
                        tags: [].concat(defaultTags)
                    });

                    s.setInstrSource(pMethod, instruct);


                    if(s.getValue() != 'Stub!'){
                        data.strings.insert(s, false);
                        /*this.getContext().getBus().send(new BusEvent<ModelStringValue>({
                            type: "model.string.new",
                            data: s
                        }));*/
                    }

                    success=true;
                }
                // Resolve Type reference
                else if(instruct.isReferencingType()){

                    // Never returns NULL
                    // if type not exists, return MissingReference object
                    if(instruct.right instanceof ModelObjectType){


                        obj = this.resolver.type(data, instruct.right.name);


                        obj._callers.push(pMethod);
                        instruct.right = obj;


                        c = new ModelCall({
                            tags: defaultTags
                        });
                        (c as ModelCall).setCaller(pMethod);
                        (c as ModelCall).setCalled(obj); //obj,
                        (c as ModelCall).setInstr(instruct);
                        //data.call.insert(c, false);
                        if(!data.call.hasEntry((c as ModelCall).getUID()))
                            data.call.addEntry((c as ModelCall).getUID(), c);


                    }
                    success = true;
                }
                else
                    continue;

                if(!success){
                    data.parseErrors.insert(instruct, false);
                }

            }
        }
    }


    /**
     * To create links between nodes in the graph
     * each relation represents references to :
     * - an instance
     * - a type
     * - ...
     * into code by solving references.
     *
     * make map by linking object :
     -> resolve FQCN
     -> resolve method called
     -> create packages
     -> build classes hierarchy
     -> create additional index in the DB
     ->  ...
     -> Optional. Linking element to a parent file or other (file declaring element)
     *
     * @param {AnalyzerDatabase} data The temporary analyzer DB where fresh, not-linked,  nodes are stored
     * @param {AnalyzerDatabase} data The final DB, in memory, containing whole graph DB
     * @param
     */
    async buildModel(data:AnalyzerDatabase, absoluteDB:AnalyzerDatabase, pTags:Tag[], pLocation:ModelLocation=null):Promise<void>{

        Logger.raw("\n[*] Start object mapping ...\n------------------------------------------");

        const step:number = data.classes.size(); /*data.classesCtr,*/
        let g=0;
        let overrided:any = [], o:any;
        //let updateLogs = [];


        if(this._abstractTag==null){
            await this._initVisibilityTags();
        }


        this._wf.computeStepUp(data.classes.size()*4);
        // STEP 1
        // merge Absolute DB and Temp DB
        // if a class has been already analyzed its data will be updated
        //      if a class not exists, it ll be saved
        //      if a class is overidden, it ll be updated
        data.classes.map((k:string, v:ModelClass)=>{



            if(pLocation!=null) v.addLocation(pLocation);

            // add class to the absoluteDb if missing
            if(absoluteDB.classes.hasEntry(k) == false){
                absoluteDB.classes.setEntry(k, v);
                this.context.trigger({
                    type: "model.class.new",
                    data: {
                        node: v
                    }
                });
            }else{
                Logger.debug("[SAST] DB merge > class overrided [ ",k," ]");
                overrided.push(k);
                //absoluteDB.classes.getEntry(k).update(v);
            }


            g++;
            if(g%100==0){
                this._wf.pushDirectStatus('[1/4] merging new classes  :'+g+'/'+step);
            }
        });


        // STEP 2
        // link class with its fields and methods
        // for(let i in data.classes)
        g=0;
        data.classes.map((k:string, v:ModelClass)=>{

            // make sure we manipulate freshly added class
            let cls:ModelClass = absoluteDB.classes.getEntry(k);

            //  is TRUE if classes are already existing in AbsoluteDB and they are defined also into TempDB
            let override:boolean = (overrided.indexOf(k)>-1);

            let ext:any = null, requireRemap:boolean=false;


            // the current class is already defined into AbsoluteDB,
            // so, we check if we need to update superclass of classes already existing into AbsoluteDB before mapping
            if(override){
                // the v.extends is the string not a Class instance
                // we get the reference to the superclass from the freshly added class
                ext = v.getSuperClass() as ModelClass;

                try {
                    // For a given class from TempDB, we check if the reference to the superclass
                    // from the TempDB's class is the same in AbsoluteDB's class.
                    // Else it means the TempDB's class inherit from another class which directly
                    // or indirectly inherit of the superclass f AbsoluteDB's class
                    if(ext != null && cls.hasSuperClass()){
                        if((cls.getSuperClass() instanceof ModelClass)
                            && (ext.getName() != cls.getSuperClass().getName())){

                            cls.updateSuper(this.resolver.type(absoluteDB, ext));
                            requireRemap = true;


                        }

                    }
                }
                catch(ex) {
                    Logger.error(ex);
                }
            }
            // resolve super classes
            else if(cls.hasSuperClass()){

    //            if (!(cls.getSuperClass() instanceof CLASS.Class)){
                if(cls.getSuperClass() instanceof ModelClassReference){
                    cls.extends = this.resolver.type(absoluteDB, cls.getSuperClass() as ModelClass);
                    //cls.updateSuper( Resolver.type(absoluteDB, cls.getSuperClass()));
                }
            }

            // map interfaces
            if(override){
                // here v.extends is the string not a Class instance
                ext = v.getInterfaces();
                if(ext.length != cls.getInterfaces().length){

                    cls.removeAllInterfaces();

                    for(let i=0; i<ext.length; i++){
                        cls.addInterface(this.resolver.type(absoluteDB, ext[i]));
                        requireRemap = true;
                    }

                }
            }
            else if(cls.getInterfaces() != null){
                for(let j in cls.implements){
                    cls.implements[j] = this.resolver.type(absoluteDB, cls.implements[j]);
                }
            }

            // update or create field nodes relations
            if(override){
                Logger.debug("Overriding fields ",k);

                for(let j in v.fields){
                    o=v.fields[j];

                    if(pLocation!=null) o.addLocation(pLocation);

                    o.fqcn = v.getName();
                    // add relation  Field -- parent --> Class
                    o.enclosingClass = v;

                    // if the field already exists, check if both differs then update field
                    if(cls.hasField(o)){
                        // TODO : Not force override
                        cls.updateField(o, true);

                        this.context.trigger({
                            type: "model.field.update",
                            data: {
                                node: o
                            }
                        });

                        // update db if signature differs (if type differs)

                        //absoluteDB.fields.setEntry(o.signature(), o); //hashCode()
                    }
                    // if the field not exists, create it
                    else{
                        o.fqcn = cls.getName();
                        o.enclosingClass = cls;
                        cls.addField(o);
                        // if all its ok, there is not conflict
                        absoluteDB.fields.setEntry(o.signature(), o);

                        this.context.trigger({
                            type: "model.field.new",
                            data: {
                                node: o
                            }
                        });
                    }


                    STATS.idxField++;
                }

                // TODO :  if a field is removed from the new version, tag it has "dynamically removed"

            }else{
                for(let j in cls.fields){
                    o=cls.fields[j];

                    if(pLocation!=null)
                        o.addLocation(pLocation);

                    // broadcast FQCN from Class objects to Field objects
                    o.fqcn = cls.getName();
                    o.enclosingClass = cls;

                    // data.fields[o.hashCode()] = o;
                    absoluteDB.fields.setEntry(o.signature(), o); //hashCode()

                    this.context.trigger({
                        type: "model.field.new",
                        data: {
                            node: o
                        }
                    });

                    STATS.idxField++;
                }
            }


            // update or create methods nodes relations
            if(override){
                Logger.debug("Overriding methods ",k);

                for(let j in v.methods){
                    o=v.methods[j];

                    // adding declaring buffer/file if not into PKG scope
                    if(pLocation!=null){
                        o.addLocation(pLocation);
                    }


                    // add relation  Method -- parent --> Class
                    o.enclosingClass = v;

                    // if the method already exists, check if both differs then update method
                    if(cls.hasMethod(o)){
                        // TODO : Not force override
                        cls.updateMethod(o, true);

                        this.context.trigger({
                            type: "model.method.update",
                            data: {
                                node: o
                            }
                        });

                        // update db if signature differs (if type differs)

                        //absoluteDB.fields.setEntry(o.signature(), o); //hashCode()
                    }
                    // if the field not exists, create it
                    else{
                        o.enclosingClass = cls;
                        cls.addMethod(o);
                        // if all its ok, there is not conflict
                        absoluteDB.methods.setEntry(o.signature(), o);

                        this.context.trigger({
                            type: "model.method.new",
                            data: {
                                node: o
                            }
                        });
                    }

                    STATS.idxMethod++;
                }
            }else{
                for(let j in cls.methods){
                    o=cls.methods[j];

                    if(pLocation!=null){
                        o.addLocation(pLocation);
                    }

                    o.enclosingClass = cls;
                    //data.methods[o.signature()] = o;
                    //absoluteDB.methods[o.signature()] = o;
                    absoluteDB.methods.setEntry(o.signature(), o);

                    this.context.trigger({
                        type: "model.method.new",
                        data: {
                            node: o
                        }
                    });

                    STATS.idxMethod++;
                }
            }

            // update class in DB
            this.context.trigger({
                type: "model.class.update",
                data: {
                    node: cls
                }
            });

            g++;
            if(g%100==0){
                this._wf.pushDirectStatus('[2/4] assembling classes :'+g+'/'+step);
            }
        });

        // STEP 3
        // create packages nodes
        g=0;
        data.classes.map((k:string,v:ModelClass)=>{

            let pkgName:string = v.package as string;
            let scr:any = null;

            // Build Package instance from the package name (string)
            if(absoluteDB.packages.hasEntry(pkgName) == false){
                this.createPackage( pkgName, absoluteDB, pTags);
            }
            // Append the current class to its Package instance
            absoluteDB.packages.getEntry(pkgName).childAppend(v);

            // Replace the package name by the reference to the package instance into the class instance
            v.package = absoluteDB.packages.getEntry(pkgName);

            // discover inherited and override methods (build Class Hierarchy)
            if(v.getSuperClass() != null){
                let n:ModelClass=v, sc:ModelClass=null, supers:ModelClass[]=[];
                while((sc = n.getSuperClass() as ModelClass) !=null){
                    if(sc instanceof ModelClass){
                        scr = absoluteDB.classes.getEntry(sc.getName());
                    }else{
                        scr = absoluteDB.classes.getEntry(sc);
                    }
                    if(scr == null){
                        if(sc instanceof ModelClass){
                            Logger.debug("Class ("+sc.getName()+") not found");
                        }
                        else{
                            Logger.debug("Reference ("+sc+") not found");
                        }
                        break;
                    }
                    supers.push(scr);
                    n = scr;

                    if(scr.getSuperClass ==undefined)
                        break;
                }
                v.setSupersList(supers);
            }


            this.context.trigger({
                type: "model.class.update",
                data: {
                    node: v
                }
            });

            g++;
            if(g%100==0){
                this._wf.pushDirectStatus('[3/4] creating package nodes  :'+g+'/'+step);
            }
        });


        Logger.info("DB size : "+absoluteDB.classes.size());

        let off:number=0, mr:number=0;
        let t:number=0, t1:number=0;


        // STEP 4
        // create xref : search binding and link
        g=0;
        data.classes.map((k:string,v:ModelClass)=>{
            let em, om, ovr;

            if(v instanceof ModelClass){
                // analyze each instructions
                for(let j in v.methods){
                    if(v.methods[j] instanceof ModelMethod){

                        t = (new Date()).getTime();
                        this.mapInstructionFrom(v.methods[j], absoluteDB, STATS, pTags);
                        t1 = (new Date()).getTime();
                        if(t1-t>150)
                            Logger.debug((t1-t)+" : "+v.methods[j].signature());

                        this.context.trigger({
                            type: "model.method.update",
                            data: {
                                node: v.methods[j]
                            }
                        });
                    }
                }

                off++;
                if(off%200==0 || off==step)
                    Logger.info(off+"/"+step+" Classes mapped ("+k+")") ;
            }
            else{
                mr++;
                if(mr%20==0) Logger.debug(mr+" missing classes");
            }

            g++;
            if(g%100==0){
                this._wf.pushDirectStatus('[4/4] creating xref  :'+g+'/'+step);
            }

            //this._wf.pushDirectStatus(new StatusMessage(this._wf.getLastStatus().getProgress(), '[4/4] creating xref :'+(g++)+'/'+step));
        });


        //this._wf.log()


        Logger.raw("[*] "+STATS.idxMethod+" methods indexed");
        Logger.raw("[*] "+STATS.idxField+" fields indexed");
        Logger.raw("[*] "+STATS.instrCtr+" instructions indexed");
        //console.log("[*] "+absoluteDB.strings.length+" strings indexed");
        Logger.raw("[*] "+STATS.methodCalls+" method calls mapped");
        Logger.raw("[*] "+STATS.fieldCalls+" field calls mapped");
        // update place where field are called
        //return data;
    }

    /**
     * To create a new temporary Analyzer Database.
     *
     * This new DB has basically same collections than any other instances of Analyzer DB
     * The purpose of such DB is to perform incremental scan :
     * - 1 / data are scanned, and stored into this new DB instance
     * - 2 / Optionnally, freshly indexed data are processed or backed up
     * - 3 / fresh DB and global DB are merged
     *
     *
     * @return {AnalyzerDatabase} New Analyzer DB inside same project
     * @method
     */
    newTempDb():AnalyzerDatabase{
        /*this.debug = {
            notbinded: ()=>{ return new FinderResult(db.notbinded.getAll()) },
            unmapped: ()=>{ return new FinderResult(db.unmapped.getAll()) }
        };*/
        return new AnalyzerDatabase(this.context);
    }

    /**
     *
     * @param {string} filePath
     * @param {string} filename
     * @param {boolean} force
     * @deprecated
     */
    file( pFilePath:string, pFilename:string, pCtx:any = null):void{

        let fparser:IParser<any> = this.parser;

        const ext = _path_.extname(pFilename);
        let candidateParsers:IParser<any>[] = [];

        if(fparser == null){
            candidateParsers = this.context.getDataFormatMgr().getParserByFileExtension<any>(ext);
            if(candidateParsers.length>0){
                fparser = candidateParsers[0];
            }else{
                throw DataFormatManagerException.NOT_PARSABLE(ext,'app code analyzer',pFilePath);
            }
        }

        //if(!pFilename.endsWith(".smali") && !pForce)
        //    return;

        // TODO : replace readFile + string.split by stream
        // config
        const streamParser = false;

        // TODO : test UTF8 support
        let src:string =null, rs:number =0, cls:ModelClass=null, o:any=null;
        let res:IResults<any>;
        let self:Analyzer = this;

        if(this.context.os===OperatingSystem.ANDROID){
            // parse file using blocking IO and string split
            if(streamParser){
                (fparser as Smali.Parser).parseStream(pFilePath, this.encoding, function( pClass:ModelClass){
                    self.tempDB.classes.addEntry( pClass.name, pClass); // fqcn
                    rs++;
                });
            }else{
                fparser.fromBuffer(_fs_.readFileSync(pFilePath), 0, { encoding: this.encoding }).then((vRes)=>{
                    if(vRes.ok==null){
                        Logger.error(`[ANALYZER][${this.context.os}] file : File ${pFilename} cannot analyzed. Cause : ${vRes.invalid.length>0 ? vRes.invalid[0].msg : '?' }`)
                        return;
                    }


                    this.saveParsedObject(vRes.ok, pCtx);
                });

                /*
                src=_fs_.readFileSync(pFilePath).toString(this.encoding);
                cls= (fparser as Smali.Parser).parse(src); // this.parser.parse(src);
                //cls = this.parser.fromBuffer( src)
                self.tempDB.classes.addEntry( cls.name, cls); // cls.fqcn
                this.context.trigger({
                    type: "model.class.new",
                    data: {
                        node: cls,
                        tmp: true
                    }
                });*/
            }
        }else{
            fparser.fromBuffer(_fs_.readFileSync(pFilePath), 0, { encoding: this.encoding }).then((vRes)=>{
                if(vRes.ok==null){
                    Logger.error(`[ANALYZER][${this.context.os}] file : File ${pFilename} cannot analyzed. Cause : ${vRes.invalid.length>0 ? vRes.invalid[0].msg : '?' }`)
                    return;
                }
                this.saveParsedObject(vRes.ok, pCtx).then(()=>{});
            });

        }
    }


    /**
     *
     * @param {string} filePath
     * @param {string} filename
     * @param {boolean} force
     */
    async fileAsync( pFilePath:string, pFilename:string, vCtx:any = null):Promise<void>{


        if(vCtx!=null){
            if(vCtx.exclude!=null) {
                if (vCtx.exclude.indexOf(pFilePath) > 0) /* skip */ return;
            }
        }

        let fparser:IParser<any> = this.parser;
        let res:IResults<any>;
        let candidateParsers:IParser<any>[] = [];
        let err:Error[] = [];
        let stat = _fs_.lstatSync(pFilePath);

        const ffmt = _path_.extname(pFilename);

        if(vCtx.openOpts!=null && vCtx.openOpts.filterFmt!=null) {
            if (vCtx.openOpts.filterFmt.indexOf(ffmt)==-1) /* skip */ return;
        }

        let file = new ModelFile({
            path:pFilePath,
            name:pFilename,
            size: stat.size,
            location: vCtx.location,
            tags: (vCtx.tagAlways!=null ? (vCtx.tagAlways as Tag[]).map((t:Tag) => t.getUUID()) : [])
        });


        if(vCtx.scope!=null){
            file.setScope(vCtx.scope);
        }

        let input = _fs_.readFileSync(pFilePath);

        if(fparser == null){
            try{

                if(ffmt!=""){
                    candidateParsers = this.context.getDataFormatMgr().getParserByFileExtension<any>(ffmt,{skipEmpty:true});

                    for(let i=0; i<candidateParsers.length; i++){
                        if(candidateParsers[i].FEATURES.indexOf(IParserFeature.MAGIC_CHECK)>-1){
                            if((candidateParsers[i] as IMagicParser<any>).hasSignature(input, 0, {encoding:'binary', raw:true})){
                                fparser = candidateParsers[i];
                                break;
                            }
                        }
                    }
                }else{
                    candidateParsers = await this.context.getDataFormatMgr().getParserBySignature<any>(input, 0, {encoding:'binary', raw:true});
                }

                /*
                candidateParsers = await this.context.getDataFormatMgr().getParserBySignature<any>(input, 0, {encoding:'binary', raw:true});

                if(candidateParsers.length==0 && ffmt!=null){
                    candidateParsers = this.context.getDataFormatMgr().getParserByFileExtension<any>(ffmt,{skipEmpty:true});
                }*/

                /*
                if(ffmt===""){
                    candidateParsers = await this.context.getDataFormatMgr().getParserBySignature<any>(input, 0, {encoding:'binary', raw:true});
                }else{
                    candidateParsers = this.context.getDataFormatMgr().getParserByFileExtension<any>(ffmt);
                }*/

                if(fparser==null){
                    if(candidateParsers.length>0){
                        fparser = candidateParsers[0];
                    }else{
                        console.log("No parser found for file: "+pFilePath);
                        err.push(DataFormatManagerException.NOT_PARSABLE(ffmt,'app code analyzer',pFilePath));

                        // save
                        file.addTag(this.context.getTagManager().getTag("data.type.unknown"));
                        await this.saveParsedObject(file, vCtx, null, null, null, []);
                        return;
                    }
                }

            }catch(e){
                err.push(e);
                return;
            }

        }

        const streamParser = false;

        let rs:number =0;
        let self: Analyzer = this;


        if(streamParser){
            // TODO : deprecated ?
            if(pFilePath.endsWith(".smali")){
                (fparser as Smali.Parser).parseStream(pFilePath, this.encoding, function( pClass:ModelClass){
                    if(vCtx.tagAlways!=null){
                        vCtx.tagAlways.map(t => pClass.addTag(t))
                    }
                    self.tempDB.classes.addEntry( pClass.name, pClass); // fqcn
                    rs++;
                });
            }else{
                // not supported
                err.push(new Error("Stream not parsable : format not supported."));
            }

            if(this.context._createMode && (file.getScope()!=null)){
                file = await this.context.getProjectDB().save(file) as ModelFile;
            }
        }else{
            try{
                if(input.length==0){
                    // save
                    await this.saveParsedObject(file, vCtx, null, null, null, []);
                    return;
                }

                res = await fparser.fromBuffer(input, 0, { encoding: this.encoding, print:false, raw:false, tags:vCtx.tagAlways });
                if(res.ok==null){
                    Logger.error(`[ANALYZER] fileAsync : File ${pFilename} cannot analyzed. Cause : ${res.invalid.length>0 ? res.invalid[0].msg : '?' }`);
                    console.log(res.invalid);
                    err = err.concat(res.invalid);
                    this._errors[pFilePath] = err;

                    // save
                    file.addTag(this.context.getTagManager().getTag("data.type.unknown"));
                    await this.saveParsedObject(file, vCtx, null, null, null, []);

                    return;
                }else{
                    if(res.strings!=null){
                        // import strings
                        this.updateStringsDB(res.strings);
                    }
                    file.type = ffmt;
                }

                const r:ModelResource<any> = (Array.isArray(res.ok) && res.ok[0]!=null ? res.ok[0] : res.ok);
                let f:Nullable<ModelFile> = null;

                if(r!=null
                    && r.__===NodeInternalType.RESOURCE
                    && r.value!=null
                    && r.value.__==NodeInternalType.FILE){
                    f = r.value as ModelFile;
                }else if(res.ok!=null && res.ok.__==NodeInternalType.FILE){
                    f = res.ok;
                }

                if(f!=null){
                    if(file.sections.length==0) file.sections = f.sections;
                    if(file.chunks.length==0) file.chunks = f.chunks;
                    file.type = f.type;
                    f.tags.map(x => {
                        if(file.tags.indexOf(x)==-1) file.tags.push(x);
                    });
                    vCtx.file?.tags.map(x => {
                        if(file.tags.indexOf(x)==-1) file.tags.push(x);
                    });
                    if(r.__===NodeInternalType.RESOURCE) r.value = file;
                }

                if(r!=null && r.__===NodeInternalType.RESOURCE && (file.getScope()!=null)){
                    r.setFileLocation(file); // = NodeUtils.asNodeRef(file);
                    r._uid = file.getRelativePath();
                }
            }catch (e){
                err.push(e);

                file.addTag(this.context.getTagManager().getTag("data.type.unknown"));
                if(file.getScope()!=null){
                    Logger.error(`File "${file.getRelativePath()}" cannot be parsed successfully.`);
                }else{
                    Logger.error(`File "${file.getRelativePath()}" cannot be parsed successfully.`);
                }

            }finally {
                try{
                    if(this.context._createMode) {
                        if (file.getScope() != null) {

                            file = await this.context.getProjectDB().save(file) as ModelFile;
                        }
                    }

                    if(res!=null && res.ok!=null){
                        await this.saveParsedObject(res.ok, vCtx, ffmt, fparser, file, []);
                    }else{
                        Logger.error(`Parsing of "${file.getRelativePath()}" failed => tag a unknown.`);
                        // save
                        file.addTag(this.context.getTagManager().getTag("data.type.unknown"));
                        await this.saveParsedObject(file, vCtx, null, null, null, []);
                    }

                }catch (e){
                    Logger.error(e.stack);
                    err.push(e);
                }
            }
        }

        this._errors[pFilePath] = err;
    }
    /**
     * To save freshly parsed object and publish event to the main bus
     *
     * @param {INode|INode[]} vObj
     * @method
     */
    async saveParsedObject(vObj:INode|INode[],
                           vCtx:any = null, vFormat:any = null,
                           vParser:Nullable<IParser<any>> = null,
                           vFile:Nullable<ModelFile> = null, vAlwaysTags:TagUUID[] = []):Promise<void> {

        if(vObj==null) return;
        if(Array.isArray(vObj)){
            for(let i=0;i<vObj.length; this.saveParsedObject(vObj[i], vCtx, vFormat, vParser, vFile, vAlwaysTags), i++);
            return;
        }

        let updates:string[] = ['tags','location'];
        let prevent = false;
        let evtType:string, node:INode;

        // add tags
        if(vObj.__!=null){
            if(vObj.tags==null){
                vObj.tags = vAlwaysTags;
            }else{
                vAlwaysTags.map(t => {
                    if((vObj as INode).tags.indexOf(t)==-1)
                        (vObj as INode).tags.push(t);
                });
            }
        }

        let isNode = true;
        switch (vObj.__) {
            case NodeInternalType.CLASS:
                this.tempDB.classes.addEntry( (vObj as ModelClass).getUID(), vObj); // cls.fqcn
                node = vObj;
                evtType = "model.class.new";
                break;
            case NodeInternalType.PACKAGE:
                this.tempDB.packages.addEntry((vObj as ModelPackage).getUID(), vObj); // cls.fqcn
                node = vObj;
                evtType = "model.package.new";
                updates = ['name','sname','meta','alias','scope','children','tags'];
                break;
            case NodeInternalType.RESOURCE:
                // if the resource
                if((vObj as ModelResource<any>).hasNodeValue()){
                    // skip if the value is a node ref
                    if(!Analyzer.isNodeRef(vObj.value as any)){
                        await this.saveParsedObject(vObj.value, vCtx, vFormat, vParser, vFile);
                        (vObj as ModelResource<any>).value = NodeUtils.asNodeRef(vObj.value);
                    }
                }
                if((vObj as ModelResource<any>).location==null
                    || ((vObj as ModelResource<any>).location.source as any).file==null){

                    (vObj as ModelResource<any>).location = DataLocation.fromFile(vFile,-1);
                }
                // TODO : save location is needed
                this.tempDB.resources.addEntry( (vObj as ModelResource<any>).getUID(), vObj); // cls.fqcn
                node = vObj;
                evtType = "model.resource.new";
                updates = ["value","ppts","name","location","tags"];
                break;
            case NodeInternalType.FILE:
                if((vObj as ModelFile).getUID()==null){
                    if(vCtx.scope!=null){
                        (vObj as ModelFile).setScope(vCtx.scope);
                    }/*else{
                        (vObj as ModelFile).setScope(this.context.getDataAnalyzer().getScope("PKG"));
                    }*/
                }

                this.tempDB.files.addEntry((vObj as ModelFile).getUID(), vObj); // cls.fqcn

                node = vObj;
                evtType = "model.file.new";
                updates = ["scope","meta","__t","size","chunks","sections","__p","name","location","tags"];
                break
            default:
                //Logger.error(`[ANALYZER] Parsed object ${vObj.__}:${NodeUtils.asNodeRef(vObj)._uid} cannot be post-processed : missing action`);
                if(vObj.__!=null){
                    Logger.error(`[ANALYZER] Parsed object cannot be post-processed : missing action`);
                    console.log(vObj);
                }
                isNode = false;
                return;
        }

        if(vCtx!=null && vCtx.self!=null){
            switch(vCtx.self.__){
                case NodeInternalType.PACKAGE:
                    (vCtx.self as ModelPackage).childAppend(vObj);
                    // update
                    if(this.context._createMode){
                        await this.context.getProjectDB().save(vCtx.self,null, ['name','sname','meta','alias','scope','children','tags']);
                    }
                    break;
            }

        }


        if(isNode && this.context._createMode){
            if(vObj.__===NodeInternalType.FILE){
                if( vObj.getUID()!=null && vObj.getScope()!=null){
                    await this.context.getProjectDB().save(vObj,null,updates);
                }
            }else{
                if(vObj.getUID()==null|| vObj.getUID()==""){
                    vObj = this.context.getProjectDB().generateIncrementalNodeUUID(vObj)
                }
                await this.context.getProjectDB().save(vObj,null,updates);
            }
        }

        if(!prevent){
            this.context.trigger({ type: evtType,
                data: {
                    node: node,
                    tmp: true
                }
            });
        }

        if(node.__===NodeInternalType.FILE){
            this.context.trigger({
                type: "data.file.parsed",
                data: {
                    file: node,
                    parser: vParser,// (parserConstructors[0]).UID,
                    format: vFormat
                }
            });
        }
    }

    /**
     * To read all binary or bytecode files inside a directory, parse the content
     * and create AST.
     *
     * TODO: make it more "multi-platform"
     *
     * Some of preset locations are listed here :
     * ```
     * CodeLocation.APP
     * CodeLocation.PLATFORM
     * CodeLocation.MEM
     * ```
     *
     * @param {string} pPath Path of file or folder to scan
     * @param {ModelLocation} pLocation Type of location of this code at runtime
     * @returns {void}
     * @method
     */
    async path(pPath:string, pLocation:ModelLocation=null, pDataScope:Nullable<DataScope>=null, pAlwaysTag:Tag[] = [], pOptions:any = {}):Promise<void>{

        let self:Analyzer = this;
        let baseCtx:any = {
            self: null,
            scope: null
        };
        if(pDataScope!=null) baseCtx.scope = pDataScope;

        // create a new temporary DB where all data discovered
        // will be stored, in order to offer a separate control of
        // how DBs (two or more graphs) are merged
        let tempDb:AnalyzerDatabase = this.newTempDb();
        this.tempDB = tempDb;

        // trigger event on bus  to call some actions before to
        // start a new analysis
        this.context.trigger({
            type: "analyze.file.before",
            data: {
                path: pPath,
                analyzer: self
            }
        });

        // check if the folder exists
        if(_fs_.existsSync(pPath)===false)
            throw new Error('[ANALYZER] Path not exists');

        // ut.forEachFileOf(path,this.file,".smali");
        //ut.forEachFileOf(path,this.file);
        let c:number = 0;
        await Util.forEachFile(pPath,async (vPath:string, vFile:string, vIsDir:boolean, vCtx:any):Promise<boolean> =>{

            vCtx = await this.context.getAppAnalyzer().getPathContext(vPath, vFile, vIsDir, vCtx);
            vCtx.tagAlways = pAlwaysTag;
            vCtx.createMode = (true===pOptions.createMode);
            vCtx.openOpts =  (pOptions.openOpts!=null ? pOptions.openOpts:{});

            if(pDataScope!=null){
                vCtx.scope = pDataScope;
            }

            if(vIsDir){
                vCtx.location = pLocation;
                return true;
            }
            // parse a file and update AST

            await self.fileAsync( vPath, vFile, vCtx);

            if(this._errors[vPath]!=null){
                let e = `Errors occured while analysis of file '${vPath}'`;
                this._errors[vPath].map(x => e+="\n"+x.message);
            }else{
                // increment counter of files or classes analyzed
                c++;
                if(c%100==0){
                    self._wf.pushDirectStatus( c+' files or classes parsed');
                }
            }

            return true;
        },true,baseCtx);

        // compute step for progress
        self._wf.computeStepUp(Math.round(c/100));

        STATS.idxClass = this.db.classes.size();

        Logger.raw("[*] Static code analysis done.\n---------------------------------------")
        Logger.raw("[*] "+tempDb.classes.size()+" classes analyzed. ");
        Logger.raw("[*] "+tempDb.files.size()+" files analyzed. ");
        Logger.raw("[*] "+tempDb.packages.size()+" packages/bundle analyzed. ");
        Logger.raw("[*] "+tempDb.resources.size()+" resources analyzed. ");

        // analyze executable
        const execFiles = await this.context.getProjectDB().merlinSearch(
            MerlinSearchRequest
                .fromCondition(
                    this.context.merlin,
                    ModelFile.TYPE,
                    "@data.type.executable", { not:false })
        );


        console.log(execFiles.getAsList());



        // start object mapping (replace reference by relationship),
        // merge temporary DB with exesiting DB, ...
        if(pLocation!=null)
            await this.buildModel(tempDb, this.db, pAlwaysTag, pLocation);
        else
            await this.buildModel(tempDb, this.db, pAlwaysTag);


        // save model


        // trigger event on bus  to call some actions AFTER to
        // start a new analysis
        this.context.bus.send(new BusEvent({
            type: "analyze.file.after",
            data: {
                path: pPath,
                analyzer: this,
                db: tempDb
            }
        }));

        this.finder.updateDB(this.db);
    };


    /**
     * Experimental
     *
     * Restore model from ProjectDb instead of code
     */
    restoreModel():void {
        this.getInternalDB().restoreFrom(this.context.getProjectDB());
    }


    /**
     * To get the internal database
     */
    getData():AnalyzerDatabase{
//        Logger.debug("[ERROR::DEV] Deprecated function Analyzer::getData() is called ");
        return this.db;
    }


    /**
     * To get the internal database
     */
    getTempData():AnalyzerDatabase{
//        Logger.debug("[ERROR::DEV] Deprecated function Analyzer::getData() is called ");
        return this.tempDB;
    }


    getContext():DexcaliburProject{
        return this.context;
    }


    /**
     * To get the absolute DB
     * @returns {AnalyzerDatabase} DB instance
     */
    getInternalDB():AnalyzerDatabase{
        return this.db;
    }

    /**
     * To add a class to the model by its FQCN
     *
     * Usefull when classes are allocated or declared at runtime
     * by using reflection technics
     *
     * @param fqcn
     */
    addClassFromFqcn(fqcn:string):ModelClass{
        let pkg:ModelPackage = null;
        let pkgn:string = fqcn.substr(0,fqcn.lastIndexOf('.'));

        if(this.db.packages.hasEntry(pkgn)==true){
            pkg = this.db.packages.getEntry(pkgn);
        }else{
            pkg = new ModelPackage({ name: pkgn });
            this.db.packages.setEntry(pkgn, pkg);
        }

        let cls:ModelClass = new ModelClass({
            fqcn: fqcn,
            name: fqcn, // deprecated
            simpleName: fqcn.substr(fqcn.lastIndexOf('.')+1),
            package: pkg
        });

        Logger.debug('[ANALYZER] Add class from FQCN',cls.getName());
        pkg.childAppend(cls);
        this.db.classes.setEntry(fqcn, cls);

        return cls;
    }


    /**
     * To initialize the list of syscalls to use
     * @param {*} syscalls
     * @function
     */
    useSyscalls( syscalls:ModelSyscall[]):void{
        //this.db.syscalls = {};
        for(let i=0; i<syscalls.length ; i++){

            this.db.syscalls.addEntry(syscalls[i].getUID(),  syscalls[i]);
            /*
            for(let j=0; j<syscalls[i].sysnum.length; j++){
                if(syscalls[i].sysnum[j]>-1){
                    this.db.syscalls.addEntry(syscalls[i].sysnum[j],  syscalls[i]);
                }
            }*/
        }
    }

    /**
     * To analyze the decompiled class of Android.jar
     * @param {String} path Path of the folder containing .smali files
     */
    system(path:string){
        throw new Error('[ANALYZER] system() : Not implemented');

        //ut.forEachFileOf(path,this.file,".smali");
        /*
        Util.forEachFileOf(path,(path,file)=>{
            this.file(path,file,false);
        });

        STATS.idxClass = this.db.classes.size();

        Logger.raw("[*] Smali analyzing done.\n---------------------------------------")
        Logger.raw("[*] "+STATS.idxClass+" classes analyzed. ");

        // start object mapping
        Analyzer.buildModel(this.db);

        this.finder.updateDB(this.db);*/
    }

    /**
     * TODO
     * @param {Class} cls New class to insert into the model
     */
    updateWithClass(cls:ModelClass){

    }


    /**
     * @function
     * @deprected
     */
    _updateWithEachFileOf(filesDB:IDatabase, update_strategy:any){
        //this.db.files
        /*let idxNames:string[] = Object.keys(filesDB.getAll());


        this.db.files.map((k,v)=>{
            for(let j=0; j<filesDB.length; j++){
                update_strategy( this.db, filesDB[j], v);
            }
        });*/
    }

    /**
     * @function
     * @deprecated
     */
    updateFiles(filesDB:IDatabase, override:boolean){
        this._updateWithEachFileOf(
            filesDB,
            // check if the file can be treated
            (db, inFile:ModelFile, dbFile)=>{
                if((inFile.path == dbFile.path)||override){
                    //dbFile.update(inFile);
                }else{
                    db.files.addEntry(inFile.getUID(), inFile); // insert(inFile);
                }
            }
        )
    }

    /**
     * @param category
     * @param inData
     */
    insertIn(category:string, inData:IDbIndex|ModelFile[]){
        if(Array.isArray(inData )){
            for(let i:number=0; i<inData.length; i++){
                this.db[category].insert(inData[i]);
            }
        }else{
            if(this.db[category] == null || this.db[category].size()==0){
                this.db[category] = inData;
            }else{
                inData.map((k:number,v:any)=>{
                    this.db[category].addEntry(v);
                })
            }
            /*
            for(let i in inData){
                this.db[category].addEntry(i, inData[i]);
            }*/
        }
    }


    resolveMethod(ref:ModelMethodReference):ModelMethod{
        let m:ModelMethod = this.resolver.method(this.db, ref, null);
        Logger.debug('[ANALYZER] Resolving method : ',m.getName());
        return m;
    }

    /**
     *
     * @param {(key:any,val:any)=>boolean} pConditionFn The condition the node must satisfy to be tagged
     * @param {Tag[]} pTags The tags to apply
     * @return {Record<string, number>} A map where the name of each type of node is associated to number of tagged elements
     * @method
     */
    tagAllIf(pCondition:((vKey:any,vVal:any)=>boolean), pTags:Tag[]):Record<string, number>{

        const stats:Record<string, number> = {};

        // TODO : optimize
        stats[ModelPackage.TYPE.getName()] = this.tagIf<any>(pCondition, "packages", pTags);
        stats[ModelClass.TYPE.getName()]  =this.tagIf<any>(pCondition, "classes", pTags);
        stats[ModelField.TYPE.getName()]  =this.tagIf<any>(pCondition, "fields", pTags);
        stats[ModelMethod.TYPE.getName()]  =this.tagIf<any>(pCondition, "methods", pTags);
        stats[ModelStringValue.TYPE.getName()]  =this.tagIf<any>(pCondition, "strings", pTags);
        stats[ModelCall.TYPE.getName()]  =this.tagIf<any>(pCondition, "call", pTags);



        return stats;
    }


    /**
     *
     * @param {(key:any,val:any)=>boolean} pConditionFn The condition the node must satisfy to be tagged
     * @param {string} pType The name of collection or type of node where nodes are stored
     * @param {Tag[]} pTags The tags to apply
     * @return {number} The number of element tagged
     * @method
     */
    tagIf<T extends INode>(pConditionFn:((vKey:any,vVal:T)=>boolean), pType:string, pTags:Tag[]):number{
        const l = pTags.length;
        let ctr = 0;
        if(pTags.length==1){
            this.db[pType].map(function(k:any,v:T){
                if(pConditionFn(k,v)){
                    v.addTag(pTags[0]);
                    ctr++;
                }
            });
        }else{
            this.db[pType].map(function(k:any,v:T){
                if(pConditionFn(k,v)){
                    for(let i=0;i<l;i++){
                        v.addTag(pTags[i]);
                    }
                    ctr++;
                }
            });
        }

        return ctr;
    }

    /**
     * To scan for new DataBlock and index them
     */
    updateDataBlock(pTags:Tag[] = []){
        let dd:ModelDataBlock[]=null, dbs:string=null;


        this.db.methods.map((k:string,v:ModelMethod)=>{

            dd = v.getDataBlocks();
            for(let j=0; j<dd.length; j++){
                if(dd[j] == null) continue;
                dbs = dd[j].getUID();


                if(pTags.length>0){
                    pTags.map( vT => dd[j].addTag(vT));
                }


                if(this.db.datablock.hasEntry(dbs) === false)
                    this.db.datablock.addEntry(dbs,dd[j]);
            }
        });
    }


    /**
     * To update file index with entry of the given index
     *
     * Important :  data are not copied. Entries contained
     * into argument are passed by reference.
     *
     * @param {IDbIndex} index The index containing data to insert
     * @method
     * @since 1.0.0
     */
    updateFileIndex(index: IDbSet, pForce:boolean=false) {
        //this.db.files = index;

        index.map( (vOffset:any,vVal:ModelFile)=>{
            this.db.files.addEntry(vVal.getUID() , vVal); //, pForce);
        });
    }


    static SmaliTypes = {
         char :'C',
         long :'J',
         double :'D',
         byte :'B',
         int :'I',
         short :'S',
         boolean :'Z',
         void :'V',
         Object :'L',
        float : 'F'
    }

    createMissingMethod( pSignature: string ) {

        // TODO : change

        const p1 = pSignature.indexOf('(');
        let x = pSignature.substr(0, p1);
        let d = x.lastIndexOf('.');
        const fqcn = x.substr(0, d);
        const name = x.substr(d+1);
        const args = [];
        let ret = new ModelBasicType( 'V'  );

        let b = pSignature.substr(p1+1, pSignature.indexOf(')')-p1-1);
        b.split('>').map( v => {
            const t = v.substr(1);

            if(t.indexOf('[')>0){
                args.push(
                    new ModelBasicType( Analyzer.SmaliTypes[t.substr(0,t.length-2)], true )
                );
            }else{
                args.push(
                    new ModelBasicType( Analyzer.SmaliTypes[t],  )
                );
            }
        })



        let clzz = this.db.classes.getEntry(fqcn);

        if(clzz==null){
            clzz = this.resolver.createMissingClass(fqcn, this.db);
        }

        const ref = new ModelMethodReference({
            fqcn: clzz.getUID(),
            name: name,
            args: args,
            ret: ret
        });

        this.resolver.createMissingMethod( ref, clzz, this.db, Modifier.PUBLIC);
    }

    /**
     *
     */
    getStatistics():any {
        return STATS;
    }

    registerListeners(){

        /*
        [
            "model.package.new",
            "model.class.new",
            "model.field.new",
            "model.method.new"
        ].map((vEvtType:string)=>{
        });


        [
            "model.package.update",
            "model.class.update",
            "model.field.update",
            "model.method.update",
        ].map((vEvtType:string)=>{

        });*/
    }

    /**
     * To check if a file is eligible to a particular kind of action
     *
     * @param pScope
     * @param pFile
     * @param pAction
     */
    isEligibleTo(pScope:DataScope, pFile: ModelFile, pAction:string):boolean {
        const o = pAction.indexOf(':');
        const cat = pAction.substring(0,o);

        switch (cat){
            case 'native':
                return this.a_native.isEligibleTo(pScope, pFile, pAction.substring(o+1, pAction.length));
            default:
                return false;
        }

        return false;
    }

    /**
     *
     * @param modelFile
     */
    hasBeenAnalyzed(pModelFile: ModelFile):boolean {

        if(this.a_native.hasBeenAnalyzed(pModelFile)){
            return true;
        }

        return false;
    }

    /**
     * To update the temporary analyzer DB with a set of strings.
     *
     * @param pStrings
     */
    updateStringsDB(pStrings: ModelStringValue[]):void {
        const all:ModelStringValue[] = this.tempDB.strings.getAsList();
        pStrings.map( vStr => {

            for(let i=0, len=all.length; i<len; i++){
                if(all[i].getUID()=== vStr.getUID()){
                    // update, break loop return
                    all[i].updateSource(vStr);
                    return;
                }
            }
            (this.tempDB.strings as InMemoryDbIndex).insert(vStr, false);

            //cn
            //node = vObj;
            //evtType = "model.class.new";
        });
    }

    /**
     * To extract SBOM
     * @param {*} pOptions
     */
    async performSca(pOptions:any={ duplex:false }):Promise<ModelBom[]>{
        let sboms:ModelBom[] = [];
        let sca = new CompositionAnalyzer({
            ctx: this.context
        });

        if(pOptions.duplex){
            let candidates = await sca.extractChunks();
            console.log(candidates);
        }
        // search packages in DB from ModelPackage FQN

        // search packages in DB from native library names
        // search native libraries in DB from symbols signature
        // search native libraries in DB from symbols signature


        return sboms;
    }


}

