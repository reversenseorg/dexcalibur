import Threat from "./Threat.js";
import SecurityThreat from "./SecurityThreat.js";


export default class SecurityThreatModel extends Threat {

    threats:SecurityThreat[];

    constructor(pConfig:any=null) {
        super(pConfig);
    }
}