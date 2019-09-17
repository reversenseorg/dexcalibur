const _fs_  = require("fs");
const _Chalk_ = require("chalk");

const _xml2js_ = require("xml2js");

//const AndroidComp = require("./AndroidAppComponents.js");

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

        _fs_.exists(path,function(res){
            if(!res) return;

            _fs_.readFile(path, (err,data)=>{
                if(err){
                    console.log(_Chalk_.bold.red("Android Manifest cannot be read : ",err));
                    return;
                }
                if(data == null || data.toString('ascii',0,5)!=="<?xml"){
                    // it happens if resources have not been extracted
                    console.log(_Chalk_.bold.red("Android Manifest cannot be analyzed because the workspace has been built by using a previous version of Dexcalibur."));
					// throws excep here
					return;
                }

                //let amp = new AndroidManifestXmlParser(self);

                var parser = new _xml2js_.Parser();

                parser.parseString(data, function (err, result) {
                    if(err){
                        console.log(_Chalk_.bold.red("Android Manifest cannot be parsed : ",err));
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
