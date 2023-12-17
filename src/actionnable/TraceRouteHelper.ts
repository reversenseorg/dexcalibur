import * as _os_ from "os";
import Util from "../Utils.js"
import {IpVersion} from "../network/NetworkInterface.js";
import {Nullable} from "../core/IStringIndex.js";

export interface Trace {
    ip:string;
    ipVersion:IpVersion
}

interface RouteNode {
    step:number;
    domain:Nullable<string>;
    ip:Nullable<string>;
    time1:Nullable<number>;
    time2:Nullable<number>;
    time3:Nullable<number>;
}

export class TraceRouteHelper {

    constructor() {

    }

    private _parseRouteLine(pLine:string, pCurrStep:number = 0):RouteNode {
        const node:RouteNode = { step:-1, domain:null, ip:null, time1:-1, time2:-1, time3:-1, };
        const parts = pLine.split("  ");


        if(/^(\d+)$/.test(parts[0])){
            node.step = parseInt(parts[0]);
            parts.shift();
        }else{
            node.step = pCurrStep;
        }

        if(parts.length > 1){
            const host = parts.shift();
            const hosts = host.split(" ");
            if(/\(.+\)/.test(hosts[1])){
                node.ip = hosts[1].substr(1,hosts[1].length-2);
            }
            node.domain = hosts[0];

            let times:string[];
            for(let i=0; i<parts.length; i++){
                times = parts[i].split(" ");
                node['time'+(i+1)] = times[0];
            }
        }else{
            // Case * * *

            node.domain = '*';
            node.ip = null;
        }

        return node;
    }

    /**
     *
     */
    trace(pHostname:string): any[] {
        let out:string, trace:any[] = [];
        try{
            out = Util.execSync("traceroute "+pHostname);
            trace = [];
            const lines = out.split(_os_.EOL);
            let currStepNb = 0;
            lines.shift();
            lines.map( (vLine)=>{
                if(vLine.match(/^[\s\t]*$/)) return;
                const route = this._parseRouteLine(vLine, currStepNb);
                currStepNb = route.step
                trace.push(route);
            });
        }catch(err){
            console.error(err);
        }
        return trace;
    }
}