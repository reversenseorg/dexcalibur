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

    hasAssessments():boolean {
        return (this.assessments.length > 0);
    }

    toJsonObject():any {
        let o:any = {
            id: this.id,
            name: this.name,
            description: this.description,
            links: this.links,
            children: [],
            assessments: []
        };

        if(this.hasChildren()){
            this.children.map(x => {
                o.children.push(x.toJsonObject())
            });
        }

        if(this.hasAssessments()){
            this.assessments.map(x => {
                o.assessments.push(x.toJsonObject())
            });
        }

        return o;
    }
}