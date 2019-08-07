

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



class DexcaliburGrid
{
    constructor(elemnt, width, id){
        this.id = id+"-";
        this.elem = elemnt;
        this.ctr = 0;
        this.rowCtr = 0;
        this.with = width;
    }

    addRow(){
        this.elem.append('<div class="row" id="'+this.id+'-row-'+this.ctr+'"></div>');
    }

    appendBlock(){

    }
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

function encodeURLParam(val){
    return encodeURIComponent(btoa(encodeURIComponent(val)));
}


var DexcaliburAPI = {
    ui: {
        htmlEncode: (text)=>{
            return $('<div />').text(text).html();
        },
        tags: {},
        badge: {
            style: {
                purple: 'purple',       
                pink: 'pink',  
                primary: 'primary',         
                info: 'info',         
                warning: 'warning',         
                danger: 'danger',         
                secondary: 'secondary',      
                success: 'success'          
            },
        }
    },
    search: {
        makeClassLink: function(signature){
            return "<a href='/pages/finder.html?class="+btoa(encodeURIComponent(signature))+
                "'>"+DexcaliburAPI.ui.htmlEncode(signature)+"</a>";
        },
        makeMethodLink: function(signature){
            return "<a href='/pages/finder.html?method="+btoa(encodeURIComponent(signature))+
                "'>"+DexcaliburAPI.ui.htmlEncode(signature)+"</a>";
        },
        makeFieldLink: function(signature){
            return "<a href='/pages/finder.html?field="+btoa(encodeURIComponent(signature))+
                "'>"+DexcaliburAPI.ui.htmlEncode(signature)+"</a>";
        }
    },
    analyzer: {},
    hook: {},
    disass: {},
    editor: {
        __session: {},
        newCodeEditor: function(id, mode, theme="ace/theme/monokai", options=null){
            let editor = ace.edit(id);
            editor.setTheme(theme); 
        
            if(options == null)
                editor.setOptions({
                    maxLines: 80, 
                    fontSize: "10pt"
                });
            else
                editor.setOptions(options);

            // "ace/mode/xml"
            editor.session.setMode(mode);
            DexcaliburAPI.editor.__session[id] = editor;
        },
        getEditor: function(id){
            return DexcaliburAPI.editor.__session[id];
        },
        getContentOf: function(id){
            let e = DexcaliburAPI.editor.__session[id];
            return e.session.doc.$lines;
        }
    },
    manifest: {
        URI: {
            content: "/api/manifest/content"
        },
        getContent: function(callbacks){
            $.ajax('/api/manifest/content',{
                method: 'get',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        updateContent: function(content, callbacks){
            $.ajax('/api/manifest/content',{
                method: 'put',
                data: {
                    data:content,
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        permissions: {
            URI: {
                list: "/api/manifest/permissions",
                get: "/api/manifest/permission",
            },
            list: function(callbacks){
                $.ajax('/api/manifest/permissions',{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
        },
        activities: {
            URI: {
                list: "/api/manifest/activities",
                get: "/api/manifest/activity",
            },
            list: function(callbacks){
                $.ajax('/api/manifest/activities',{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
            get: function(name, callbacks){
                $.ajax('/api/manifest/activity/'+encodeURLParam(name),{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
        },
        providers: {
            URI: {
                list: '/api/manifest/providers'
            },
            list: function(callbacks){
                $.ajax('/api/manifest/providers',{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            }
        },
        receivers: {
            URI: {
                list: '/api/manifest/receivers'
            },
            list: function(callbacks){
                $.ajax('/api/manifest/receivers',{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            }
        },
        services: {
            URI: {
                list: '/api/manifest/services'
            },
            list: function(callbacks){
                $.ajax('/api/manifest/services',{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            }
        }
    },
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

DexcaliburAPI.ui.badge.make =  function(color,data,link=null,attr=null){
    if(DexcaliburAPI.ui.badge.style[color]==null) console.error("Given color not exists : ",color);

    return '&nbsp;<a class="badge badge-'+DexcaliburAPI.ui.badge.style[color]+'">'+DexcaliburAPI.ui.htmlEncode(data)+'</a>'; 
};

DexcaliburAPI.ui.findColorCode = function(tagname){
    for(let i in DexcaliburAPI.ui.tags.colorCode) 
        if(tagname.indexOf(i)>-1) 
            return DexcaliburAPI.ui.tags.colorCode[i];
    return null;
}

DexcaliburAPI.ui.newGrid = function(width){
    return new DexcaliburGrid(width);
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