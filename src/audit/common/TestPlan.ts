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