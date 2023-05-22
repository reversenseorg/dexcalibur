import Threat from "./Threat.js";
import CodeThreat, {CodeThreatOptions} from "./CodeThreat.js";


export class ThreatFactory {

    static newCodeThreatByTechnic( pTechnicUID:string, pConfig:CodeThreatOptions):CodeThreat {
        return new CodeThreat({
            ...pConfig,
            uid: "att&ck:"+pTechnicUID+":"+pConfig.id
        })
    }

}