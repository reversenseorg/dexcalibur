import {ActionType, PolicyAction} from "./PolicyRule.js";



export class PolicyActionFactory {

    static ALL = {
        [ActionType.SEND_EMAIL]: {
            type: ActionType.SEND_EMAIL,
            name:"Send email",
            description: "Send email when condition is reached",
            opts: {
                emailAddress: null
            }
        },
        [ActionType.REPORT_WARNING]: {
            type: ActionType.REPORT_WARNING,
            name:"Add warning",
            description: "Add warning to report",
            opts: {
                color: null,
                style: "danger",
            }
        }
    };

    /**
     *
     */
    static listActions():PolicyAction[] {
        return Object.values(PolicyActionFactory.ALL);
    }

    /**
     *
     * @param pName
     */
    static createAction(pName:ActionType):PolicyAction {
        return JSON.parse(JSON.stringify(PolicyActionFactory.ALL[pName]));
    }
}