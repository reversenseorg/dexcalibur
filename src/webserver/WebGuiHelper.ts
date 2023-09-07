import {WebGuiConfiguration} from "./WebGuiConfiguration.js";

/**
 * The aim of this helper is to parse GUI configuration strings and prepare web server configuration object
 *
 * @class
 */
export class WebGuiHelper {

    constructor() {

    }


    /**
     * To parse serialized configuration of exposed GUI and return an array of
     * WebGuiConfiguration objects. Each object contain configuration of one GUI
     *
     * Input string has following format :
     *
     * <GUI_NAME>[ : <PPT_NAME>[ = <PPT_VAL>] ]* [ , <GUI_NAME>[ : <PPT_NAME>[ = <PPT_VAL>] ] ]
     *
     * @param {string} pStrCfg Serialized config to parse
     * @return {WebGuiConfiguration[]} A list of configuration object
     * @method
     * @static
     */
    static parse( pStrCfg:string):WebGuiConfiguration[] {
        const configs:WebGuiConfiguration[] = [];

        const guis = pStrCfg.split(",");
        guis.map(x => {
            const params = x.split(':');
            const cfg = new WebGuiConfiguration(x);
            cfg.name = params.shift();
            if(params.length>0){
                params.map( p => {
                    const v = p.split('=');
                    cfg.addProperty(v[0], v[1]!=null ? v[1] : null);
                })
            }
            configs.push(cfg);
        })

        return configs;
    }
}