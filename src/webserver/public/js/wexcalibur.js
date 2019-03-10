

function WexRegister(prefix,suffix){
    this.db = [];
    this.counter = 0;
    this.prefix = prefix;
    this.suffix = suffix;

    return this;
}
WexRegister.prototype.next = function(){
    this.counter += 1;
    let next = this.prefix+this.counter+this.suffix;
    this.db.push(next);

    return next;
}
WexRegister.prototype.last = function(){
    return this.db[this.db.length-1];
}



function DisassembyViewer(JQuery){
    this._jquery = JQuery;

    this.elem = null;
    this.asm = null;
    this.opts = {
        showLine: true
    };
    this.view = {
        body: null,
        lines: null,
        created: false
    };
}
DisassembyViewer.prototype.setOpt = function(name,value){
    this.opts[name] = value;
    return this;
}
DisassembyViewer.prototype.appendLine = function(asm){
    for(let i=0; i<asm.length ; i++){
        this.asm.push(asm[i]);
    }
    return this;
}
DisassembyViewer.prototype.appendBBlock = function(asm){
    for(let i=0; i<asm.length ; i++){
        this.asm.push(asm[i]);
    }
    return this;
}
DisassembyViewer.prototype.renderLine = function(elem){

    for(let i=0; i<this.asm.length; i++){

    }
    return this;
}
DisassembyViewer.prototype.init = function(elem){
    if(this.view.created == false){
        this.view.body = this._jquery.cre
    }
}
DisassembyViewer.prototype.render = function(elem){
    this.init(elem);

    for(let i=0 ; i<this.asm.length; i++){

    }
    return this;
}



function Wexcalibur(){
    this.codeReg = new WexRegister("code-","");    
}