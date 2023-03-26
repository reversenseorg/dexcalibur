import {Script} from "./Script.js";
import DexcaliburProject from "./DexcaliburProject.js";


export class ScriptManager {

    currentProject:DexcaliburProject = null;

    scripts:Script[] = [];


    constructor( pProject:DexcaliburProject ) {
        this.currentProject = pProject;
    }

    /**
     * To get a script by its UID
     *
     * @param pSID
     */
    getScript( pSID:number):Script {
        for(let i=0; i<this.scripts.length; i++){
            if(this.scripts[i].sid === pSID) {
                return this.scripts[i];
            }
        }
        return null;
    }

    /**
     * @return {Script[]}
     */
    listScripts():Script[] {
        return this.scripts;
    }

    /**
     * To create a new script, if the script is not
     * from crashpad, it will be saved
     *
     * @param {Script} pScript Script instance
     * @method
     */
    newScript( pScript:Script):any{
        this.scripts.push(pScript);
        if(!pScript.isScratchPad()){
            this.save();
        }
    }

    /**
     *
     */
    save():void {

    }
}
