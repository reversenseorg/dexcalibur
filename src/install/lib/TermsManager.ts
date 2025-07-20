import {TermsOfUse} from "./TermsOfUse.js";


export interface TermsManagerOptions {

    /**
     * Available languages.
     * For each a folder must exist inside `LicenseConfiguration.folder`
     *
     * @type {string[]}
     */
    lang: string[],

    /**
     * Default licence lang
     * @type {string}
     */
    defaultLang?: string,

    /**
     * Path of the folder containing licence files
     * @type {string}
     */
    folder?: string
}


/**
 *
 */
export class TermsManager {

    config:TermsManagerOptions;

    translations: Record<string, TermsOfUse> = {};

    constructor( pConfig:TermsManagerOptions) {
        this.config = pConfig;
        this.config.lang.map( x => {
            this.translations[x] = new TermsOfUse(this.config.folder, x);
        });
    }


    getTerms(pLang:string):TermsOfUse {
        if(this.translations.hasOwnProperty(pLang)){
            return this.translations[pLang];
        }else if( this.config.defaultLang != null){
            return this.translations[this.config.defaultLang];
        }else{
            return Object.values(this.translations)[0];
        }
    }
}