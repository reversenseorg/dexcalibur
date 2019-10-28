

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


class FutureHook
{
    constructor(){
        this.before = false;
        this.after = false;
        this.replace = false;
        this.breakpointID = null;
        this.codeAfter = null;
        this.codeBefore = null;
        this.codeReplace = null;
    }

    init(obj){
        for(let k in obj){
            if(this[k]!==undefined)
                this[k] = obj[k];
        }
        return this;
    }

    setBefore(code=null){
        this.before = false;
        this.codeBefore = code;
    }

    setAfter(code=null){
        this.after = false;
        this.codeAfter = code;
    }

    setReplace(code=null){
        this.replace = false;
        this.codeReplace = code;
    }

    setBreakpointID(id){
        this.breakpointID = id;
    }
}


function Wexcalibur(){
    this.codeReg = new WexRegister("code-","");    
}

function encodeURLParam(val){
    return encodeURIComponent(btoa(encodeURIComponent(val)));
}


var DexcaliburAPI = {
    ui: {
        __state: {
            rendered: []
        },
        isRendered: function(id){
            return DexcaliburAPI.ui.__state.rendered.indexOf(id);
        },
        render: function(id){
            $(id).css("display","block");
            DexcaliburAPI.ui.__state.rendered.push(id);
        },
        hide: function(id){
            $(id).css("display","none");
            let r = [];
            for(let i=0; i<DexcaliburAPI.ui.__state.rendered.length; i++){
                if(DexcaliburAPI.ui.__state.rendered[i]===id) continue;
                r.push(DexcaliburAPI.ui.__state.rendered[i]);
            }
            DexcaliburAPI.ui.__state.rendered = r;
        }, 
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
        },
        alert: {
            state: {
                init: false
            },
            init: function(){
                if($('#alertcontainer').length===0){
                    $('<div class="row"><div class="col-lg-12" id="alertcontainer"></div></div>').insertBefore('#page-wrapper');
                    DexcaliburAPI.ui.alert.state.init = true;
                }
            },
            requireOnceAlert: function(id, type, msg, encode){
                if(!DexcaliburAPI.ui.alert.state.init)
                    DexcaliburAPI.ui.alert.init();

                // test if the alert has been already inserted
                if($('#'+id).length===0){
                    let alertBody = `
                    <div class="alert alert-`+type+` alert-dismissible fade show" role="alert">
                        <p id="`+id+`">`+msg+`<p>
                        <button type="button" class="close" data-dismiss="alert" aria-label="Close">
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>`;
                    $(alertcontainer).append(alertBody);
                } 
                if(encode)
                    $("#"+id).html(DexcaliburAPI.ui.htmlEncode(msg));
                else
                    $("#"+id).html(msg);
            },
            error: function(msg, encode=true){
                DexcaliburAPI.ui.alert.requireOnceAlert("dxc-alert-error", "danger", msg, encode);
            },
            success: function(msg, encode=true){
                DexcaliburAPI.ui.alert.requireOnceAlert("dxc-alert-success", "success", msg, encode);
            },
            warning: function(msg, encode=true){
                DexcaliburAPI.ui.alert.requireOnceAlert("dxc-alert-warning", "warning", msg, encode);
            }
        }
    },
    keyshortcut: {
        init: function(){
            //$(document).
        }
    }, 
    configMgt: {
        getConfiguredBridges: function(){
            $.ajax("/api/config/bridges", {
                method: "get",
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: {
                    200: function(data,err){
                        success(data);
                    },
                    404: function(data,err){
                        error(data);
                    }
                }
            })
        }
    },
    device: {
        selectAsDefaultDevice: function(id, success=null, error=null){
            $.ajax("/api/device/setDefault", {
                method: "post",
                data: {
                    uid: id,
                    _t: (new Date()).getTime()
                },
                statusCode: {
                    200: function(data,err){
                        if(success != null) success(data);
                    },
                    404: function(data,err){
                        if(error != null) error(data);
                    }
                }
            })
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
    project: {
        save: function(success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "save",
                    _t: (new Date()).getTime()
                },
                statusCode: {
                    200: function(data,err){
                        success(data);
                    },
                    404: function(data,err){
                        error(data);
                    }
                }
            })
        },
        open: function(success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "open",
                    _t: (new Date()).getTime()
                },
                statusCode: {
                    200: function(data,err){
                        success(data);
                    },
                    404: function(data,err){
                        error(data);
                    }
                }
            });
        }
        /*
        export: function(data,success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "open"
                },
                statusCode: {
                    200: function(data,err){
                        success(data);
                    },
                    404: function(data,err){
                        error(data);
                    }
                }
            });
        },
        import: function(file,success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "open"
                },
                statusCode: {
                    200: function(data,err){
                        success(data);
                    },
                    404: function(data,err){
                        error(data);
                    }
                }
            });
        }*/
    },
    hook: {
        manager: {
            current: null
        },
        newFutureHook: function(config={}){
            DexcaliburAPI.hook.manager.current = (new FutureHook()).init(config); 
        },
        clearFutureHook: function(){
            DexcaliburAPI.hook.manager.current = null;
        },
        start: function(callbackSuccess, callbackErr){
            $.ajax('/api/probe/start',{
                method: 'post',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: {
                    200: callbackSuccess,
                    404: callbackErr
                }
            });
        },
        enableAll: function(callbacks){
            $.ajax('/api/hook/enable/all',{
                method: 'put',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        disableAll: function(callbacks){
            $.ajax('/api/hook/disable/all',{
                method: 'put',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        enable: function(hookID, callbacks){
            $.ajax('/api/hook/enable/'+encodeURLComponent(hookID),{
                method: 'put',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        disable: function(hookID, callbacks){
            $.ajax('/api/hook/disable/'+encodeURLComponent(hookID),{
                method: 'put',
                data: {
                    _t: (new Date()).getTime()
                },
                statusCode: callbacks
            });
        },
        newHookModal: function(id){
            //
        }
    },
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
                get: "/api/manifest/permission/",
            },
            ui: {
                protectionBadge: {
                    normal: '<span class="badge badge-secondary">normal</span>',
                    dangerous: '<span class="badge badge-danger">dangerous</span>',
                    special: '<span class="badge badge-warning">special</span>',
                    signature: '<span class="badge badge-info">signature</span>'
                }
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
            get: function(name, callbacks){
                $.ajax(DexcaliburAPI.manifest.permissions.URI.get+name,{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                })
            }
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
                $.ajax('/api/manifest/activity/'+encodeURIComponent(name),{
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
            },
            get: function(name, callbacks){
                $.ajax('/api/manifest/provider/'+encodeURIComponent(name),{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
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
            },
            get: function(name, callbacks){
                $.ajax('/api/manifest/receiver/'+encodeURIComponent(name),{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
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
            },
            get: function(name, callbacks){
                $.ajax('/api/manifest/service/'+encodeURIComponent(name),{
                    method: 'get',
                    data: {
                        _t: (new Date()).getTime()
                    },
                    statusCode: callbacks
                });
            },
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

    return '&nbsp;<span class="badge badge-pill badge-'+DexcaliburAPI.ui.badge.style[color]+'">'+DexcaliburAPI.ui.htmlEncode(data)+'</span>'; 
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