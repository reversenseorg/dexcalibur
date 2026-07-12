/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

import * as _fs_ from "fs"
import * as _path_ from "path"
import * as _os_ from "os"
import {Installer, InstallMode} from "./lib/Installer.js";
import {TermsManager} from "./lib/TermsManager.js";
import * as Log from "../Logger.js";
import chalk from "chalk";
import {CommandCode} from "./lib/CommandResponse.js";

const EOL = _os_.EOL;
const Logger:Log.Logger = Log.newLogger() as Log.Logger;


enum STDIN_MODE {
    KEY_MODE,
    STRING_MODE
}


interface Action {
    label: string,
    key: string;
    action: (pStep:any)=>void;
}


interface StepInfo {
    tpl: string,
    controls: Action[],
    next?: string;
    before?: ()=>boolean;
    update?: (data:any)=>void;
    tokens:any;
}

interface StepInfoMap {
    [stepName:string]: StepInfo
}

const META = {
    productName: "$$_PRODUCT_NAME_$$",
    version: "$$_PRODUCT_VERSION_$$",
    buildNumber: "$$_PRODUCT_BUILD_$$",
    copyright: "$$_COPYRIGHT_$$"
}


/*
 * ==============================================
 */


/**
 * CLI Frontend for the installer
 *
 * @class
 */
export class CliFrontend {

    inputs:any = {};

    MODE = STDIN_MODE.KEY_MODE;

    installer:Installer;

    termsMgr: TermsManager;

    copyright:string;

    steps:any;

    actionController:any = {
        listen: {},
        onEnter: (pValue:string)=>{},
        onEmpty: ()=>{}
    }



    /**
     * @constructor
     * @param pInstaller
     * @param pLicenseMgr
     */
    constructor( pInstaller:Installer, pMgr:TermsManager, pCopyright:string) {
        this.installer = pInstaller;
        this.termsMgr = pMgr;
        this.copyright = pCopyright;
        this.configure();
    }

