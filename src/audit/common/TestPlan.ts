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

import { ControlNode } from "./AssuranceModel.js";

export enum TestType {
    PT="PT",
    VT="VT",
    STATIC_SCAN="sast",
    DYN_SCAN="dast",
    TAINT="taint",
    SYMEXEC="symexec",
    IAST="iast"
}

export interface TestStep {
    type: TestType;
    controls: ControlNode[];
}


export class TestPlan {

    steps: TestStep[] = [];

    currStep:number = -1;

    constructor() {

    }

    addStep( pType:TestType, pControls:ControlNode[] ):void {
        this.steps.push({
            type: pType,
            controls: pControls
        });
    }

    getSteps():TestStep[] {
        return this.steps;
    }

    nextStep():TestStep {
        this.currStep++;
        return this.steps[this.currStep];
    }

    execute(pCallback:((vStep:TestStep)=>boolean)):void {
        let step:TestStep;
        while((step = this.nextStep())!=null) {
            if (pCallback.call(null, step) == false) {
                break;
            }
        }
        return ;
    }

    async executeAsync(pCallback:((vStep:TestStep)=>Promise<boolean>)):Promise<void> {
        let step:TestStep;
        while((step = this.nextStep())!=null) {
            if (await pCallback.call(null, step) == false) {
                break;
            }
        }
        return ;
    }

    reset():void {
        this.currStep = -1;
    }
}