

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

var DexcaliburAPI = {
    ui: {
        tags: {},
        badge: {
            style: {
                purple: 'purple',       
                pink: 'pink',  
                primary: 'primary',         
                info: 'info',         
                warning: 'warning',         
                danger: 'danger',         
                secondary: 'secondary'          
            },
        }
    },
    search: {},
    analyzer: {},
    hook: {},
    disass: {},
    context: {
        tags: []
    }
};

DexcaliburAPI.ui.tags.colorCode = {
    hash: DexcaliburAPI.ui.badge.style.primary,
    sha: DexcaliburAPI.ui.badge.style.primary,
    md5: DexcaliburAPI.ui.badge.style.primary,
    ascii: DexcaliburAPI.ui.badge.style.info,
    key: DexcaliburAPI.ui.badge.style.pink,
    rsa: DexcaliburAPI.ui.badge.style.pink,
    // invoked dynamically
    id: DexcaliburAPI.ui.badge.style.purple,
    // loaded from an external file
    led: DexcaliburAPI.ui.badge.style.warning
};

DexcaliburAPI.ui.badge.make =  function(color,data){
    if(DexcaliburAPI.ui.badge.style[color]==null) console.error("Given color not exists : ",color);

    return '&nbsp;<a class="badge badge-'+DexcaliburAPI.ui.badge.style[color]+'">'+htmlEncode(data)+'</a>'; 
};

DexcaliburAPI.ui.findColorCode = function(tagname){
    for(let i in DexcaliburAPI.ui.tags.colorCode) 
        if(tagname.indexOf(i)>-1) 
            return DexcaliburAPI.ui.tags.colorCode[i];
    return null;
}

DexcaliburAPI.search.request = function(pattern,callbacks){
    json = JSON.stringify({ search: val });

    $.ajax('../api/finder',{
        method: 'get',
        data: {
            search: encodeURIComponent(btoa(encodeURIComponent(val))),
            _t: (new Date()).getTime()
        },
        statusCode: callbacks
    });
}

DexcaliburAPI.analyzer.editAlias = function(type, subject, alias, callbacks){
    if(type=="meth"){
        url = "../api/method/"+subject;
    }else if(type=="field"){
        url = "../api/field/"+subject;
    }else if(type=="class"){
        url = "../api/class/"+subject;
    }
    else
        return;

    $.ajax(
        url,
    {
        method: "put",
        data: { alias:alias },
        statusCode: callbacks
    });    
}

DexcaliburAPI.analyzer.getTags = function(callback){
    $.ajax(
        "../api/tags",
        {
            method:"get",
            statusCode: {
                200: function(data){
                    let tags = JSON.parse(data), cc=null;
                    for(let i=0; i<tags.length;i++){
                        cc = DexcaliburAPI.ui.findColorCode(tags[i]);
                        if(cc==null) console.log("Need more color code"); 
                        for(let j=0; j<tags[i].length;j++){
                            DexcaliburAPI.context.tags.push(tags[i][j]) = tags[i];
                        }
                    }
                }
            }
        }
    );
}

DexcaliburAPI.disass.method = function(signature, callback){
    $.ajax(
        "../api/method/disass/"+encodeURIComponent(btoa(encodeURIComponent(signature))),
        {
            method: "get",
            statusCode: callback
        });
}
/*
DexcaliburAPI.hook.countHookable = function(pattern,callbacks){
    $("")
}


DexcaliburAPI.hook.addProbe = function(pattern,callbacks){
    $("")
}*/