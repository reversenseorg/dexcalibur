import * as _fs_ from 'fs';
import * as _xml2js_ from 'xml2js';
import * as _util_ from 'util';

import {Nullable} from "../core/IStringIndex.js";
import DexcaliburProject from "../DexcaliburProject.js";
import {AndroidManifest} from "./AndroidManifest.js";
import {IntentFilter} from "./IntentFilter.js";
import AndroidComponent from "./AndroidComponent.js";
import AndroidActivity from "./AndroidActivity.js";
import AndroidReceiver from "./AndroidReceiver.js";
import AndroidProvider from "./AndroidProvider.js";
import AndroidService from "./AndroidService.js";
import Analyzer from "../Analyzer.js";
import * as Log from '../Logger.js';
import {AnalyzerState} from "../AnalyzerState.js";
import {IAppAnalyzer} from "../analyzer/IAppAnalyzer.js";
import * as _path_ from "path";
import ModelMethod from "../ModelMethod.js";
import ModelClass from "../ModelClass.js";

import {NodeInternalType} from "@dexcalibur/dxc-core-api";
import {AndroidApiClassXrefList, AndroidCodeAnalyzer} from "./analyzer/AndroidCodeAnalyzer.js";
import BusEvent, {BusEventOptions} from "../BusEvent.js";
import {BusSubscriber} from "../Bus.js";
import ApkHelper from "../ApkHelper.js";
import {AndroidResource, AndroidResourceType} from "./AndroidResource.js";
import {AndroidPackageAnalyzer} from "./analyzer/AndroidPackageAnalyzer.js";
import {DataParserException} from "../errors/DataParserException.js";
import ModelResource from "../ModelResource.js";
import {AnalyzerException} from "../errors/AnalyzerException.js";
import {AppIcon} from "../AppIcon.js";
import ModelFile from "../ModelFile.js";
import {DataLocationFileSource} from "../DataLocation.js";
import {INode} from "@dexcalibur/dexcalibur-orm";
import ModelStringValue from "../ModelStringValue.js";
import DataScope from "../DataScope.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;



_xml2js_.Parser.prototype.parseStringPromise = _util_.promisify(_xml2js_.parseString);

/*
export interface ResourcesMap {
	ids: AndroidResourceType,
	string: AndroidResourceType,
	styles: AndroidResourceType,
	raw: AndroidResourceType,
	xml: AndroidResourceType,
	[name:string]: AndroidResourceType
}*/

export type ResourcesMap = Record<string, AndroidResource>;

export interface AndroidResParsedEvent {
	restype:string;
	res: ModelResource[]; //AndroidResource[];
	name?:string;
	total?:number;
}

export default class AndroidAppAnalyzer implements IAppAnalyzer
{
	context:DexcaliburProject = null;
	manifest:AndroidManifest = null;
	manifestPath:string = null;
	manifestCode:string = null;

	resources:Record<string, ResourcesMap> = {};

	layouts:ResourcesMap;

	state:AnalyzerState = new AnalyzerState({ _uid:'android-app'});

	/**
	 * Configuration for this analyzer and its nested analyzers
	 *
	 * @private
	 */
	private _cfg:any  = {};

	private _pkgAnalyzer:Nullable<AndroidPackageAnalyzer> = null;

	private _missingImpl:{ [implFqcn:string] :AndroidComponent } = {};

	private _huntingImpl = false;

    constructor(context:DexcaliburProject, pOptions:any = {} ){
        this.context = context;
		this._registerListeners();
		this._initRes();
		this._cfg = pOptions;
	}

	/**
	 * The aim of this method is to set listener on main bus to catch
	 * event related to the update of node representing Android components
	 * and trigger a save
	 *
	 * @private
	 */
	private _initSaveRoutines(){

		[
			"app.activity.new",
			"app.activity.update",
			"app.provider.new",
			"app.provider.update",
			"app.receiver.new",
			"app.receiver.update",
			"app.service.new",
			"app.service.update"
		].map((vEvtType:string)=>{
			this.context.getBus().subscribe(vEvtType, BusSubscriber.from((pEvent:BusEvent<any>)=>{
				(async ()=>{
					try{
						let obj = pEvent.getData().obj as any;
						await this.context.getProjectDB().save(pEvent.getData().obj, { _id:obj._id, name: obj.name});
					}catch(err){
						Logger.error(err.message,err.stack);
					}
				})();
			}));
		});


		/*
		this.context.getBus().subscribe("app.application.new", BusSubscriber.from((pEvent:BusEvent<any>)=>{
			try{
				(async ()=>{
					await this.context.getProjectDB().save(pEvent.getData());
				})();
			}catch(err){
				Logger.error(err.message,err.stack);
			}

		}));*/
	}

	private _initRes(){
		this.resources = {
			/*ids: new AndroidResourceType("ids"),
			string:  new AndroidResourceType("string"),
			styles:  new AndroidResourceType("styles"),
			raw:  new AndroidResourceType("raw"),
			xml:  new AndroidResourceType("xml"),
			attr:  new AndroidResourceType("attr"),*/
		};
		this.layouts = {};
	}

