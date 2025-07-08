
// Patch GOT modules in dexcalibur-installer
import * as _FS_ from "node:fs";
import * as _PATH_ from "node:path";

let cwd = process.cwd();
if(_FS_.existsSync(_PATH_.join(cwd,'package.json'))){

    let success = "failure";
    let ctn = ""

    try{
         ctn = _FS_.readFileSync(
             _PATH_.join(
                 cwd,
                 'node_modules',
                 '@dexcalibur',
                 'dexcalibur-installer',
                 'node_modules',
                 'got',
                 'dist',
                 'source',
                 'core',
                 'options.d.ts'
             )
         ).toString();

         // version <= 12.x
         ctn = ctn.replace("import http from 'node:http';","import * as http from 'node:http';");
         ctn = ctn.replace("import https from 'node:https';","import * as https from 'node:https';");

         // version > 12.x
        ctn = ctn.replace(
            "import http, { type Agent as HttpAgent, type ClientRequest } from 'node:http';",
            `import * as http from 'node:http';import { type Agent as HttpAgent, type ClientRequest } from 'node:http';`);

        ctn = ctn.replace(
            "import https, { type RequestOptions as HttpsRequestOptions, type Agent as HttpsAgent } from 'node:https';",
            `import * as https from 'node:https';import { type RequestOptions as HttpsRequestOptions, type Agent as HttpsAgent } from 'node:https';`);


        _FS_.writeFileSync(
            _PATH_.join(
                cwd,
                'node_modules',
                '@dexcalibur',
                'dexcalibur-installer',
                'node_modules',
                'got',
                'dist',
                'source',
                'core',
                'options.d.ts'
            ),
            ctn
        );
        success = "Done";
    }catch (e){
        console.error(e);
    }


    console.log(`[*] Patching : ${success}`)
}
