const _fs_  = require("fs");
const _Chalk_ = require("chalk");
const Logger = require("./Logger.js")();
const _xml2js_ = require("xml2js");


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

    /**
     * To import an Android manifest from he given path
     * @param {String} path Path to the manifest
     */
    importManifest(path){
        let codeAnal = this.context.getAnalyzer();
        let self = this;


		Logger.debug("[Manifest] Start parsing");
        _fs_.exists(path,function(res){
            if(!res) return;

            _fs_.readFile(path, (err,data)=>{
                if(err){
                    Logger.error("Android Manifest cannot be read : ",err);
                    return;
                }
                if(data == null || data.toString('ascii',0,5)!=="<?xml"){
                    // it happens if resources have not been extracted
                    Logger.error("Android Manifest cannot be analyzed because the workspace has been built by using a previous version of Dexcalibur.");
					// throws excep here
					return;
                }

                //let amp = new AndroidManifestXmlParser(self);

                var parser = new _xml2js_.Parser();

                parser.parseString(data, function (err, result) {
                    if(err){
                        Logger.error("Android Manifest cannot be parsed : ",err);
                        return;
                    }
        
					let manifest = Android.Manifest.fromXml(result.manifest, self.context);
					

					self.manifest = manifest;
					self.manifestPath = path;

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
					

                });

            });
        
        });
    }
}

module.exports = AndroidAppAnalyzer;
