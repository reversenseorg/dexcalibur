var fs=require("fs");
var Chalk = require("chalk");
var Path = require("path");
var CLASS = require("./CoreClass.js");
var Logger = require("./Logger.js")();

const DIR_NAME = {
    SAVE: "save",
    IN: "inputs",
    RUNTIME: "runtime",
    RUNTIME_FILES: Path.join("runtime","files"),
    RUNTIME_BC: Path.join("runtime","bytecode"),
    LOGS: "logs",
    APPDATA: "appdata",
    TMP: "tmp",
    DEXES: "dexes"
};

/**
 * Represents the Dexcalibur workspace. It is used when the tool 
 * wants access/read/write files or folder.  
 * @param {string} pkg The application package name
 * @param {Object} config The  
 * @constructor 
 */
function Workspace(pkg,config){
    this._config = config;
    this._pkg = pkg; 
}

/**
 * To export a Workspace instance to a Stub.
 * It is used when Dexcalibur prepare the data to be save in a flat file.
 * @returns {Stub} The Stub containing the Workspace instance data. 
 * @function
 */
Workspace.prototype._export = function(){
    return new CLASS.Stub(
        CLASS.STUB_TYPE.WORKSPACE,
        this
    );
}


/**
 * To import the given Stub instance into the current Workspace.
 * It is used when Dexcalibur want create a context from a save file.
 * @param {Stub} stub The Stub instance to import 
 * @function
 */
Workspace.prototype._import = function(stub){
    for(let i in stub){
        if(this[i] !== undefined) this[i] = stub[i];
    }
};

/**
 * To create a directory into the application working directory.
 * @param {string} dirName The name of the directory to create
 * @function
 */
Workspace.prototype.mkWDir = function(dirName){
    fs.mkdirSync(Path.join(this.getWD(),dirName), {recursive: true});
};


/**
 * To remove the directory with the given name from the application working directory.
 * @param {string} dirName The name of the directory to remove 
 * @function
 */
Workspace.prototype.rmWDir = function(dirName){
    if(fs.existsSync(dirName)){
        fs.readdirSync(dirName).forEach((file,i)=>{
            let p = Path.join(dirName,file);
            if(fs.lstatSync(p).isDirectory()){
                this.rmWDir(p);
            }else{
                fs.unlinkSync(p);
            }
        });
        fs.rmdirSync(path);             
    }
};

/**
 * To verifry if the given path is writable. 
 * Its use absolute path.
 * @param {string} path Absolute file path to check
 * @returns {boolean} Returns TRUE if the file is writable, else FALSE
 * @function
 */
Workspace.prototype.isWritable = function(path){
    return fs.accessSync(path, fs.constants.F_OK | fs.constants.W_OK);
};

/**
 * To get the Application working directory
 * @returns {string} The Application worksing directory path
 * @function
 */
Workspace.prototype.getWD = function(){
    if(this.wd == null){

        this.wd = Path.join(this._config.workspacePath,this._pkg);
        //this.wd = this._config.workspacePath+this._pkg+"/";
    }
    return this.wd;
}

/**
 * To remove the current Application working directory
 * @returns {void} 
 * @function
 */
Workspace.prototype.clean = function(){
    this.rmWDir(this.getWD());
    Logger.success("[*] Working directory removed : "+this.getWD());
}

/**
 * To initialize a new Application working directory. 
 * It creates a main folder and nested folders. 
 * If a folder already exists it will not be overwritten.
 * @function 
 */
Workspace.prototype.init = function(){
    if(!fs.existsSync(this.getWD())){
        fs.mkdirSync(this.getWD(), {recursive: true});
    }    
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.SAVE))){
        this.mkWDir(DIR_NAME.SAVE+"/");
    }    
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.IN))){
        this.mkWDir(DIR_NAME.IN+"/");
    }    
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.RUNTIME))){
        this.mkWDir(DIR_NAME.RUNTIME+"/");
    }
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.RUNTIME_BC))){
        this.mkWDir(DIR_NAME.RUNTIME_BC);
    }
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.RUNTIME_FILES))){
        this.mkWDir(DIR_NAME.RUNTIME_FILES);
    }
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.APPDATA))){
        this.mkWDir(DIR_NAME.APPDATA+"/");
    }
    if(!fs.existsSync(Path.join(this.getWD(),DIR_NAME.TMP))){
        this.mkWDir(DIR_NAME.TMP+"/");
    }
    Logger.success("[*] Working directory : "+this.getWD());
}

/**
 * To generate a new timestamped save file path
 * @returns {string} The timestamped save file path
 * @function
 */
Workspace.prototype.getNewSavefilePath = function(){
    let d = new Date();
    return Path.join(this.getWD(),DIR_NAME.SAVE,"autosave."+d.getTime()+".ddb");
}


Workspace.prototype.getSaveDir = function(){
    return Path.join(this.getWD(),DIR_NAME.SAVE);
}

Workspace.prototype.getAppdataDir = function(){
    return Path.join(this.getWD(),DIR_NAME.APPDATA);
}

Workspace.prototype.getInputDir = function(){
    return Path.join(this.getWD(),DIR_NAME.IN);
}

Workspace.prototype.getRuntimeDir = function(){
    return Path.join(this.getWD(),DIR_NAME.RUNTIME);
}

Workspace.prototype.getRuntimeFilesDir = function(){
    return Path.join(this.getWD(),DIR_NAME.RUNTIME_FILES);
}

Workspace.prototype.getRuntimeBcDir = function(){
    return Path.join(this.getWD(),DIR_NAME.RUNTIME_BC);
}

Workspace.prototype.getTmpDir = function(){
    return Path.join(this.getWD(),DIR_NAME.TMP);
}
/**
 * To generate a new timestamped file path
 * @param {string} prefix The string part before the timestamp
 * @param {string} suffix The string part after the timestamp
 * @returns {string} The timestamped save file path
 * @function
 */
Workspace.prototype.getTimestampedFilePath = function(prefix,suffix){
    let d = new Date();
    return Path.join(this.getWD(),DIR_NAME.SAVE,prefix+d.getTime()+suffix);
}



module.exports = Workspace;
