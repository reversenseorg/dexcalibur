const fs = require("fs");
const xml2js = require("xml2js");
const AndroidObj = require("./AndroidAppComponents.js");

var Parser = new xml2js.Parser();

class ManifestXmlParser
{
    constructor(analyzer){
        this.analyzer = analyzer;
        this.manifest = new AndroidObj.Manifest();
    }

    getManifest(){
        return this.manifest;
    }

    parse(buffer, callback=null){
        Parser.parseString(buffer, function (err, result) {
            if(err){
                if(callback != null) callback(err);
                return;
            }

            let manifest = AndroidObj.Manifest.fromXml(result.manifest);

            if(callback != null) 
                callback(null, manifest);
        });
    }
}

module.exports = ManifestXmlParser;