	/**
	 * Register to various events of global bus
	 *
	 * @private
	 */
	private _registerListeners(){

		// make temporary list of missing components (implementing class not found)
		this.context.getBus().subscribe("app.android.missing_impl", BusSubscriber.from((vEvent)=>{
			const cmp = vEvent.getData() as AndroidComponent;
			this._missingImpl[AndroidAppAnalyzer.getComponentFullName(this.manifest,cmp.name)] = cmp;
		}));

		// new values from res
		this.context.getBus().subscribe("app.res.parsed", BusSubscriber.from((vEvent:BusEvent<AndroidResParsedEvent>)=>{

			const resType:string = vEvent.getData().restype;

			// two case :
			// - a single resource has been read from a file (as layout/* files)
			// - a list of resources have been read from a single file (as values/* files)
			// so, it has been typed to an array of resources (AndroidResource[])
			const res:ModelResource[] = vEvent.getData().res;
			const pkgScope = vEvent.getContext().getDataAnalyzer().getScope("PKG");



			let resSaved:any = this.state.getProperty("resSaved");
			if(resSaved==null){
				resSaved = {};
			}

			if(this.hasBeenParsedPreviously(resType)){
				Logger.debug("[ANDROID APP ANALYZER][RESOURCE] Android resources not saved, because such ["
					+resType+"] Resources have been already analyzed. [size="+res.length+"]")
				return ;
			}

			if(res.length>0){


				const files:ModelFile[] = [];
				let strings:ModelStringValue[] = [];

				// extract files & strings
				res.map((v:ModelResource) => {

					try{
						const f = (v.location.source as DataLocationFileSource).file;
						/*if(f != null){
							f.setScope(pkgScope);
							files.push(f);
						}*/
					}catch(er){
						Logger.error(er.message,er.stack);
						// todo : log it to external log service or file
					}

					try{
						//const strs=v.getStringNodes();
						/*if(strs.length==0){
							console.log(v.getUID()+' has not strings vals ',v);
						}*/
						strings = strings.concat(v.getStringNodes());
					}catch(er){
						Logger.error(er.message,er.stack);
						// todo : log it to external log service or file
					}
				});

				// save files and strings
				try{
					if(files.length>0){
						vEvent.getContext().getProjectDB().saveMany(files, NodeInternalType.FILE)
							.catch((err)=>{
								Logger.error(`[LISTENER][app.res.parsed] Save of resource file failed (1): `+err);
							})
							.then((vResult:INode[])=>{
								Logger.info(`[LISTENER][app.res.parsed] Save of resource file successful.`);
							});
					}
				}catch(e){
					Logger.error(`[LISTENER][app.res.parsed] Save of resource file failed (2) : `+e.message);
				}

				try{
					if(strings.length>0){
						vEvent.getContext().getProjectDB().saveMany(strings, NodeInternalType.STRING)
							.catch((err)=>{
								Logger.error(`[LISTENER][app.res.parsed] Save of string from resources failed (1): `+err);
							})
							.then((vResult:INode[])=>{
								Logger.info(`[LISTENER][app.res.parsed] Save of string from resources [${resType}] successful [${strings.length} strings].`);
							});
					}
				}catch(e){
					Logger.error(`[LISTENER][app.res.parsed] Save of string from resources failed (2) : `+e.message);
				}

				if(res.length>0){
					// save resources
					this.context.getProjectDB().saveMany(res,NodeInternalType.RESOURCE)
						.catch((err)=>{
							Logger.error(`[LISTENER][app.res.parsed] Save error : `+err);
						})
						.then((pResult:INode[])=>{
							// success
							resSaved = this.state.getProperty("resSaved");
							if(resSaved==null){
								resSaved = {};
							}

							resSaved[resType] = Object.values(res).length;
							this.state.setProperty("resSaved",resSaved);
							this.state.save().then(()=>{});
						});
				}else{
					Logger.info(`[LISTENER][app.res.parsed] No resources to saved  : `+resType);
				}

			}else{
				// usually, this case happens when a resource folder not contains .xml file
				// empty array cannot be saved because "Batch cannot be empty" with MongoDB
				resSaved = this.state.getProperty("resSaved");
				if(resSaved==null){
					resSaved = {};
				}

				resSaved[resType] = Object.values(res).length;
				this.state.setProperty("resSaved",resSaved);
				this.state.save().then(()=>{});
				return;
			}


		}));

		this.context.getBus().subscribe("app.res.new", BusSubscriber.from( (vEvent)=>{

			(async ()=>{
				const res:ModelResource = vEvent.getData();
				console.log("app.res.new > ", res);
				try{
					console.log("app.res.new before save> ", res);
					await this.context.getProjectDB().save(res);
					console.log("app.res.new after save > ", res);
				}catch(err){
					console.log(err);
					Logger.error("[ANDROID APP ANALYZER][SAVE failed] "+err.message,err.stack);
				}
			})();

		}));

		// after first fullscan, listen 'class.new' events to search each time if there are missing components.
		this.context.getBus().subscribe("dxc.fullscan.post", BusSubscriber.from((vEvent)=>{

			this.updateComponentImplementation();

			if(!this._huntingImpl){
				this.context.getBus().subscribe("class.new", BusSubscriber.from((vE)=> {
					const cmpHunted = this._missingImpl[vE.getData()];
					if(cmpHunted!=null){
						cmpHunted.setImplementedBy(vE.getData());
						this._missingImpl[vE.getData()] = null;
						delete this._missingImpl[vE.getData()];
						Logger.info(`[APP ANALYZER][ANDROID] Missing component implementation has been found for : ${cmpHunted.name}`)
					}
				}));
				this._huntingImpl = true;
			}
		}));

		this._initSaveRoutines();
	}

