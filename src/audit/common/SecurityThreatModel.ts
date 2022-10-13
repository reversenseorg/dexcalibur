import Threat from "./Threat";
import SecurityThreat from "./SecurityThreat";


export default class SecurityThreatModel extends Threat {

    threats:SecurityThreat[];

    constructor(pConfig:any=null) {
        super(pConfig);
    }
}