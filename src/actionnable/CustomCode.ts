import {Nullable} from "../core/IStringIndex.js";
import {F} from "@reversense/interruptor/src/common/Types.js";
import {TypescriptHelper} from "../core/lang/TypescriptHelper.js";

export type CodeLang = "js" | "ts";


export interface CustomCodeOptions {
    fn?:Function;
    compiled?:string;
    source?:string;
    lang?:CodeLang;
    errors?:string;
}

/**
 * Actionnable
 *
 * Represent a piece of editable Dexcalibur's code
 *
 * @class
 */
export class CustomCode {

    fn:Nullable<Function> = null;
    compiled:Nullable<string>  = null;
    source:Nullable<string>  = null;
    lang:CodeLang = "js";
    errors:Nullable<string>  = null;

    constructor(pOptions:CustomCodeOptions) {
        if(pOptions.fn!=null) this.fn = pOptions.fn;
        if(pOptions.compiled!=null) this.compiled = pOptions.compiled;
        if(pOptions.source!=null) this.source = pOptions.source;
        if(pOptions.lang!=null) this.lang = pOptions.lang;
        if(pOptions.errors!=null) this.errors = pOptions.errors;
    }

    getSource():Nullable<string> {
        return this.source;
    }

    getLang():CodeLang {
        return this.lang;
    }

    getCompiled():Nullable<string> {
        return this.compiled;
    }

    /**
     * Chainable
     */
    wakeUp():CustomCode {
        this.createFunction(['pCtx','pEvent']);
        return this;
    }

    /**
     * To create a function from source code
     *
     * @param {string[]} pArgsName Arguments names
     * @return {Function} Instance of the function created
     * @method
     */
    createFunction(pArgsName:string[] = []):Function {
        // if required, compile it
        switch (this.lang){
            case "ts":
                // todo : invoke tsc
                this.compiled = TypescriptHelper.transpile(this.source);
                console.log(this);
                break;
            case "js":
            default:
                this.compiled = this.source;
                break;
        }

        const args = pArgsName.concat(this.compiled);
        this.fn = Function.apply(null, args);

        return this.fn;
    }

    /**
     *
     */
    toJsonObject():any {
        return {
            fn: null,
            compiled: this.compiled,
            source: this.source,
            lang: this.lang,
            errors: this.errors
        };
    }
}