	/**
	 * To check if a name or a pseudo-FQCN is relative to the package name
	 *
	 * @param {string} pName class name or pseudo-FQCN
	 * @returns {boolean} Return TRUE if relative to the FQCN of app package, else FALSE in case of real FQCN.
	 * @static
	 * @method
	 */
	static isRelativeName(pName:string):boolean {
		return (pName[0]=='.');
	}


	/**
	 * To lookup the Class node corresponding to a class UID from manifest.
	 *
	 * **Important : keep it static. This function is called from inspector jobs**
	 *
	 *
	 * @param {DexcaliburProject} pContext Active project
	 * @param {AndroidManifest} pManifest Android manifest where class UID appears
	 * @param {string} pClassName The class UID to search. It can be incomplete or relative to another package
	 * @returns {ModelClass} Node instance representing the class
	 * @static
	 * @method
	 */
	static getClassByManifestUid( pContext:DexcaliburProject, pManifest:AndroidManifest, pClassName:string):ModelClass{
		let clsUID:string;
		if(AndroidAppAnalyzer.isRelativeName(pClassName)){
			clsUID = pManifest.attributes.package+pClassName;
		}else{
			clsUID = pClassName;
		}


		const cls:ModelClass = pContext.find.get.class(clsUID);
		if( cls == null){
			Logger.error("[AppTopo] Class '"+clsUID+"' not found");
		}
		return cls;
	}

	/**
	 * To get the real FQCN from a class name in the context of the specfied manifest
	 *
	 * @param {AndroidManifest} pManifest Context from where class name must be retrieved
	 * @param {string} pClassName
	 */
	static getComponentFullName( pManifest:AndroidManifest, pClassName:string):string {
		if(AndroidAppAnalyzer.isRelativeName(pClassName)){
			return pManifest.attributes.package+pClassName;
		}else{
			return pClassName;
		}
	}


	/**
	 * To get the app UID
	 *
	 * @method
	 */
	getAppUid():string {
		return this.context.getAppAnalyzer().getPackageName()
	}

	/**
	 * To tag a class as implementation for a component
	 * @param pClass
	 * @param pComponent
	 */
	tagClassAsComponent( pClass:ModelClass, pComponent:AndroidComponent ){
		let tag:string = null;
		switch (pComponent.__){
			case NodeInternalType.ANDROID_ACTIVITY:
				tag = "topo.android.ACTIVITY";
				break;
			case NodeInternalType.ANDROID_SERVICE:
				tag = "topo.android.SERVICE";
				break;
			case NodeInternalType.ANDROID_RECEIVER:
				tag = "topo.android.RECEIVER";
				break;
			case NodeInternalType.ANDROID_PROVIDER:
				tag = "topo.android.PROVIDER";
				break;
			case NodeInternalType.ANDROID_PERM:
				tag = "topo.android.PERM";
				break;
		}

		if(tag != null){
			pClass.addTag( this.context.getTagManager().getTag(tag));
		}
	}

	scanComponent(pComponent:AndroidComponent, pUpdate = true){
		this.scanComponentXrefToAPI(pComponent, pUpdate);

		// tag by intent filter
		//this.tagCmpWithIntent(pComponent);

		// tag by attributes
		//this.tagCmpWithAttr(pComponent);
	}

	/**
	 * To scan and update ultimate cross references to Android API from the specified component
	 *
	 * @param pComponent
	 */
	scanComponentXrefToAPI( pComponent:AndroidComponent, pDeth, pUpdate = true ):AndroidApiClassXrefList {

		// to retrieve class implementign the componenet
		const fqcn = AndroidAppAnalyzer.getComponentFullName( this.manifest, pComponent.getName());

		const cls:ModelClass = this.context.find.get.class(fqcn);

		if ((cls != null) && (cls instanceof ModelClass)) {
			pComponent.setImplementedBy(cls);
			if(pUpdate){
				this.tagClassAsComponent(cls, pComponent);
			}
		}else{
			Logger.error("[ANDROID ANAL][Scan XREF] Fail to map internal dependencies mapped for ["+fqcn+"] : class not found");
			return null;
		}

		// search dependencies to platform method and class
		const apiXref = AndroidCodeAnalyzer.searchInternalDependencies(this.context, pComponent, pDeth);
		if (apiXref!==null) {
			Logger.info("[ANDROID ANAL][Scan XREF] Internal dependencies mapped for : ", fqcn);
		} else {
			Logger.error("[ANDROID ANAL][Scan XREF] Fail to map internal dependencies mapped for : ", fqcn);

		}
		return apiXref;
	}

