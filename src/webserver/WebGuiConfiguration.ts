/**
 * Options of configuration
 * @interface
 */
interface WebGuiOptions {
    http_port?:number;
    ws_port?:number;
    ssl?:boolean;
    rootFolder?:string;
    home?:string;
}

/**
 * Represents configuration data required to route request for each GUI
 * @class
 */
export class WebGuiConfiguration {

    static DEFAULT_HOMEPAGE = "index.html";

    raw:string;

    name:string = "";

    ppts:WebGuiOptions = {};

    started = false;

    constructor(pRaw:string = "") {
        this.raw = pRaw;
    }


    addProperty( pName:string, pValue:any):void {
        this.ppts[pName] = pValue;
    }

    getHttpPort():number {
        return this.ppts.http_port;
    }

    getWebSocketPort():number {
        return this.ppts.ws_port;
    }

    isSslEnabled():boolean {
        return this.ppts.ssl;
    }

    getRootFolder():string {
        return (this.ppts.rootFolder!=null ? this.ppts.rootFolder : this.name);
    }

    /**
     *To get the relative path of the file containing home page. This path is relative to delegated web root
     *
     */
    getHome():string {
        return this.ppts.home!=null ? this.ppts.home : WebGuiConfiguration.DEFAULT_HOMEPAGE;
    }

    isStarted():boolean {
        return this.started;
    }
}