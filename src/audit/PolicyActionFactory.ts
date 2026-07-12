/*
 *
 *     Reversense platform / dexcalibur-ts :  Reversense is an automated reverse engineering and analysis platform
 *     focused on security, privacy, quality, accessibility and safety assessment of software, including mobile app and firmware.
 *     Copyright (C) 2026  Reversense SAS
 *
 *     This program is free software: you can redistribute it and/or modify
 *     it under the terms of the GNU Affero General Public License as published
 *     by the Free Software Foundation, either version 3 of the License, or
 *     (at your option) any later version.
 *
 *     This program is distributed in the hope that it will be useful,
 *     but WITHOUT ANY WARRANTY; without even the implied warranty of
 *     MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *     GNU Affero General Public License for more details.
 *
 *     You should have received a copy of the GNU Affero General Public License
 *     along with this program.  If not, see <https://www.gnu.org/licenses/>.
 *
 */

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