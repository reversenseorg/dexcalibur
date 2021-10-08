import {Settings} from "../Settings";
import {Workflow} from "../Workflow";


export namespace External {

    export class Tool {

        _uid: string;
        /**
         * Hold tool version
         */
        private _v:string;

        private _p: string;


        /**
         *
         * @param pUID
         * @param pConfig
         */
        constructor( pUID:string, pConfig:Settings.ExternalToolParams) {
            this._uid = pUID
            this._p = pConfig.path;
        }

        getPath():string {
            return this._p;
        }

        getVersion():string {
            return this._v;
        }

        getUID():string {
            return this._uid;
        }
    }

    export interface ToolSet  {
        [uid :string] :Tool;
    }

    export class ExternalHelper {

        protected static tool:Tool;

        _wf:Workflow;

        public static init( pTool:Tool){
            this.tool = pTool;
        }

        public static getExtPath():string {
            if(this.tool==undefined){
                throw new Error('Tool is not configured');
            }
            return this.tool.getPath();
        }

        setWorkflow( pWF:Workflow):void {
            this._wf = pWF;
        }


        getWorkflow():Workflow {
            return this._wf;
        }
    }

    export class ToolManager {

        private tools: ToolSet;
        private _s:Settings.ExternalSettings;

        constructor( pConfig:Settings.ExternalSettings) {
            this._s = pConfig;
            this.tools = {};

            pConfig.getToolList().map( vName => {
                const t = pConfig.getTool(vName);

                if(typeof t === 'string')
                    this.tools[vName] = new Tool(vName, { path:t });
                else
                    this.tools[vName] = new Tool(vName, t );
            });

        }


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