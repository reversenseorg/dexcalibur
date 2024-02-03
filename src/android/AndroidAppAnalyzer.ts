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
import {NodeInternalType} from "../NodeInternalType.js";
import {AndroidApiClassXrefList, AndroidCodeAnalyzer} from "./analyzer/AndroidCodeAnalyzer.js";
import BusEvent from "../BusEvent.js";
import {BusSubscriber} from "../Bus.js";
import ApkHelper from "../ApkHelper.js";
import Util from "../Utils.js";
import {AndroidResource, AndroidResourceType} from "./AndroidResource.js";
import {AndroidPackageAnalyzer} from "./analyzer/AndroidPackageAnalyzer.js";

const Logger:Log.Logger = Log.newLogger() as Log.Logger;



_xml2js_.Parser.prototype.parseStringPromise = _util_.promisify(_xml2js_.parseString);


export interface ResourcesMap {
	/*ids: AndroidResourceType,
	string: AndroidResourceType,
	styles: AndroidResourceType,
	raw: AndroidResourceType,
	xml: AndroidResourceType,*/
	[name:string]: AndroidResourceType
}



export default class AndroidAppAnalyzer implements IAppAnalyzer
{
	context:DexcaliburProject = null;
	manifest:AndroidManifest = null;
	manifestPath:string = null;
	manifestCode:string = null;

	resources:ResourcesMap;
	layouts:ResourcesMap;

	state:AnalyzerState = null;

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
			this._missingImpl[this.getComponentFullName(this.manifest,cmp.name)] = cmp;
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

	}

	/**
	 * To check if a name is relative to the package name
	 * @param pName
	 */
	static isRelativeName(pName:string):boolean {
		return (pName[0]=='.');
	}

	getComponentFullName( pManifest:AndroidManifest, pClassName:string):string {
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
		const fqcn = this.getComponentFullName( this.manifest, pComponent.getName());

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

	static async parseResourceFile(pFilePath:string, pResType:AndroidResourceType, pSkip:Nullable<string>=null){
		const xml = await AndroidAppAnalyzer._parseXmlFile(pFilePath);
		if(pSkip != null){
			for(let i in xml[pSkip]){
				AndroidResource.fromXml(xml[pSkip], pResType, i);
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



		const success:boolean = await this.importManifest(_path_.join(this.context.getWorkspace().getApkDir(),"AndroidManifest.xml"));

		// parse values
		Util.forEachFileOf(
			_path_.join(this._getResourcesFolder(),"values"),
			async (vFilePath:string,vDir:string)=>{
				const type = _path_.basename(vFilePath).split('.')[0]
				if(this.resources[type]==null){
					this.resources[type] = new AndroidResourceType({ _type:type });
				}
				await AndroidAppAnalyzer.parseResourceFile(vFilePath,this.resources[type],"resources");
				console.log(this.resources[type]._entries.length+" resources parsed");
			},true);

		// parse layout
		Util.forEachFileOf(
			_path_.join(this._getResourcesFolder(),"layout"),
			async (vFilePath:string,vDir:string)=>{
				const idl = _path_.basename(vFilePath).split('.')[0]
				if(this.layouts[idl]==null){
					this.layouts[idl] = new AndroidResourceType({ _type:idl });
				}
				await AndroidAppAnalyzer.parseResourceFile(vFilePath,this.layouts[idl],null);
				console.log(Object.values(this.layouts[idl]).length+" layouts parsed");
			},true);

		return success;
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
	static async _parseXmlFile(pPath:string):Promise<any> {
		if(!_fs_.existsSync(pPath)) return null;
		const data = _fs_.readFileSync(pPath);

		if(data == null || data.toString('ascii',0,5)!=="<?xml"){
			// it happens if resources have not been extracted
			Logger.error("File '"+pPath+"' cannot be analyzed because it seems not decompressed/decoded.");
			Logger.debugRAW(data);
			return false;
		}

		return await (new _xml2js_.Parser()).parseStringPromise(data);
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
			Logger.debug("[Manifest] Permission found : ",x.name);
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
			this.context.find[vCmpType]("name:.*").foreach((vIndex:number, vCmp:AndroidComponent)=>{
				//console.log(vIndex, vCmp);
				//console.log(vCmp.getImplementedBy);

				if(vCmp.__impl==null){
					const cls = this.context.find.get.class(this.getComponentFullName(this.manifest, vCmp.name));
					if(cls!=null){
						Logger.info(`[APP ANALYZER][ANDROID] Class implementing component (${vCmp.name}) has been found`);
						vCmp.__impl = (cls);
					}else{
						Logger.error(`[APP ANALYZER][ANDROID] Class implementing component (${vCmp.name}) cannot be found`);
						this.context.getBus().send(new BusEvent({
							type: "app.android.missing_impl",
							data: vCmp
						}));
					}
				}

			})
		});
	}

	postScan(){
		this.updateComponentImplementation();
	}
}