    /**
     * To configure installer steps
     *
     * @method
     */
    configure(){
        this.steps = {
            WELCOME: {
                tpl:
                    `
${Logger.info("======================================================")}
[${this.getProductInfo()}]
${Logger.info("======================================================")}

Welcome to Dexcalibur Installer

This program will help you to install requirements and to configure global settings for Dexcalibur.
By following the install, you accept terms of our privacy policy [ https://www.reversense.com/privacy-policy ]

`
                ,
                tokens: {},
                controls: [
                    { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                    { label:"Continue", key:"c", action: (pStep:any)=>{  this.printStep("LICENSE", false); }  }
                ]
            },
            LICENSE: {
                tpl:
                    `
License Agreement

Choose a language by typing [F] or [E], else please read the license.

##_TEXT_##
`
                ,
                tokens: {
                    "##_TEXT_##":  this.termsMgr.getTerms("fr").loadText()
                },
                controls: [
                    { label:"Reject", key:"r", action: (pStep:any)=>{
                            process.exit(1);
                        } },
                    { label:"Switch to French", key:"f", action: (pStep:any)=>{
                            pStep.tokens["##_TEXT_##"] =  this.termsMgr.getTerms("fr").loadText();
                            this.printStep("LICENSE", false);
                        } },
                    { label:"Switch to English", key:"e", action: (pStep:any)=>{
                            pStep.tokens["##_TEXT_##"] =  this.termsMgr.getTerms("en").loadText()
                            this.printStep("LICENSE", false);
                        } },
                    { label:"Accept", key:"a", action: (pStep:any)=>{
                            this.printStep("SETTINGS_WS", false);
                        }  }
                ]
            },
            SETTINGS_WS: {
                tpl:
                    `
${chalk.yellow("[Server Settings]")}

Please choose the workspace location :##_TEXT_##`
                ,
                tokens: {
                    "##_TEXT_##":  chalk.yellowBright((this.installer.dxcConfig.server.workspace!=null)? EOL+this.installer.dxcConfig.server.workspace : "")
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    this.MODE = STDIN_MODE.KEY_MODE;
                    if(!vRes.args.success){
                        console.log(chalk.redBright(vRes.args.causes));
                        return true;
                    }else{
                        this.printStep("SETTINGS_HTTP", false);
                        return false;
                    }
                },
                before: (vStep:StepInfo)=>{
                    if(this.inputs.ws==null) {
                        this.inputs.ws = {}
                    }

                    this.readString(
                        vStep,
                        (vValue:string)=>{

                            this.MODE = STDIN_MODE.KEY_MODE;
                            this.installer.processCommand(
                                CommandCode.SETTINGS_GLOBALS,
                                JSON.stringify({ workspace: vValue }) ,
                                { step:  "SETTINGS_WS" }
                            );
                            vStep.tokens["##_TEXT_##"] = vValue;
                        });

                    return true;
                },
                controls: []
            },
            SETTINGS_HTTP: {
                tpl:
                    `
Please choose the HTTP(S) port :##_TEXT_##`
                ,
                tokens: {
                    "##_TEXT_##":  (this.installer.dxcConfig.server.http)? EOL+this.installer.dxcConfig.server.http : ""
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    this.MODE = STDIN_MODE.KEY_MODE;
                    if(!vRes.args.success){
                        console.log(chalk.redBright(vRes.args.causes));
                        return true;
                    }else{
                        this.printStep("SETTINGS_WEBSOCKET", false);
                        return false;
                    }
                },
                before: (vStep:StepInfo)=>{
                    if(this.inputs.http==null) {
                        this.inputs.http = 80;
                    }

                    this.readString(
                        vStep,
                        (vValue:string)=>{

                            this.MODE = STDIN_MODE.KEY_MODE;
                            this.installer.processCommand(
                                CommandCode.SETTINGS_GLOBALS,
                                JSON.stringify({ http: vValue }) ,
                                { step:  "SETTINGS_HTTP" }
                            );
                            vStep.tokens["##_TEXT_##"] = vValue;
                        });

                    return true;
                },
                controls: []
            },
            SETTINGS_WEBSOCKET: {
                tpl:
                    `
Please choose the web socket port :##_TEXT_##`
                ,
                tokens: {
                    "##_TEXT_##":  (this.installer.dxcConfig.server.ws!=null)? EOL+this.installer.dxcConfig.server.ws : ""
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    this.MODE = STDIN_MODE.KEY_MODE;
                    if(!vRes.args.success){
                        console.log(chalk.redBright(vRes.args.causes));
                        return true;
                    }else{
                        this.printStep("REQ_JAVA", false);
                        return false;
                    }
                },

                before: (vStep:StepInfo)=>{
                    this.readString(
                        vStep,
                        (vValue:string)=>{

                            this.MODE = STDIN_MODE.KEY_MODE;
                            this.installer.processCommand(
                                CommandCode.SETTINGS_GLOBALS,
                                JSON.stringify({ ws: vValue }) ,
                                { step:  "SETTINGS_WEBSOCKET" }
                            );
                            vStep.tokens["##_TEXT_##"] = vValue;

                        });

                    return true;
                },
                controls: []
            },
            REQ_JAVA: {
                tpl:
                    `
${chalk.whiteBright("Java Requirements"+EOL+"--")}

Minimum requirements to install Dexcalibur are Java, Python and Node.
The installer tries to detect it and to check if detected version satisfies requirements.
Alternatively, you can set binary path for  manually.

${chalk.whiteBright("[Status]")}
##_STATUS_##
`
                ,
                tokens: {
                    "##_STATUS_##":  "Pulling ..."
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.success){
                        vStep.tokens["##_STATUS_##"] = chalk.greenBright(`Java setup is OK [installed=${vRes.args.installedVersion}][required=${vRes.args.requiredVersion}]`);
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{
                                this.printStep("REQ_PYTHON", false);
                            }  }
                        ];

                    }else{
                        vStep.tokens["##_STATUS_##"] = chalk.redBright("Required version: >= 8.x");
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Select a file", key:"s", action: (pStep:any)=>{
                                    this.selectFileInfo(
                                        pStep,
                                        "Please select the location of the binary",
                                        (vValue:string)=>{
                                            this.inputs.java.path = vValue;
                                        });
                                } },
                            { label:"Refresh", key:"r", action: (pStep:any)=>{ } },
                            { label:"Force", key:"f", action: (pStep:any)=>{  this.printStep("REQ_PYTHON", false);   } },
                        ];
                    }

                    return true;
                },
                before: (vStep)=> {
                    if(vStep.tokens["##_STATUS_##"]=="Pulling ..."){
                        this.inputs.java = {};
                        this.installer.processCommand(CommandCode.CHECK_REQS, "java", {
                            step: "REQ_JAVA"
                        });
                        return false;
                    }else{
                        return true;
                    }
                },
                controls: [
                    { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                    { label:"Select a file", key:"r", action: (pStep:any)=>{
                            this.selectFileInfo(
                                pStep,
                                "Please select the location of the binary",
                                (vValue:string)=>{
                                    this.inputs.java.path = vValue;
                                });
                        } },
                    { label:"Paste as file path", key:"p", action: (pStep:any)=>{} },
                    { label:"Refresh", key:"r", action: (pStep:any)=>{ } },
                    { label:"Continue", key:"c", action: (pStep:any)=>{  this.printStep("REQ_PYTHON", false); }  }
                ]
            },
            REQ_PYTHON: {
                tpl:
                    `
Python Requirements
--
Minimum requirements to install Dexcalibur is Python >= 3.x.
The installer tries to detect it and to check if detected version satisfies requirements.
Alternatively, you can set binary path for  manually.

[Status]
##_STATUS_##

`
                ,
                tokens: {
                    "##_STATUS_##":  "Pulling ..."
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.args.success){
                        vStep.tokens["##_STATUS_##"] = `Python setup is OK [installed=${vRes.args.installedVersion}][required=${vRes.args.requiredVersion}]`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{
                                    this.printStep("REQ_FRIDA", false);
                                }  }
                        ];

                    }else{
                        vStep.tokens["##_STATUS_##"] = "Required version: >= 3.x";
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Select a file", key:"s", action: (pStep:any)=>{
                                    this.selectFileInfo(
                                        pStep,
                                        "Please select the location of the binary",
                                        (vValue:string)=>{
                                            this.inputs.java.path = vValue;
                                        });
                                } },
                            { label:"Refresh", key:"r", action: (pStep:any)=>{ } },
                            { label:"Force", key:"f", action: (pStep:any)=>{  this.printStep("REQ_FRIDA", false);   } },
                        ];
                    }

                    return true;
                },
                before: (vStep)=> {
                    if(vStep.tokens["##_STATUS_##"]=="Pulling ..."){
                        this.inputs.python = {};
                        this.installer.processCommand(CommandCode.CHECK_REQS, "python", {
                            step: "REQ_PYTHON"
                        });
                        return false;
                    }else{
                        return true;

                    }

                },
                controls: [
                    { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                    { label:"Continue", key:"c", action: (pStep:any)=>{  this.printStep("REQ_FRIDA",false); }  }
                ]
            },
            REQ_FRIDA: {
                tpl:
                    `
Frida

Frida is a powerful multi-platform dynamic binary instrumentation framework. 
Dexcalibur leverages Frida, so Frida must be installed on your computer.

If Frida is already installed but not detected, please select give the full path of the binary to help 
Dexcalibur to check if the current version is compatible with Dexcalibur.
Alternatively, you can let Dexcalibur reinstall Frida.

Required version: >= 16.x

##_STATUS_##
`
                ,
                tokens: {
                    "##_STATUS_##":  "Pulling status ..."
                },
                before: (vStep)=> {
                    if(vStep.tokens["##_STATUS_##"]=="Pulling status ..."){
                        this.inputs.python = {};
                        this.installer.processCommand(CommandCode.CHECK_REQS, "frida", {
                            step: "REQ_FRIDA"
                        });
                        return false;
                    }else{
                        return true;

                    }

                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.args.success){
                        vStep.tokens["##_STATUS_##"] = `Frida setup is OK [installed=${vRes.args.installedVersion}][required=${vRes.args.requiredVersion}]`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{
                                    this.printStep("REQ_R2", false);
                                }  }
                        ];

                    }else{
                        vStep.tokens["##_STATUS_##"] = `Frida is missing. Use one of methods below or install it manually, and retry.`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Download and install", key:"d", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Install bundled prebuilt binary", key:"s", action: (pStep:any)=>{ } },
                            { label:"Force to use the installed version", key:"f", action: (pStep:any)=>{
                                    this.selectFileInfo(
                                        pStep,
                                        "Please select the location of the binary",
                                        (vValue:string)=>{
                                            this.inputs.java.path = vValue;
                                        });
                            } },
                            { label:"Refresh", key:"r", action: (pStep:any)=>{ } },
                        ];
                    }
                    return true;
                },
                controls: []
            },
            REQ_R2: {
                tpl:
                    `
Radare2

Radare2 is an amazing reverse engineering software supporting a bunch of architecture. It is an free and open source project developped by @truffae and the community.
         
Dexcalibur leverages Radare2 to analyse binary files such as shared library, executable, and more.
Radare2 is already installed but not detected, please select give the full path of the binary to help Dexcalibur to check if the current version is compatible with Dexcalibur. <br>

Alternatively, you can let Dexcalibur reinstall Radare2 from prebuilt binary

##_STATUS_##
`
                ,
                tokens: {
                    "##_STATUS_##":  "Pulling status ..."
                },
                before: (vStep)=> {
                    if(vStep.tokens["##_STATUS_##"]=="Pulling status ..."){
                        this.inputs.r2 = {};
                        this.installer.processCommand(CommandCode.CHECK_REQS, "radare2", {
                            step: "REQ_R2"
                        });
                        return false;
                    }else{
                        return true;

                    }

                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.args.success){
                        vStep.tokens["##_STATUS_##"] = `Radare2 setup is OK [installed=${vRes.args.installedVersion}][required=${vRes.args.requiredVersion}]`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{  this.printStep("REQ_ADB",false); }  }
                        ];

                    }else{
                        vStep.tokens["##_STATUS_##"] = `Radare2 is missing. Use one of methods below or install it manually, and retry.`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Download and install", key:"d", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Install bundled prebuilt binary", key:"s", action: (pStep:any)=>{ } },
                            { label:"Force to use the installed version", key:"f", action: (pStep:any)=>{
                                    this.selectFileInfo(
                                        pStep,
                                        "Please select the location of the binary",
                                        (vValue:string)=>{
                                            this.inputs.r2.path = vValue;
                                        });
                                } },
                            { label:"Refresh", key:"r", action: (pStep:any)=>{ } },
                        ];
                    }
                    return true;
                },
                controls: []
            },
            REQ_ADB: {
                tpl:
                    `
Android Debug Bridge

Dexcalibur relies on several Android platform tools  to communicate with target devices and to analyze files (such as oat, dex, jar, ...).
If you have already worked with Android Studio, such tools are probably installed on your computer. However, to ensure the better reliability,
such portable tools are re-downloaded/copied into Dexcalibur workspace. Only required tools will be downloaded, not entire SDK. 

Please select what do you prefer : online or offline install.
            
Important : ADB will be detected only if the selected workspace is already an existing Dexcalibur workspace. 
So, if ADB already exists on your file system, but it is a new workspace, you MUST select an action below.

##_STATUS_##
`
                ,
                tokens: {
                    "##_STATUS_##":  "Pulling status ..."
                },
                before: (vStep)=> {
                    if(vStep.tokens["##_STATUS_##"]=="Pulling status ..."){
                        this.installer.processCommand(CommandCode.CHECK_REQS, "adb", {
                            step: "REQ_ADB"
                        });
                        return false;
                    }else{
                        return true;

                    }

                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.args.success){
                        vStep.tokens["##_STATUS_##"] = `ADB setup is OK [installed=${vRes.args.installedVersion}][required=${vRes.args.requiredVersion}]`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{
                                    this.printStep("BUNDLED",false);
                                }  }
                        ];

                    }else{
                        vStep.tokens["##_STATUS_##"] = `ADB is missing. Use one of methods below or install it manually, and retry.`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ this.abort(); } },
                            { label:"Download and install", key:"d", action: (pStep:any)=>{
                                this.installer.processCommand(CommandCode.TOOL_INSTALL, "adb:online", {
                                    step: "REQ_ADB"
                                });
                            } },
                            { label:"Install bundled prebuilt binary", key:"s", action: (pStep:any)=>{
                                this.installer.processCommand(CommandCode.TOOL_INSTALL, "adb:offline", {
                                    step: "REQ_ADB"
                                });
                            } },
                            { label:"Force to use the installed version", key:"f", action: (pStep:any)=>{
                                this.installer.processCommand(CommandCode.TOOL_FORCE, "adb", {
                                    step: "REQ_ADB"
                                });
                            } },
                            { label:"Refresh", key:"r", action: (pStep:any)=>{
                                this.installer.processCommand(CommandCode.CHECK_REQS, "adb", {
                                    step: "REQ_ADB"
                                });
                            } },
                        ];
                    }
                    return true;
                },
                controls: []
            },
            BUNDLED: {
                tpl:
                    `
Third parts

Dexcalibur can rely on various third-parts tools such as binwalk. Even if you ve already 
tools installed, it will download it as portable binary again into dexcalibur workspace.

##_TEXT_##
`
                ,
                tokens: {
                    "##_TEXT_##":  "Processing ..."
                },
                before: (vStep)=> {

                    if(vStep.tokens["##_TEXT_##"]=="Processing ..."){
                        this.installer.processCommand(CommandCode.CHECK_BUNDLES, {bundles:"*",installMode:InstallMode.ONLINE}, {
                            step: "BUNDLED"
                        });
                        return false;
                    }else{
                        return true;
                    }
                },
                update: (vStep:StepInfo, vRes:any)=>{
                    if(vRes.args.success){
                        vStep.tokens["##_TEXT_##"] = `Third-part tools have been installed successfully into workspace`;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                            { label:"Continue", key:"c", action: (pStep:any)=>{
                                    this.printStep("END",false);
                                }  }
                        ];

                    }else{
                        vStep.tokens["##_TEXT_##"] = `Some required third-part tools are missing. Please install it `;
                        vStep.controls = [
                            { label:"Abort", key:"q", action: (pStep:any)=>{ this.abort(); } },
                            { label:"Install/Retry", key:"i", action: (pStep:any)=>{
                                    this.installer.processCommand(CommandCode.BUNDLE_INSTALL, "", {
                                        step: "BUNDLED"
                                    });
                                } }
                        ];
                    }
                    return true;
                },
                controls: []
            },
            END: {
                tpl:
                    `
${chalk.whiteBright("======================================================")}
[${this.getProductInfo()}]
${chalk.whiteBright("======================================================")}

Dexcalibur has been successfully installed and 

The server is now ready to be executed. Please quit this program and start the server by doing:
"node ./dexcalibur-adm.js start"

`
                ,
                tokens: {},
                controls: [
                    { label:"Abort", key:"q", action: (pStep:any)=>{ process.exit(1); } },
                ]
            },
        };
    }

    /**
     * To print the step with the specified name
     *
     * @param {string} pName Step name
     * @method
     */
    printStep(pName:string, pSkipBefore):void{
        const step = this.steps[pName];

        if(step==null){
            this.abort();
            return;
        }

        if(step.before != null && !pSkipBefore){
            if(!step.before.call(null,step)){
                //this.abort();
                return;
            }
        }

        let ctn:string = step.tpl;
        if(Object.values(step.tokens).length>0){
            for(let t in step.tokens){
                do {
                    ctn = ctn.replace(t, step.tokens[t]);
                }while(ctn.indexOf(t)>-1)
            }
        }

        let msg = `${ctn}`;

        if(step.controls.length>0){
            msg += chalk.whiteBright(`
======================================================
${this.getActionFront(step)}`);
        }

        console.log(msg);
    }


    /**
     * To listen and handle keyboard event
     *
     * @method
     */
     listenKeyboardEvent(){
         const self = this;

         process.stdin.on('data', function(chunk) {
             const std = chunk.toString();

             if(self.MODE===STDIN_MODE.KEY_MODE){
                 if(std.length==2){
                     const k = std[0].toLowerCase();
                     if(self.actionController.listen[k]!=null) {
                         self.actionController.listen[k].call(null);
                     }
                 }
             }else{
                 if(std.length>1){
                     self.actionController.onEnter.call(null,std.slice(0,std.length-1));
                 }else{
                     self.actionController.onEmpty.call(null)
                 }
             }
         });

         process.stdin.on('end', function() {

             console.log("End : ");
         });
     }

    /**
     * To start the installer
     * @method
     */
    start(){
        this.listenKeyboardEvent();
        this.installer.eventsPipe.subscribe((vEvent:any)=>{
           //console.log("[Event Pipe] Receipt : ",vEvent);
           if(this.steps[vEvent.extra.step].update != null){
               if(vEvent.res.args!=null && typeof vEvent.res.args==="string"){
                   vEvent.res.args = JSON.parse(vEvent.res.args);
               }

               if(this.steps[vEvent.extra.step].update.call(null,this.steps[vEvent.extra.step],vEvent.res)){
                   this.printStep(vEvent.extra.step, true);
               }
           }else{

           }

        });
        this.printStep("WELCOME", false);
     }


    abort():string {
        return process.exit(1);
    }

    getProductInfo():string {
        return `${chalk.yellowBright(this.installer.meta.name)} - ${chalk.blue(this.installer.meta.version)} (Build : ${chalk.blue(this.installer.meta.build)}) - ${this.copyright}`;
    }

    getActionFront(pStep:StepInfo):string {
        let msg = "";
        this.actionController.listen = {};

        pStep.controls.map(x => {
            this.actionController.listen[x.key] = ()=>{
                x.action(pStep);
            };
            msg += ` [${x.key.toUpperCase()}] ${x.label} `;
        })

        return msg;
    }

    /**
     * To invite the user to enter a file path
     * Ò
     * @param pStep
     * @param pMessage
     * @param pOnEnter
     * @param pOnEmpty
     */
    selectFileInfo(pStep:StepInfo, pMessage:string, pOnEnter:(vVal:string)=>void, pOnEmpty:()=>void = ()=>{}):void {

        console.log(`
+ ======================================================
| Select a file :
| --
| ${pMessage}
+ ======================================================
Path:`);


        this.readString(pStep,pOnEnter,pOnEmpty);
    }

    readString(pStep:StepInfo, pOnEnter:(vVal:string)=>void, pOnEmpty:()=>void = ()=>{}):void {

        this.MODE = STDIN_MODE.STRING_MODE;

        this.actionController.onEnter = pOnEnter;
        this.actionController.onEmpty = pOnEmpty;
    }




    readLicenseText( pLang:string):string {

        if(pLang.match(/^[a-z]+$/)==null) throw new Error("Path traversal is not allowed");


        const path = _path_.join( "..","assets","LICENSES",pLang,"license.txt" );
        return _fs_.readFileSync(path).toString();
    }
}

