
export interface IControl {
    id:string;
    name:string;
    description:string;
    isControlAssessment():boolean;
    isControl():boolean;
}