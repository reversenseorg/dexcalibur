import EventRecordSession from "./EventRecordSession.js";
import InputSubsystem from "./InputSubsystem.js";

export default class PhysicalEventChannel {

    records: EventRecordSession[];
    subsystemType: InputSubsystem;

    constructor( pConfig:any = null) {
        if(pConfig!=null) for(const i in pConfig) this[i]=pConfig[i];
    }

    startRecord(): EventRecordSession {
        let newRecord = new EventRecordSession();
        this.records.push(newRecord);
        return newRecord;
    }
}