import * as _fs_ from 'fs';
import * as _xml2js_ from 'xml2js';
import * as _util_ from 'util';

import DexcaliburProject from "./DexcaliburProject";
import {AndroidManifest} from "./android/AndroidManifest";
import {IntentFilter} from "./android/IntentFilter";
import AndroidComponent from "./android/AndroidComponent";
import AndroidActivity from "./android/AndroidActivity";
import AndroidReceiver from "./android/AndroidReceiver";
import AndroidProvider from "./android/AndroidProvider";
import AndroidService from "./android/AndroidService";
import Analyzer from "./Analyzer";
import * as Log from './Logger';
import {AnalyzerState} from "./AnalyzerState";
import {IAppAnalyzer} from "./analyzer/IAppAnalyzer";
import * as _path_ from "path";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;



_xml2js_.Parser.prototype.parseStringPromise = _util_.promisify(_xml2js_.parseString);



export default class AndroidAppAnalyzer implements IAppAnalyzer
{
	context:DexcaliburProject = null;
	manifest:AndroidManifest = null;
	manifestPath:string = null;
	manifestCode:string = null;

	state:AnalyzerState = null;

    constructor(context:DexcaliburProject){
        this.context = context;
	}


	getAppUid():string {
		return this.context.getAppAnalyzer().getPackageName()
	}


	/**
	 * To perform some action at very first step of a full scan
	 *
	 */
	async prepareFullScan():Promise<boolean>{

		const success:boolean = await this.importManifest(_path_.join(this.context.getWorkspace().getApkDir(),"AndroidManifest.xml"));

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
     * To import an Android manifest from he given path
     * @param {String} path Path to the manifest
     */
    async importManifest(path:string):Promise<boolean>{
        let codeAnal:Analyzer = this.context.getAnalyzer();
		let self:AndroidAppAnalyzer = this;
		let data = null;


		Logger.debug("[Manifest] Start parsing");
		if(!_fs_.existsSync(path)) return null;

		data = _fs_.readFileSync(path);
	
		if(data == null || data.toString('ascii',0,5)!=="<?xml"){
			// it happens if resources have not been extracted
			console.log(data);
			Logger.error("Android Manifest cannot be analyzed because it seems not decompressed/decoded. It happens sometime when APKTool failed to extract APK content.");
			// throws excep here
			return false;
		}

		//let amp = new AndroidManifestXmlParser(self);

		let parser:_xml2js_.Parser = new _xml2js_.Parser();

		let result:any = await parser.parseStringPromise(data);

		let manifest:AndroidManifest = AndroidManifest.fromXml(result.manifest, self.context);
		

		this.manifest = manifest;
		this.manifestPath = path;

		// update internal DB
		manifest.usesPermissions.map(x => {
			self.context.trigger({
				type: "app.permission.new",
				data: x
			});
			codeAnal.db.permissions.insert(x, false);
			Logger.debug("[Manifest] Permission found : ",x.name);
		});

		if(manifest.application != null){

			manifest.application.activities.map(x => {
				self.context.trigger({
					type: "app.activity.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.activities.addEntry(x.name, x);
			});
			manifest.application.providers.map(x => {
				self.context.trigger({
					type: "app.provider.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.providers.addEntry(x.name, x);
			});
			manifest.application.receivers.map(x => {
				self.context.trigger({
					type: "app.receiver.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.receivers.addEntry(x.name, x);
			});
			manifest.application.services.map(x => {
				self.context.trigger({
					type: "app.service.new",
					data: { obj:x, manifest:manifest}
				});
				codeAnal.db.services.addEntry(x.name, x);
			});

		}


		return true;
    }
}

