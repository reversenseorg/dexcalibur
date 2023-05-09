

export interface PiiFieldOptions {
    name?:string;
    rules?:any[];
}


export class PiiField {

    name:string;

    rules:any[] = []

    constructor(pOpts:PiiFieldOptions) {
        for(const i in pOpts) this[i] = pOpts[i];
    }

}