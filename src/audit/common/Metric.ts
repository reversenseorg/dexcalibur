/**
 * Represent a metric in a dashboard
 * @class
 */
export class Metric {


    name = "";

    description = "";

    unit:any = "";

    constructor(pConfig:any) {
        for(const i in pConfig){
            this[i] = pConfig[i];
        }
    }

}