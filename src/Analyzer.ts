// global

import * as _fs_ from 'fs';


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

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AnalyzerState} from "./AnalyzerState.js";

import {INode, IDatabase, IDbIndex, IDbSet, Tag, TagCategory} from "@dexcalibur/dexcalibur-orm";
import {BusSubscriber} from "./Bus.js";
import {Nullable} from "./core/IStringIndex.js";
import {newTagPresets} from "./tags/common/TagPresets.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


var STATS = {
    idxMethod: 0,
    idxClass: 0,
    idxField: 0,
    instrCtr: 0,
    methodCalls: 0,
    fieldCalls: 0
};




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
    createMissingClass(pFqcn:string, pAnalyzerDB:AnalyzerDatabase):ModelClass{

        // create a class instance from the FQCN value
        const missingCls:ModelClass = SmaliParser.class("L"+pFqcn+" ");
        let pkg:ModelPackage|string = null;

        // tag the class instance "missing"
        // a missing definition can help to identify obfuscated application
        missingCls.addTag(this._missingTag);

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
                pkg = new ModelPackage(missingCls.getPackage() as string);
                pAnalyzerDB.packages.setEntry((pkg as ModelPackage).name, pkg);
            }

            missingCls.setPackage(pkg as ModelPackage);
            (pkg as ModelPackage).childAppend(missingCls);
        }

        return missingCls;
    }

    createMissingField(fieldReference:ModelFieldReference, enclosingClass:ModelClass,
                              internalDB:AnalyzerDatabase, modifiers:Modifier=Modifier.PUBLIC):ModelField{

        let missingField:ModelField = fieldReference.toField(enclosingClass);

        missingField.addTag(this._missingTag);

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


    createMissingMethod(methodRef:ModelMethodReference, enclosingClass:ModelClass, internalDB:AnalyzerDatabase, modifiers:Modifier):ModelMethod{
        let missingMeth:ModelMethod = methodRef.toMethod(enclosingClass);

        //console.log(enclosingClass.name,missingMeth);

        missingMeth.addTag(this._missingTag);

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

    type(pAnalyzerDB:AnalyzerDatabase, pClass:string|ModelClass|ModelClassReference):ModelClass{

        if(pClass instanceof ModelClassReference){
            if(pAnalyzerDB.classes.hasEntry(pClass.fqcn)===true)
                return pAnalyzerDB.classes.getEntry(pClass.fqcn);
            else
                return this.createMissingClass(pClass.getName(), pAnalyzerDB);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }
        if(pClass instanceof ModelClass){
            if(pAnalyzerDB.classes.hasEntry(pClass.name)===true)
                return pAnalyzerDB.classes.getEntry(pClass.name);
            else
                return this.createMissingClass(pClass.getName(), pAnalyzerDB);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }
        else{
            if(pAnalyzerDB.classes.hasEntry(pClass)===true)
                return pAnalyzerDB.classes.getEntry(pClass);
            else
                return this.createMissingClass(pClass, pAnalyzerDB);
            // unresolvable class are created as classic Class node but are tagged "MISSING"
        }

        // unresolvable class are created as classic Class node but are tagged "MISSING"
        // return Resolver.createMissingClass(pClass as string , pAnalyzerDB);
    }


    field(pAnalyzerDB:AnalyzerDatabase, pFieldRef:ModelFieldReference):ModelField{

        let field:ModelField = pAnalyzerDB.fields.getEntry(pFieldRef.signature());

        if(field instanceof ModelField){
            return field;
        }

        //  if the field is not indexed, its enclosingClass is explored
        let cls=pAnalyzerDB.classes.getEntry(pFieldRef.fqcn);

        // if enclosingClass not exists, create it
        if(cls == null){
            cls = this.createMissingClass(pFieldRef.fqcn, pAnalyzerDB);
            return this.createMissingField( pFieldRef, cls, pAnalyzerDB);
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

        return this.createMissingField( pFieldRef, cls, pAnalyzerDB);
    }

     method(pDB:AnalyzerDatabase, pMethRef:ModelMethodReference, isStaticCall:boolean):ModelMethod{

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
            cls = this.createMissingClass(pMethRef.fqcn, pDB);


            return this.createMissingMethod(pMethRef, cls, pDB,  access);
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

        return this.createMissingMethod(pMethRef, cls, pDB,  access);
    }
}




export default class Analyzer
{
    private _abstractTag: Nullable<Tag>;
    private _nativeTag: Nullable<Tag>;

    /**
     * @type {SmaliParser}
     * @field
     */
    parser:SmaliParser = null;
    db:AnalyzerDatabase = null;
    tempDB:AnalyzerDatabase = null;
    context:DexcaliburProject = null;
    finder:SearchAPI = null;
    projectionEngines:any = {};
    encoding:BufferEncoding= null;

    tagCache:any;

    state:AnalyzerState = null;

    resolver: ResolverV2;

    a_native:NativeAnalyzer = null;

    _wf:Workflow;




    private _diffTag:any = {
        'discover.internal': []
    }
    private _diffTagDef: Tag = null;



    /**
     *
     * @param {string} pEncoding
     * @param {SearchAPI} pSearchAPI
     * @param {DexcaliburProject} pProject
     * @constructor
     */
    constructor( pEncoding:BufferEncoding, pProject:DexcaliburProject ) {

        // TODO : only for Android
        this.parser = new SmaliParser(pProject); //.setContext(ctx);

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
    createPackage( pName:string, pDb:AnalyzerDatabase):void {
        let p = pName.split('.'),  fresh:ModelPackage=null;
        let pkg:string='', ppkg:string=p[0], ppkgo:ModelPackage=null;

        const sastTag = this.context.getTagManager().getTag("discover.static");
        const internalTag = this.context.getTagManager().getTag("discover.internal");


        for(let i=0; i<p.length; i++){
            ppkg = pkg;
            pkg += (i==0?'':'.')+p[i];

            if(pDb.packages.hasEntry(pkg)==false){

                //console.log(`creating>  ${pkg} (${pkg.length}) parent=${ppkg}`);

                fresh = ModelPackage.fromJavaFQCN(pkg);
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
                    if(internalTag.match(ppkgo) && (this._diffTagDef.getUUID()==sastTag.getUUID())){
                        //this.addForDelayedTagging(ppkg);
                        ppkgo.addTag(sastTag);
                        this.context.trigger({
                            type: "model.package.update",
                            data: {
                                node: ppkgo
                            }
                        });
                    }

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


    async doNativeAnalysis(pScope:DataScope = null, pProfile:any={}, pOptions=null):Promise<void>{
        if(pScope==null)
            this.a_native.scanAllFiles(pProfile);
        else
            await this.a_native.scanFileByScope(pScope, pProfile, pOptions)
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
    mapInstructionFrom(pMethod:ModelMethod, data:AnalyzerDatabase, stats:any){
        let bb:ModelBasicBlock = null, instruct:ModelInstruction = null, obj = null;
        let success:boolean=false, stmt=null, tmp:any=null, t:ModelBasicBlock=null;

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
                            console.log( stmt[j].getTarget());
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

                    instruct.right = this.resolver.method(data, instruct.right, instruct.isStaticCall());


                    //instruct.right._callers.push(method);
                    instruct.right.addCaller(pMethod);

                    tmp = new ModelCall({
                        caller: pMethod,
                        calleed: instruct.right, //obj,
                        instr: instruct});

                    data.call.insert(tmp, false);

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

                    data.call.insert(new ModelCall({
                        caller: pMethod,
                        calleed: instruct.right,
                        instr: instruct
                    }), false);

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
                        src: pMethod,
                        instr: instruct,
                        value: instruct.right._value
                    });

                    if(s.value != 'Stub!'){
                        data.strings.insert(s, false);
                        this.getContext().getBus().send(new BusEvent<ModelStringValue>({
                            type: "model.string.new",
                            data: s
                        }));
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

                        data.call.insert(new ModelCall({
                            caller:pMethod,
                            calleed:obj,
                            instr:instruct}), false);


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
     */
    async buildModel(data:AnalyzerDatabase, absoluteDB:AnalyzerDatabase, pLocation:ModelLocation=null):Promise<void>{

        Logger.raw("\n[*] Start object mapping ...\n------------------------------------------");

        const step:number = data.classes.size(); /*data.classesCtr,*/
        let g=0;
        let overrided:any = [], o:any;
        //let updateLogs = [];


        if(this._abstractTag==null){
            await this._initVisibilityTags();
        }


        this._wf.computeStepUp(data.classes.size()*4);
        /*
        let c = 0;
        for(let i in data.classes)c++;
        console.log(Chalk.bold.red("Classes in DB : "+c));
        */

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
                this.createPackage( pkgName, absoluteDB);
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
                        this.mapInstructionFrom(v.methods[j], absoluteDB, STATS);
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
     */
    file( pFilePath:string, pFilename:string, pForce:boolean=false):void{

        if(!pFilename.endsWith(".smali") && !pForce)
            return;

        // TODO : replace readFile + string.split by stream
        // config
        const streamParser = false;

        // TODO : test UTF8 support
        let src:string =null, rs:number =0, cls:ModelClass=null, o:any=null;
        let self:Analyzer = this;

        // parse file using blocking IO and string split
        if(streamParser){
            o = this.parser.parseStream(pFilePath, this.encoding, function( pClass:ModelClass){
                self.tempDB.classes.addEntry( pClass.name, pClass); // fqcn
                rs++;
            });
        }else{
            src=_fs_.readFileSync(pFilePath).toString(this.encoding);
            cls= this.parser.parse(src);
            self.tempDB.classes.addEntry( cls.name, cls); // cls.fqcn

            this.context.trigger({
                type: "model.class.new",
                data: {
                    node: cls,
                    tmp: true
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
    async path(pPath:string, pLocation:ModelLocation=null):Promise<void>{

        let self:Analyzer = this;

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
        Util.forEachFileOf(pPath,(vPath:string, vFile:string)=>{
            // parse a file and update AST
            self.file( vPath, vFile,false);
            // increment counter of files or classes analyzed
            c++;
            if(c%100==0){
                self._wf.pushDirectStatus( c+' files or classes parsed');
            }
        });

        // compute step for progress
        self._wf.computeStepUp(Math.round(c/100));

        STATS.idxClass = this.db.classes.size();

        Logger.raw("[*] Static code analysis done.\n---------------------------------------")
        Logger.raw("[*] "+tempDb.classes.size()+" files or classes analyzed. ");


        // start object mapping (replace reference by relationship),
        // merge temporary DB with exesiting DB, ...
        if(pLocation!=null)
            await this.buildModel(tempDb, this.db, pLocation);
        else
            await this.buildModel(tempDb, this.db);


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
            pkg = new ModelPackage(pkgn);
            //Logger.debug(pkg.toJsonObject(null).toString());
            this.db.packages.setEntry(pkgn, pkg);
        }
        //console.log(pkgn,pkg, this.db.packages.hasEntry(pkgn));
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
        stats[ModelPackage.TYPE.getName()] = this.tagIf(pCondition, "packages", pTags);
        stats[ModelClass.TYPE.getName()]  =this.tagIf(pCondition, "classes", pTags);
        stats[ModelField.TYPE.getName()]  =this.tagIf(pCondition, "fields", pTags);
        stats[ModelMethod.TYPE.getName()]  =this.tagIf(pCondition, "methods", pTags);
        stats[ModelStringValue.TYPE.getName()]  =this.tagIf(pCondition, "strings", pTags);

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
    tagIf(pConditionFn:((vKey:any,vVal:any)=>boolean), pType:string, pTags:Tag[]):number{
        const l = pTags.length;
        let ctr = 0;
        if(pTags.length==1){
            this.db[pType].map(function(k:any,v:any){
                if(pConditionFn(k,v)){
                    v.addTag(pTags[0]);
                    ctr++;
                }
            });
        }else{
            this.db[pType].map(function(k:any,v:any){
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
    updateDataBlock(){
        let dd:ModelDataBlock[]=null, dbs:string=null;

        this.db.methods.map((k:string,v:ModelMethod)=>{

            dd = v.getDataBlocks();
            for(let j=0; j<dd.length; j++){
                if(dd[j] == null) continue;
                dbs = dd[j].getUID();
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
}