	/**
	 * To scan and update ultimate cross references to Android API from the specified class
	 *
	 * @param pComponent
	 */
	scanClassXrefToAPI( pClass:ModelClass, pDeth:number, pUpdate = true ):AndroidApiClassXrefList {
		return AndroidCodeAnalyzer.searchClassInternalDependencies(this.context, pClass, pDeth, pUpdate);
	}

	/**
	 * To scan and update ultimate cross references to Android API from the specified method
	 *
	 * @param pComponent
	 */
	scanMethodXrefToAPI( pMethod:ModelMethod, pDeth:number, pUpdate = true ):AndroidApiClassXrefList {
		return AndroidCodeAnalyzer.searchMethodInternalDependencies(this.context, pMethod, pDeth, pUpdate );
	}

	/**
	 * To scan and update ultimate cross references to Android API from the specified component
	 *
	 * @param pComponent
	 */
	scanFunctionXrefToAPI( pMethod:ModelMethod, pUpdate = true ):any {
		// todo
		return null;
	}

	private _getResourcesFolder():string {
		return _path_.join(this.context.getWorkspace().getApkDir(),ApkHelper.getResFolder());
	}

	/**
	 * To parse a resource file from any folder in res/*
	 *
	 * @param pFilePath
	 * @param pResType
	 * @param pContext
	 * @param pRootNode
	 */
	static async _parseResourceValuesFile(pFilePath:string, pResType:AndroidResource, pRootNode:Nullable<string>=null):Promise<AndroidResource[]>{
		const xml = await AndroidAppAnalyzer._parseXmlFile(pFilePath, {preserveChildrenOrder:true, explicitChildren:true});
		let res:AndroidResource[];

		if(pRootNode != null){
			if(xml[pRootNode]!=null && xml[pRootNode]['$$'] !=null){
				res = AndroidResource.fromXml(xml[pRootNode]["$$"], pResType);
			}else{
				throw AnalyzerException.ANDROID_RES_CANNOT_BE_PARSED(
					_path_.basename(pFilePath), `Root [${pRootNode}] node not found.`
				);
			}
		}else{
			res = AndroidResource.fromXml(xml, pResType);
		}
		return res;
	}


	/**
	 * @deprecated
	 * @param pFilePath
	 * @param pResType
	 * @param pContext
	 * @param pRootNode
	 */
	static async parseResourceFile(pFilePath:string, pResType:AndroidResourceType, pContext:DexcaliburProject, pRootNode:Nullable<string>=null){
		const xml = await AndroidAppAnalyzer._parseXmlFile(pFilePath);
		if(pRootNode != null){
			for(let i in xml[pRootNode]){
				AndroidResource.fromXml(xml[pRootNode], pResType, i);
			}
		}else{
			AndroidResource.fromXml(xml, pResType);
		}
		return pResType;
	}

	/**
	 * To perform some action at very first step of a full scan
	 *
	 */
	async prepareFullScan():Promise<boolean>{

		const pkgScope = await this.context.getDataAnalyzer().getDataScope('PKG');

		console.log("Parse manifest")
		const success:boolean = await this.importManifest(_path_.join(this.context.getWorkspace().getApkDir(),"AndroidManifest.xml"));

		// parse all resources in res/ folder, for each a ModelFile will be created
		// and joined into PKG data scope
		console.log("Parse resources at : ",this._getResourcesFolder());
		await this.parseResources(this._getResourcesFolder(), pkgScope);


		/*
		Util.forEachFileOf(
			_path_.join(this._getResourcesFolder(),"values"),
			async (vFilePath:string,vDir:string)=>{
				const type = _path_.basename(vFilePath).split('.')[0];
				if(this.resources[type]==null){
					this.resources[type] = new AndroidResourceType({ _type:type });
				}
				await AndroidAppAnalyzer.parseResourceFile(vFilePath,this.resources[type], this.context, "resources");
				console.log(this.resources[type]._entries.length+" resources parsed");
			},true);*/

		// parse layout
		/*Util.forEachFileOf(
			_path_.join(this._getResourcesFolder(),"layout"),
			async (vFilePath:string,vDir:string)=>{
				const idl = _path_.basename(vFilePath).split('.')[0];
				if(this.layouts[idl]==null){
					this.layouts[idl] = new AndroidResourceType({ _type:idl });
				}
				await AndroidAppAnalyzer.parseResourceFile(vFilePath,this.layouts[idl], this.context, null);

				console.log(Object.values(this.layouts[idl]).length+" layouts parsed");
			},true);*/

		return success;
	}

