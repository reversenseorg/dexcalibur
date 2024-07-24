import {NodeInternalTypeName} from "@dexcalibur/dxc-core-api";;

/**
 * Helper to debug core feature
 *
 * @class
 */
export class CoreDebug {

    static CHECK_JSON = true;

    /**
     * Helper to detect circular reference error when data are serialized.
     *
     * If CoreDebug.CHECK_JSON is TRUE, then `JSON.stringify()` will be applied to the output of every `*.toJsonObject()`
     * call
     *
     * @param pObject
     */
    static checkJsonSerialize( pObject:any, pSource = ""):void {
        if(CoreDebug.CHECK_JSON){
            try{
                JSON.stringify(pObject);
            }catch (e){
                let s = pSource+":";
                if(pObject.hasOwnProperty("__")){
                    s += "<"+NodeInternalTypeName[pObject.__]+"> ";
                }else{
                    s += "<TYPE NONE>";
                }

                Object.keys(pObject).map(k => {
                    const t = (typeof pObject[k]);
                    if(t==="string"||t==="number"){
                        s += `${k}= "${pObject[k]}" , `;
                    }else if(pObject[k]==null){
                        s += `${k}= null , `;
                    }else{
                        s += `${k}= [Object] , `;
                    }
                });


                console.error("[CORE DEBUG][checkJsonSerialize] "+s+"\n",e.stack);
            }
        }
    }
}