import * as VM from 'vm';
import {ScriptException} from "./errors/ScriptException";

/**
 * Represent a Dexcalibur script
 *
 * @class
 */
export class Script {

    /**
     * Script ID
     *
     * @field
     * @type {string}
     * @public
     */
    sid:number = null;

    /**
     * Script name
     *
     * @field
     * @type {string}
     * @public
     */
    name:string = null;

    /**
     * Description of the script
     *
     * @field
     * @type {string}
     * @public
     */
    description:string = "No description";

    /**
     * Script source code
     *
     * @field
     * @type {string}
     * @public
     */
    code:string = null;

    scratchpad:boolean = true;

    /**
     *
     * @param pConfig
     * @constructor
     */
    constructor( pConfig:any = null) {
        if(pConfig != null){
            for(const i in pConfig){
                this[i] = pConfig[i];
            }
        }
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setDescription( pText:string){
        this.description = pText;
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setCode( pText:string){
        this.code = pText;
    }

    /**
     * Set description text
     *
     * @param pText
     */
    setName( pText:string){
        this.name = pText;
    }

    /**
     * To execute the script
     *
     * @param {any} pEnv
     */
    execute( pEnv:any ):boolean {
        if(this.code.length == 0){
            throw ScriptException.EMPTY_SCRIPT();
        }

        const script = new VM.Script(this.code);

        VM.createContext(pEnv);
        script.runInContext(pEnv);

        return true;
    }

    /**
     * To check if the script comes from scratchpad or must be saved
     *
     * @return {boolean} Return TRUE if the script come from scratchpad
     * @method
     */
    isScratchPad():boolean {
        return this.scratchpad;
    }
}