	/**
	 * To check from analyzer saved state if all resources from a folder have been already parsed
	 * previously
	 *
	 * @param {string} pResType Name of the folder where resources will be parsed
	 * @returns {boolean} TRUE if never parsed and saved, else FALSE
	 * @method
	 */
	hasBeenParsedPreviously(pResType:string):boolean {
		const state = this.state.getProperty("resSaved");

		if(state==null){
			return false;
		}

		return (state[pResType]!=null) && (state[pResType]>0);
	}

	async parseResources(pFolderPath:string, pDataScope:Nullable<DataScope> = null):Promise<void> {
		// read folders in pFolderPath
		const folders = _fs_.readdirSync(pFolderPath);
		const foldersNode:ModelFile[] = [];
		const files:Record<string, ModelFile> = {};
		// resource tree
		let resMap:Record<string, Record<string, ModelResource|(Record<string, ModelResource>) >> = {};
		let variant:string, res:ModelResource;

		const cat = {
			values:null,
			valuesExtra:[],
			cmp:[],
			cmpExtra:[],
			other:[]
		};

		// sort folders
		for(let i=0; i<folders.length; i++){
			// each folder must be represented as a ModelFile into DxEngine
			foldersNode.push(new ModelFile({
				name: folders[i],
				path: _path_.join(pFolderPath,folders[i]),
				scope: pDataScope,
				_d: 'd'
			}));


			if(folders[i].startsWith("values-")){
				cat.valuesExtra.push(folders[i]);
			}else if(folders[i].indexOf("-")>-1) {
				cat.cmpExtra.push(folders[i]);
			}else if(folders[i]=="raw"){
				cat.other.push("raw");
			}else if(folders[i]=="values"){
				cat.values = folders[i];
				resMap["values"] = {};
			}else {
				cat.cmp.push(folders[i]);
				resMap[folders[i]] = {};
			}
		}


		// start to parse values/*
		if(cat.values!=null && !this.hasBeenParsedPreviously("values")){
			resMap["values"] = (await this.parseValuesFromRes("values", pDataScope, false));
		}

		let valsExtra:any;
		// continue with values-*/*
		for(let i=0; i<cat.valuesExtra.length; i++){
			if(!this.hasBeenParsedPreviously(cat.valuesExtra[i])){
				variant = cat.valuesExtra[i].substring(cat.valuesExtra[i].indexOf('-')+1);
				//if(resMap["values"][cat.valuesExtra[i]]==null) resMap["values"][cat.valuesExtra[i]]={};

				valsExtra = (await this.parseValuesFromRes(cat.valuesExtra[i], pDataScope, false));

				for(let valType in valsExtra){
					for(let valID in valsExtra[valType]){
						if(resMap["values"][valType][valID]==null){
							resMap["values"][valType][valID] = valsExtra[valType][valID];
						}else{
							(resMap["values"][valType][valID] as ModelResource)
								.appendProperty('variant',variant,valsExtra[valType][valID]);
						}
					}
				}
			}
		}


		// add layout/*, drawables/*, mipmap/*, xml/*, ...
		for(let i=0; i<cat.cmp.length; i++){
			if(!this.hasBeenParsedPreviously(cat.cmp[i])){
				(await this.parseComponentFromRes(cat.cmp[i], pDataScope)).map(x => {
					resMap[cat.cmp[i]][x.getUID()] = x;
				});
			}
		}


		// add variant layout-*, drawables-*, ...
		for(let i=0; i<cat.cmpExtra.length; i++){
			if(!this.hasBeenParsedPreviously(cat.cmpExtra[i])){
				variant = cat.cmpExtra[i].substring(cat.cmpExtra[i].indexOf('-')+1);
				if(resMap[cat.cmpExtra[i]]==null) resMap[cat.cmpExtra[i]]={};

				(await this.parseComponentFromRes(cat.cmpExtra[i], pDataScope, false)).map(x => {
					if(resMap[cat.cmpExtra[i]][x.getUID()]==null){
						resMap[cat.cmpExtra[i]][x.getUID()] = x;
					}else{
						(resMap[cat.cmpExtra[i]][x.getUID()] as ModelResource).appendProperty('variant',variant,x);
					}
				})
			}
		}

		// save folders
		if(foldersNode.length>0){
			await this.context.getProjectDB().saveMany(foldersNode, NodeInternalType.FILE);
		}


		// browse resMap to gather file
		let file:ModelFile, filemap:any;
		for(let k in resMap){
			if(k=='values'){
				for(let l in resMap[k]){
					for(let m in resMap[k][l]){
						res = (resMap[k][l][m] as ModelResource);
						file = res.getFile();
						if(file!=null && files[file.getUID()]==null) files[file.getUID()] = file;



						filemap = res.getProperty('variant') as Record<string, ModelResource>;
						if(filemap!=null){
							for(let n in filemap){
								if(filemap[n]!=null){
									file = filemap[n].getFile();
									if(file!=null && files[file.getUID()]==null) files[file.getUID()] = file;
								}

							}
						}

					}
				}
			}else{
				for(let l in resMap[k]){
					res = (resMap[k][l] as ModelResource);
					file = res.getFile();
					if(file!=null && files[file.getUID()]==null) files[file.getUID()] = file;


					filemap = res.getProperty('variant') as Record<string, ModelResource>;
					if(filemap!=null){
						for(let n in filemap){
							if(filemap[n]!=null){
								file = filemap[n].getFile();
								if(file!=null && files[file.getUID()]==null) files[file.getUID()] = file;
							}

						}
					}
				}
			}
		}

		if(Object.values(files).length>0){
			await this.context.getProjectDB().saveMany(Object.values(files), NodeInternalType.FILE);
		}


		// emit en event
		let type:string;
		for(let resType in resMap){
			if(resType==="values"){
				type = "values";
				for(let valType in resMap.values){
					this.context.trigger({
						type: "app.res.parsed",
						data: {
							restype: valType,
							res: Object.values(resMap.values[valType])
						}
					} as BusEventOptions<AndroidResParsedEvent>);
				}
			}else{
				this.context.trigger({
					type: "app.res.parsed",
					data: {
						restype: resType,
						res: Object.values(resMap[resType])
					}
				} as BusEventOptions<AndroidResParsedEvent>);
			}
		}


		// update "values"
		//this.context.getProjectDB().saveMany(Object.values(resMap),ModelResource.TYPE.getType());

	}

