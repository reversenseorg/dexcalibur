/**
 * 
 * Usage :
 * You must keep `run_os_script.js` and a folder containings scripts into the same folder as 
 * follow :
 * 
 * -+- <your_custom_folder>
 *  +--+- run_os_script.js
 *     +- scripts/
 *     +--+- linux.build.sh
 *        +- darwin.build.js
 *        +- win64.build.bat
 * 
 * Into package.json or anywhere run :
 * ```
 * node run_os_script <script_name> [args, ...]
 * ```
 * 
 * Author: Georges-B. Michel
 */

var _fs_ = require('fs');
var _path_ = require('path');
var _child_ = require('child_process');


const OS = require('os').platform();
if(process.argv.length<=2){
    console.log(` 
    Usage :
        node ./run_os_script.js <script_name>[:<script_name>] [args, ...]
    `)
    process.exit(0);
}


// get script name
const SCRIPT_NAME = process.argv[3];
var os_scripts = {
    linux: {},
    darwin: {},
    win32: {}
}

// scan scripts directory
_fs_.readdirSync(_path_.join(__dirname, 'os_scripts'), { encoding:'utf8'})
    .map( vFile => {
        const t = _path_.basename(vFile).split('.');

        try{
            if(t.length!=3) throw new Error("Invalid OS Scripts : "+vFile);
            if(!os_scripts.hasOwnProperty(t[0])) throw new Error("Invalid OS (support only linux, darwin, windows_nt) : "+t[0]);

            // test if t[1] and t[2] are not empty
            os_scripts[t[0]][t[1]] = {
                f: vFile,
                t: t[2]
            };
        }catch(err){
            console.log("[ERROR] "+err.message);
        }
    });

console.log(JSON.stringify(os_scripts));

process.exit(0);

// execute script
var script = os_scripts[OS];
if(script==null || !script.hasOwnProperty(process.argv[2])){
    console.log("[ERROR] Script not found for : "+OS+", "+process.argv[2]);
    process.exit(0);
}

script = script[process.argv[2]];
switch(script.t){
    case "bat":
    case "sh":
        _child_.execSync(script.f);
        break;
    case "js":
        _child_.execSync('node '+script.f);
        break;
    default:
        console.log("Nothing to execute");
        break;
}


console.log("-- Done --");



