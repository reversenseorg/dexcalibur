import {Settings} from "../Settings";


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

        public static init( pTool:Tool){
            this.tool = pTool;
        }

        public static getExtPath():string {
            if(this.tool==undefined){
                throw new Error('Tool is not configured');
            }
            return this.tool.getPath();
        }
    }

    export class ToolManager {

        private tools: ToolSet;

        constructor( pConfig:Settings.ExternalSettings) {
            this.tools = {};

            for(let i in pConfig){
                if(pConfig.hasOwnProperty(i)){
                    this.tools[i] = new Tool(i, pConfig[i]);
                }
            }
        }



        getTool( pUID:string) :Tool {
            return this.tools[pUID];
        }

        addTool( pTool:Tool):void {
            this.tools[pTool.getUID()] = pTool;
        }
    }
}