	async analyzeResources():Promise<void> {
		// solve references
	}


	/**
	 * To parse files in `res/values-x/x`
	 * and build ID map
	 *
	 * @method
	 */
	async parseValuesFromRes(pFolderPath:string, pDataScope:Nullable<DataScope>, pEmit = true):Promise<Record<string, Record<string, ModelResource>>> {

		const entries = _fs_.readdirSync(_path_.join(this._getResourcesFolder(),pFolderPath));
		let data:AndroidResource[];
		let res:ModelResource[] = [];
		let resMap:Record<string, Record<string, ModelResource>> = {};
		let resPath:string;
		let stat:any;

		for(let i=0; i<entries.length; i++){

			res = [];
			resPath = _path_.join(this._getResourcesFolder(),pFolderPath,entries[i]);
			stat = _fs_.statSync(resPath);

			data = await AndroidAppAnalyzer._parseResourceValuesFile(resPath, null, "resources");
			data.map(x => {
				const mr = x.toModelResource("");
				// placeholder for ModelFile (the true ModelFile
				mr.setFileLocation(new ModelFile({
					name: entries[i],
					path: resPath,
					_d: (stat.isFile()? 'f':'d'),
					size: stat.size,
					scope: pDataScope
				}));
				if(mr.ppts.type!=null){
					if(resMap[mr.ppts.type]==null){
						resMap[mr.ppts.type] = {};
					}
					resMap[mr.ppts.type][mr.getUID()] = mr;
				}else{
					Logger.error("Type of '"+mr.getUID()+"' cannot be retrieved");
				}


				res.push(mr);
			} );

			//await AndroidAppAnalyzer.parseResourceFile(resPath,this.resources[type], this.context, "resources");
			if(pEmit){
				// emit en event
				this.context.trigger({
					type: "app.res.parsed",
					data: {
						restype: entries[i],
						res: res
					}
				} as BusEventOptions<AndroidResParsedEvent>);
			}

		}

		return resMap;
	}

