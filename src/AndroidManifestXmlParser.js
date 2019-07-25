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

    prepareApplication(data){

    }

    preparePermissions(data){

    }

    preparePermissions(data){
        
    }

    parse(buffer, callback){
        Parser.parseString(buffer, function (err, result) {
            if(err) return;

            //console.log(result);
            let manifest = new AndroidObj.Manifest(result.manifest);

            //console.dir(manifest);
            //console.log('Done');
        });
    }
}

module.exports = ManifestXmlParser;