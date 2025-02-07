import {Policy, PolicyOptions} from "../../Policy.js";
import {TagUUID} from "@dexcalibur/dexcalibur-orm";


export class TrackersConsentPolicy extends Policy {

    name = "Trackers consent";

    requireConsent:TagUUID[] = [];

    constructor(pOptions:PolicyOptions) {
        super(pOptions);

        this.name = "Trackers consent";
    }

    addCategory
}