	createFileResource(pPath:string, pFolder:string, pRawName:string, pDataScope:Nullable<DataScope>):ModelResource {

		const path = _path_.join(pFolder,pRawName);
		let type:string = pFolder;
		let variant:string = null;
		let res:AndroidResource, mr:ModelResource;
		let o:number;

		if((o = pFolder.indexOf('-'))>-1){
			type = pFolder.substring(0,o);
			variant = pFolder.substring(o+1);
		}

		mr = (new AndroidResource({
			_type: type
		})).toModelResource("", type, pRawName.substring(0,pRawName.indexOf('.')));

		mr.setProperty('fmt',_path_.extname(pRawName).substring(1));
		mr.appendProperty('variant',variant,null);
		mr.setFileLocation(new ModelFile({
			name: pRawName,
			path: pPath,
			size: _fs_.statSync(pPath).size,
			scope: pDataScope,
			_d: 'f',
		}));

		return mr;
	}
	/**
	 * To parse files in `res/values-x/x`
	 * and build ID map
	 *
	 * @method
	 */
	async parseComponentFromRes(pFolderPath:string,
								pDataScope:Nullable<DataScope>,
								pEmit = true,
								pRootNode:Nullable<string> = null):Promise<ModelResource[]> {

		const entries = _fs_.readdirSync(_path_.join(this._getResourcesFolder(),pFolderPath));
		let data:AndroidResource[];
		let res:ModelResource[] = [];
		let resPath:string;
		let stat:any;
		let mr:ModelResource;

		for(let i=0; i<entries.length; i++){

			resPath = _path_.join(this._getResourcesFolder(),pFolderPath,entries[i]);

			try{

				// todo : non-xml resources must a ModelResource encapsulating ModelFile that represent the resource
				if(!entries[i].endsWith(".xml")){
					res.push(this.createFileResource(resPath, pFolderPath, entries[i], pDataScope))
					continue;
				}

				// parse AndroidResource
				data = await AndroidAppAnalyzer._parseResourceValuesFile(resPath, null, pRootNode);

				// convert to a list of ModelResource
				if(data.length==1){
					const dot = entries[i].indexOf('.');
					let res_uid;
					if(dot>-1){
						if(dot==0){
							res_uid = entries[i].substring(1,entries[i].indexOf('.',1));
						}else{
							// ex : @drawable/ic_test.9.png
							res_uid = entries[i].substring(0,dot);
						}
					}else{
						res_uid = entries[i];
					}

					stat = _fs_.statSync(resPath);

					mr = data[0].toModelResource("", pFolderPath, res_uid);
					// placeholder for ModelFile (the true ModelFile
					mr.setFileLocation(new ModelFile({
						name: entries[i],
						path: resPath,
						_d: 'f',
						size: stat.size,
						scope: pDataScope
					}));
					res.push(mr);


					//res.push(data[0].toModelResource("", pFolderPath, res_uid));
				}else if(data.length>1){
					throw AnalyzerException.ANDROID_RES_MULTIPLE_NOT_SUPPORTED(pFolderPath+"/"+entries[i]);
				}else {
					throw AnalyzerException.ANDROID_RES_CANNOT_BE_PARSED(pFolderPath+"/"+entries[i]);
				}
			}catch(err){
				Logger.error(err.message,err.stack);
			}
		}

		if(pEmit){
			this.context.trigger({
				type: "app.res.parsed",
				data: { restype:pFolderPath, res:res }
			});
		}


		return res;
	}

	/**
	 * To get the path of the file or folder to scan by default when an APK is analyzed
	 *
	 * For Android, the default value is the path of the folder containing the content of
	 * the package.
	 *
	 * @return {string} The path of the folder containing the decoded content of the APK
	 * @method
	 */
	getDefaultTargetPath():string{
		return this.context.getWorkspace().getApkDir();
	}

	/**
	 * To restore the analyzer state
	 *
	 * @param {AnalyzerState} pState
	 */
	restoreState(pState:AnalyzerState):boolean {
		if(pState != null){
			this.state = pState;
			return true;
		}else{
			this.state = new AnalyzerState({ _uid:'android-app'});
		}


		return false;
	}

	/*
	findIntentLocationOf(element){
		element.getImplement

	}
	*/

	/*
	 * To get an intent filter by its UID
	 * 
	 * @param {String} uid UID of tntent filter 
	 * @returns {IntentFilter} 	Return the corresponding Intent Filter, else NULL
	 * @function
	 */
	getIntentFilter(type:string, cmp:string, uid:string):IntentFilter{
		let result:AndroidComponent = null;

		switch(type)
		{
			case "activity":
				result = this.context.find.get.activity(cmp);
				if(result instanceof AndroidActivity)
					return result.getIntentFilterByUid(uid);
				break;
			case "receiver":
				result = this.context.find.get.receiver(cmp);
				if(result instanceof AndroidReceiver)
					return result.getIntentFilterByUid(uid);
				break;
			case "provider":
				result = this.context.find.get.provider(cmp);
				if(result instanceof AndroidProvider)
					return result.getIntentFilterByUid(uid);
				break;
			case "service":
				result = this.context.find.get.service(cmp);
				if(result instanceof AndroidService)
					return result.getIntentFilterByUid(uid);
				break;
			default:
				throw new Error("Invalid parent type.")
		}

		return null;
	}

	dumpManifest():string{
		if(this.manifest == null) return null;

		return _fs_.readFileSync(this.manifestPath).toString();
	}


	updateManifest(data:string){
		this.manifestCode = data;
	}

	getPackageName():string{
		return this.manifest.getAttrPackage();
	}

	getManifest():AndroidManifest{
		return this.manifest;
	}

	async scan(path:string):Promise<boolean>{
		return this.importManifest(path);
	}

