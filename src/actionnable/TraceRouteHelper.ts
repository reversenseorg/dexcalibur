import * as _os_ from "os";
import Util from "../Utils.js"
import {IpVersion} from "../network/NetworkInterface.js";

export interface Trace {
    ip:string;
    ipVersion:IpVersion
}

export class TraceRouteHelper {

    constructor() {

    }

    /**
     *
     */
    trace(pUrl:string): Trace[] {
        let out:string, domain:string, trace:Trace[] = [];
        try{
            domain = (new URL(pUrl)).hostname;
            out = Util.execSync("traceroute "+domain);
            const lines = out.split(_os_.EOL);
            console.log(lines);

        }catch(err){

        }
        return trace;
    }
}