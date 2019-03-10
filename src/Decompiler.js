function Decompiler(){

}
Decompiler.prototype.cmp = function(instr){
    
}
Decompiler.prototype.math = function(instr){

}
Decompiler.prototype.decompile = function(instr){
    switch(instr.opcode.type){
        case CONST.INSTR_TYPE.CMP:
            return this.cmp(instr);
        case CONST.INSTR_TYPE.MATH_CAST:
            return this.cast(instr);
        case CONST.INSTR_TYPE.MATH:
            return this.math(instr);
        default:
            return "// "+instr._raw;
    }
};

