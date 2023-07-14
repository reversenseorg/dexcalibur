import {AssetOptions} from "./Asset.js";
import ControlAssessment from "./ControlAssessment.js";
import {Metadata} from "./Metadata.js";

export interface ControlOptions {
    id?:string;
    name?:string;
    description?:string;
    links?:string[];
    children?:Control[];
    assessments?:ControlAssessment[];
    metadata?:Metadata[];
}
/**
 * Represent a set of control points / assessments
 *
 * @class
 */
export default class Control {

    /**
     * Unique control ID
     * @type {string}
     * @field
     */
    id:string;

    /**
     * Control point name
     * @type {string}
     * @field
     */
    name:string;

    description:string;

    metadata:Metadata[] = [];

    //changes:DataChange[] = []

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

    static fromJsonObject(pObject:any):Control {
        const control = new Control(pObject);

        if(control.hasChildren()){
            control.children.map((vChild,index)=>{
                control.children[index] = Control.fromJsonObject(vChild);
            });
        }

        if(control.hasAssessments()){
            control.assessments.map((vChild,index)=>{
                control.assessments[index] = ControlAssessment.fromJsonObject(vChild);
            });
        }

        return control;
    }

    toJsonObject():any {
        let o:any = {
            id: this.id,
            name: this.name,
            description: this.description,
            links: this.links,
            children: [],
            assessments: [],
            metadata: this.metadata
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