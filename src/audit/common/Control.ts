import {AssetOptions} from "./Asset.js";
import ControlAssessment from "./ControlAssessment.js";

export interface ControlOptions {
    id?:string;
    name?:string;
    description?:string;
    links?:string[];
    children?:Control[];
    assessments?:ControlAssessment[];
}

/**
 * @class
 */
export default class Control {


    id:string;

    name:string;

    description:string;

    links:string;

    children:Control[] = [];

    assessments:ControlAssessment[] = []

    constructor( pConfig:ControlOptions = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    hasChildren():boolean {
        return (this.children.length > 0);
    }


}