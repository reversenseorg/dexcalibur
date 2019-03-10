
function StatedFlowMoment(instruction, state){
    this.stack = null;
    this.instruction = instruction;
    this.state = state;
}
StatedFlowMoment.prototype.perform = function(){

    let state = this.instruction.performWith(this.state);
    return new StatedFlowMoment(this.instruction.next(), state); 
}

function ExpectedFlowMoment(instruction, assertion){
    this.instruction = instruction;
    this.assertion = assertion;
}
ExpectedFlowMoment.prototype.isValid = function(){
    return this.assertion(this);
}



function Flow(ctx){
    this.startingPoint = null;
    this.endingPoint = null;
    this.context = ctx;
    
    this.states = [];
    this.graph = {};

    return this;
}

Flow.prototype.setStartingPoint = function(statedFlowMoment){
    this.startingPoint = statedFlowMoment;
}
Flow.prototype.setEndingPoint = function(expectedFlowMoment){
    this.endingPoint = expectedFlowMoment;
}
Flow.prototype.run = function(){
    let state = this.startingPoint;
    do{
        state = state.run()
    }
    while(state.hasNext())
;}