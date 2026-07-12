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

import {Settings} from "../Settings.js";
import {Workflow} from "../Workflow.js";


export namespace External {

    /**
     * Represent an external tool which can be executed
     * by Dexcalibur
     *
     * `Tool` instances are persisted.
     *
     * @class
     */
    export class Tool {

        _uid: string;

        /**
         * Tool version
         *
         * @type {string}
         * @private
         */
        private _v:string;

        /**
         * Executable path
         *
         * An executable can a JAR file as well as an ELF
         *
         * @type {string}
         * @private
         */
        private _p: string;


        /**
         *
         * @param {string} pUID Tool UID
         * @param {Settings.ExternalToolParams} pConfig Setting
         */
        constructor( pUID:string, pConfig:Settings.ExternalToolParams) {
            this._uid = pUID
            this._p = pConfig.path;
        }

        /**
         * To get path of the tool
         *
         * @return {string} Path
         * @method
         */
        getPath():string {
            return this._p;
        }

        /**
         * To get path of the tool
         *
         * TODO : ensure it is semver format
         *
         * @return {string} Version
         * @method
         */
        getVersion():string {
            return this._v;
        }

        /**
         * To get the UID
         *
         * It allows to uniquely identify external tools
         *
         * @return {string} UID
         * @method
         */
        getUID():string {
            return this._uid;
        }
    }


    /**
     * A parent class to help to implement Helper classes that provide
     * API to executable or CLI tools.
     *
     * It helps to separate logic required to configure path to external tool, from
     * API itself.
     *
     * @class
     */
    export class ExternalHelper {

        /**
         * The external tool to invoke
         *
         * @protected
         */
        protected static tool:Tool;

        /**
         * A workflow object to provide monitoring of progression
         *
         * @type {Workflow};
         */
        _wf:Workflow;

        /**
         * To populate the tool to use for each ExternalHelper child class
         *
         * Examples :
         * ```
         * JavaHelper.init(this.extMgr.getTool('java'));
         * FridaHelper.init(this.extMgr.getTool('frida'));
         * ```
         *
         * Else any instance of JavaHelper will use same tool, but different Workflows
         *
         * @param {Tool} pTool Tool instance
         * @return {void}
         * @static
         * @method
         */
        public static init( pTool:Tool):void{
            this.tool = pTool;
        }

        /**
         * To retrieve the path to Tool binary
         *
         * @param {string} pTool Optional. Default is empty string. A tool name to display if the tool is not configured
         * @return {string} The tool path
         * @static
         * @method
         */
        public static getExtPath(pTool=""):string {
            if(this.tool==undefined||this.tool==null){
                try{
                    throw new Error('Tool is not configured :'+pTool);
                }catch(err){
                    throw new Error('Tool is not configured :'+pTool+err.stack) ;
                }
            }
            return this.tool.getPath();
        }

        /**
         * To set the workflow to use
         *
         * @param {Workflow} pWF Workflow instance
         * @method
         */
        setWorkflow( pWF:Workflow):void {
            this._wf = pWF;
        }

        /**
         * To get the workflow instance
         *
         * @return {Workflow} Worflow of the helper instance
         * @method
         */
        getWorkflow():Workflow {
            return this._wf;
        }
    }

    /**
     * Represents the ToolManager.
     *
     * Each DexcaliburEngine instance has own ToolManager instance
     *
     * @class
     */
    export class ToolManager {

        /**
         * A hashmap with configured or configurable tool
         *
         * @private
         */
        private tools: Record<string, Tool> = {};

        private _s:Settings.ExternalSettings;

        /**
         *
         * @param {Settings.ExternalSettings} pConfig
         * @constructor
         */
        constructor( pConfig:Settings.ExternalSettings) {
            this._s = pConfig;

            pConfig.getToolList().map( vName => {
                const t = pConfig.getTool(vName);

                if(typeof t === 'string')
                    this.tools[vName] = new Tool(vName, { path:t });
                else
                    this.tools[vName] = new Tool(vName, t );
            });

        }


        /**
         * To get a tool instance by its UID
         *
         * @param {string} pUID Tool UID
         * @return {Tool} The tool instance or NULL if there is not tool with this UID
         * @method
         */
        getTool( pUID:string) :Tool {
            return this.tools[pUID];
        }

        /**
         * To add dynamically a tool into external manager
         *
         * When a new tool is added, a save of global settings is trigged.
         *
         * @param {Tool} pTool A Tool object describing how to invoke an external tool
         * @param {boolean} pSave If TRUE, change is persisted into global settings. Default is FALSE.
         * @method
         * @public
         * @since 1.0.0
         */
        addTool( pTool:Tool, pSave:boolean = false):void {
            this.tools[pTool.getUID()] = pTool;

            this._s.update(
                this._s.sanitize( pTool.getUID(), pTool.getPath(), true)
            );

            if(pSave) this.save();
        }

        /**
         * To persist changes
         *
         * It could be called when a new tool is defined into ToolManager, to persist the path
         * into global settings
         *
         * @param string pDestPath Path of the configuration file. See GlobalSettings
         * @method
         * @public
         * @since 1.0.0
         */
        save(pDestPath=null):void {
            this._s.save(pDestPath);
        }
    }
}