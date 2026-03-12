/**
 * Represent a tool triggerable by events, user or scheduled task
 *
 * Exemple :
 * - screenshot + OCR condition
 * - memory dump
 * - file dump
 *
 *
 * @class
 */
export class Tool {

    static _lib:Tool[] = [];

    name:string = null;
    desc:string = null;
    version:string = null;
    configuration:any = null;

    static register( pTool:Tool):void{
        Tool._lib.push(pTool);
    }

    constructor(pOpts:any={}) {
        if(pOpts!=null){
            for (let i in pOpts){
                this[i] = pOpts[i];
            }
        }
    }
}