	/**
	 *
	 * @param pPath
	 * @private
	 */
	static async _parseXmlFile(pPath:string, pOptions:any = {}):Promise<any> {
		if(!_fs_.existsSync(pPath)) return null;

		let res:any;
		try{
			const data = _fs_.readFileSync(pPath);

			if(data == null || data.toString('ascii',0,5)!=="<?xml"){
				// it happens if resources have not been extracted
				throw DataParserException.XML_PARSING_FAILURE(
					pPath,
					'it seems not decompressed/decoded'
				);
			}

			res = await (new _xml2js_.Parser()).parseStringPromise(data, pOptions);
		}catch (err){
			Logger.error("File '"+pPath+"' cannot be analyzed because it seems not decompressed/decoded : "+err.stack);
			console.log(err);
			res = null;
		}


		return res;
	}

    /**
     * To import an Android manifest from he given path
     * @param {String} path Path to the manifest
     */
    async importManifest(path:string):Promise<boolean>{

		Logger.debug("[Manifest] Start parsing");

        const codeAnal:Analyzer = this.context.getAnalyzer();
		const result:any = await AndroidAppAnalyzer._parseXmlFile(path);
		const manifest:AndroidManifest = AndroidManifest.fromXml(result.manifest, this.context);
		

		this.manifest = manifest;
		this.manifestPath = path;

		// update internal DB
		manifest.usesPermissions.map(x => {
			this.context.trigger({
				type: "app.permission.new",
				data: x
			});
			codeAnal.db.permissions.insert(x, false);
			//Logger.debug("[Manifest] Permission found : ",x.name);
		});

		if(manifest.application != null){

			manifest.application.activities.map(x => {
				this.context.trigger({
					type: "app.activity.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.activities.addEntry(x.name, x);
			});
			manifest.application.providers.map(x => {
				this.context.trigger({
					type: "app.provider.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.providers.addEntry(x.name, x);
			});
			manifest.application.receivers.map(x => {
				this.context.trigger({
					type: "app.receiver.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.receivers.addEntry(x.name, x);
			});
			manifest.application.services.map(x => {
				this.context.trigger({
					type: "app.service.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.services.addEntry(x.name, x);
			});

		}


		return true;
    }



	/**
	 * For each component types,
	 * search the associated class
	 *
	 * @method
	 */
	updateComponentImplementation(){
		['activity','provider','receiver','service'].map((vCmpType)=>{
			AndroidAppAnalyzer.updateComponentImplementationOf(this.context, this.manifest, vCmpType);
		});
	}


	/**
	 *
	 * @param {DexcaliburProject} pProject Project instance
	 * @param {AndroidManifest} pManifest Android manifest
	 * @method
	 * @static
	 */
	static updateComponentImplementationOf( pProject:DexcaliburProject, pManifest:AndroidManifest, pCmpType:string):void{

		if(pProject.find[pCmpType]==null){
			Logger.error("Implementation of component ["+pCmpType+"] cannot be update : component type is not supported");
			return ;
		}

		pProject.find[pCmpType]("name:.*").foreach((vIndex:number, vCmp:AndroidComponent)=>{
			//console.log(vIndex, vCmp);
			//console.log(vCmp.getImplementedBy);

			if(vCmp.__impl==null){
				const cls = pProject.find.get.class(AndroidAppAnalyzer.getComponentFullName(pManifest, vCmp.name));
				if(cls!=null){
					Logger.info(`[APP ANALYZER][ANDROID] Class implementing component (${vCmp.name}) has been found`);
					vCmp.__impl = (cls);
				}else{
					Logger.error(`[APP ANALYZER][ANDROID] Class implementing component (${vCmp.name}) cannot be found`);
					pProject.getBus().send(new BusEvent({
						type: "app.android.missing_impl",
						data: vCmp
					}));
				}
			}

		})
	}

	postScan(){
		this.updateComponentImplementation();
	}

	/**
	 * To extract application icon (vector or png)
	 *
	 */
	async extractAppIcons():Promise<AppIcon[]> {
		let res:ModelResource, roundIcon:string, icon:string, appIcons:AppIcon[] = [], appIcon:AppIcon;
		try{
			roundIcon = this.manifest.application.getAttribute("roundIcon",true);
			if(roundIcon!=null){
				appIcon = await this.extractAppIconFromRes(roundIcon);
				if(appIcon != null){
					appIcons.push(appIcon);
				}
			}

			icon = this.manifest.application.getAttribute("icon",true);
			if(icon!=null){
				appIcon = await this.extractAppIconFromRes(icon);
				if(appIcon != null){
					appIcons.push(appIcon);
				}
			}
		}catch(e){

		}finally {
			return appIcons;
		}
	}

	/**
	 * To extract application icon (vector or png)
	 *
	 */
	async extractAppIconFromRes(pResUID):Promise<AppIcon> {

		if(!AndroidResource.isReference(pResUID)){
			return null;
		}

		let res:ModelResource;
		try{

			res = await this.context.getProjectDB().getAppResource(pResUID);
			if(res == null){
				return  null;
			}

			// check type of res.value :
			// - file (as PNG) or AndroidResource
			// TODO



		}catch(e){

		}
	}

	async performXrefAnalysis():Promise<any>{

		// solve value strings
		//this.

		// extract app icons
		await this.extractAppIcons();


	}
}

