const _fs_  = require("fs");
const _Chalk_ = require("chalk");
const Logger = require("./Logger.js")();
const _xml2js_ = require("xml2js");
const _util_ = require('util');

_xml2js_.Parser.prototype.parseStringPromise = _util_.promisify(_xml2js_.parseString);


const Android = require("./AndroidAppComponents.js");


class AndroidAppAnalyzer
{
    constructor(context){
        this.context = context;
		this.manifest =  null; //new Android.Manifest(context);
		this.manifestPath = null;
	}

	/*
	findIntentLocationOf(element){
		element.getImplement

	}
	*/

	/**
	 * To get an intent filter by its UID
	 * 
	 * @param {String} uid UID of tntent filter 
	 * @returns {IntentFilter} 	Return the corresponding Intent Filter, else NULL
	 * @function
	 */
	getIntentFilter(type,cmp,uid){
		let result = null;

		switch(type)
		{
			case "activity":
				result = this.context.find.get.activity(cmp);
				if(result instanceof Android.Activity)
					return result.getIntentFilterByUid(uid);
				break;
			case "receiver":
				result = this.context.find.get.receiver(cmp);
				if(result instanceof Android.Receiver)
					return result.getIntentFilterByUid(uid);
				break;
			case "provider":
				result = this.context.find.get.provider(cmp);
				if(result instanceof Android.Provider)
					return result.getIntentFilterByUid(uid);
				break;
			case "service":
				result = this.context.find.get.service(cmp);
				console.log(cmp,result);
				if(result instanceof Android.Service)
					return result.getIntentFilterByUid(uid);
				break;
			default:
				throw new Error("Invalid parent type.")
		}

		return null;
	}

	dumpManifest(){
		if(this.manifest == null) return null;

		return _fs_.readFileSync(this.manifestPath).toString();
	}

	updateManifest(data){
		this.manifestCode = data;
	}

	getPackageName(){
		return this.manifest.getAttrPackage();
	}
	getManifest(){
		return this.manifest;
	}

    /**
     * To import an Android manifest from he given path
     * @param {String} path Path to the manifest
     */
    async importManifest(path){
        let codeAnal = this.context.getAnalyzer();
		let self = this;
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

		var parser = new _xml2js_.Parser();

		let result = await parser.parseStringPromise(data);

		let manifest = Android.Manifest.fromXml(result.manifest, self.context);
		

		this.manifest = manifest;
		this.manifestPath = path;

		// update internal DB
		manifest.usesPermissions.map(x => {
			self.context.trigger({
				type: "app.permission.new",
				data: x
			});
			codeAnal.db.permissions.insert(x);
			Logger.debug("[Manifest] Permission found : ",x.name);
		});
		manifest.application.activities.map(x => {
			self.context.trigger({
				type: "app.activity.new",
				data: x
			});
			codeAnal.db.activities.addEntry(x.name, x);
		});
		manifest.application.providers.map(x => {
			self.context.trigger({
				type: "app.provider.new",
				data: x
			});
			codeAnal.db.providers.addEntry(x.name, x);
		});
		manifest.application.receivers.map(x => {
			self.context.trigger({
				type: "app.receiver.new",
				data: x
			});
			codeAnal.db.receivers.addEntry(x.name, x);
		});
		manifest.application.services.map(x => {
			self.context.trigger({
				type: "app.service.new",
				data: x
			});
			codeAnal.db.services.addEntry(x.name, x);
		});

		return true;
    }
}

module.exports = AndroidAppAnalyzer;
