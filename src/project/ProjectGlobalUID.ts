import {DexcaliburConnectionParams} from "../remote/DexcaliburConnectionParams.js";

const LOCAL_ID = "local";
const SEPARATOR = '@'

var _PROJECTS:string[] = [];

export class ProjectURI {

    private _uri:string = null;
    private _uid:string = null;
    private _conn:any = null;
    private _local:boolean = true;

    constructor( pURI:string) {
        this._uri = pURI;
    }

    static newLocalProject( pProjectUID:string){
        const s = `${pProjectUID}@${LOCAL_ID}`;
        if(_PROJECTS.indexOf(s)){
            throw new Error("A project already exists with this UID");
        }
        return new ProjectURI(s);
    }

    static fromString( pSzerialized:string ):ProjectURI {
        const t = pSzerialized.split(SEPARATOR);
        let o:ProjectURI = new ProjectURI(pSzerialized);

        if(t[1]==LOCAL_ID){
            o.setAsLocal();
        }else{
            /*o.setAsRemote(
                DexcaliburConnectionParams.fromString(t[1])
            );*/
        }

        o.setProjectUID(t[0]);

        return o;
    }

    setAsLocal():void {
        this._local = true;
        this._conn = null;
    }

    setAsRemote( pConn:DexcaliburConnectionParams):void {
        this._local = false;
        this._conn = pConn;
    }

    setProjectUID(pUID: string) {
        this._uid = pUID;
    }

    getURI():string  {
        return this._uri;
    }

    equals( pProjectURI:ProjectURI):boolean {
        return (this._uri == pProjectURI.getURI());
    }
}
