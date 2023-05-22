import AssuranceModel, {AssuranceModelType} from "../common/AssuranceModel.js";
import SecurityModel from "../common/SecurityModel.js";
import PrivacyModel from "../common/PrivacyModel.js";


/**
 * To create/edit assurance model
 */
export class AssuranceModelEditor {

    constructor() {

    }

    newModel( pType:AssuranceModelType, pConfig:any):AssuranceModel {
        let model:AssuranceModel;
        switch (pType){
            case AssuranceModelType.SECURITY:
                model = new SecurityModel(pConfig);
                break;
            case AssuranceModelType.PRIVACY:
                model = new PrivacyModel(pConfig);
                break;
            case AssuranceModelType.QUALITY:
            case AssuranceModelType.ECOLOGY:
            default:
                throw new Error("Assurance model type not supported");
                break;
        }

        return model;
    }
}