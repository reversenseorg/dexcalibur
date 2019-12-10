

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

const RequestHelperTYPES = {
    T_NODE: 1,
    T_LITTERAL: 2,
    T_OPMODE: 3,
    T_MODIFIER: 4
};

const RequestHelperOPMODE =  {
    equal: {
        text: "equals"
    },
    match: {
        text: "match RegExp"
    },
    hasModifier: {
        text: "is private/..."
    },
};

const RequestHelperMENU = {
    modifiers: {
        "public": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "protected": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "private": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "native": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "volatile": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "static": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
        "transient": {
            type: RequestHelperTYPES.T_MODIFIER,
            token: "signature"
        },
    }
};

const RequestHelperMAP =  {
    method: {
        "by name": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "name",
        },
        "by args type": {
            type: RequestHelperTYPES.T_NODE,
            ref: "class",
            token: "args"
        },
        "by return type": {
            type: RequestHelperTYPES.T_NODE,
            ref: "class",
            token: "ret"
        },
        "by enclosing class": {
            type: RequestHelperTYPES.T_NODE,
            ref: "class",
            token: "enclosingClass"
        },
        "by class used": {
            type: RequestHelperTYPES.T_NODE,
            ref: "class",
            token: "_useClass"
        },
        "by method called": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "_useMethod"
        },
        "by field used": {
            type: RequestHelperTYPES.T_NODE,
            ref: "field",
            token: "_useField"
        },
        "called by": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token:"_callers"
        },
        "by tag": {
            type: RequestHelperTYPES.T_LITTERAL,
            token:"tags"
        },
        "by modifiers (private/native/...)": {
            type: RequestHelperTYPES.T_LITTERAL,
            token:"tags"
        }
    },
    class: {
        "by interface": {
            type: RequestHelperTYPES.T_NODE,
            token: "implements",
            ref: "class"
        },
        "by super": {
            type: RequestHelperTYPES.T_NODE,
            token: "extends",
            ref: "class"
        },
        "FQCN is ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "name"
        },
        "simpleName is ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "simpleName"
        },
        package: {
            type: RequestHelperTYPES.T_NODE,
            ref: "package",
            token: "package"
        },
        "declaring Method": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "method"
        },
        "declaring Field": {
            type: RequestHelperTYPES.T_NODE,
            ref: "field",
            token: "field"
        },
        "called by": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "_callers"
        },
        "tagged ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "tags"
        }
    },
    field: {
        "where sgtters ... ": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "_getters"
        },
        "where setters ... ": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "_setters"
        },
        "name is ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "name"
        },
        "aliased ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "alias"
        },
        "signature": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "signature"
        },
        "where type ...": {
            type: RequestHelperTYPES.T_NODE,
            ref: "class",
            token: "type"
        },
        "tagged ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "tags"
        }
    },
    string: {
        "by value": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "value"
        },
        "by tag": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "tags"
        },
        "by instruction": {
            type: RequestHelperTYPES.T_NODE,
            token: "instr",
            ref: "instruction"
        },
    },
    array: {
        "by tag": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "tags"
        },
    },
    call: {
        "by caller": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "caller"
        },
        "by called": {
            type: RequestHelperTYPES.T_NODE,
            ref: "method",
            token: "calleed"
        },
        "by instruction": {
            type: RequestHelperTYPES.T_NODE,
            ref: "instruction",
            token: "instr"
        }
    },
    instruction: {
        "by value": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "raw"
        },
        "by basic-block offset": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "bb"
        },
        "tagged ...": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "tags"
        },
        "by opcode": {
            type: RequestHelperTYPES.T_NODE,
            token: "opcode",
            ref: "opcode"
        }
    },
    opcode: {
        "where basic-block relative offset == ": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "offset"
        },
        "where smali == ": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "raw"
        },
        "where basic-block offset == ": {
            type: RequestHelperTYPES.T_LITTERAL,
            token: "bb"
        }
    }
};

/*


    static OPE = {
        "has tag": {},
        "is": {},
    };
    */
class RequestHelper
{
    constructor(pJQuery, pElement){
        this.state = [];
        this.$ = pJQuery;
        this.view = pElement;
        this._view = null;
        this._curr = null;
        this.listeners = {
            execute: null
        };

        this.init();
    }

    updateListener(){
        let self = this;
        this.$(`.${this.view}-choice`).click(function(e){

            let val = e.currentTarget.getAttribute("choiceValue");

            self.$(`#${self.view}-choicelist`).remove();
            
            
            

            if(e.currentTarget.getAttribute("rootChoice")=="1"){
                self._view.append(
                    `<div class="dxc-inline-ctn dxc-badge-list"><span class="badge badge-pill badge-primary" class="${self.view}-choosen" choiceValue="${val}">${val}</span></div>`
                );
                self.choose(val, true);
            }else{
                self._view.append(
                    `<div class="dxc-inline-ctn dxc-badge-list"><span class="badge badge-pill badge-purple" class="${self.view}-choosen" choiceValue="${val}">${val}</span></div>`
                );
                self.choose(val);
            }

            //self.state.push(val);
            self.render();
        });
        this.$(`.${this.view}-run`).click(function(e){

            self.data = self.$(`#${self.view}-data`).val();
            self.ppts = {
                nocase: self.$(`#${self.view}-case`).is(":checked")? false : true, 
                apponly: self.$(`#${self.view}-apponly`).is(":checked")? true : false,
            }
            //self._view.remove(); 
            //self._view.css("display","none");

            self.execute();
        });
        this.$(`#${this.view}-data`).keypress( function (e) {
            var key = e.which || e.keyCode;
            if (key === 13) {
                self.$(`.${self.view}-run`).trigger('click');
            }   
        });
    }

    onCancel(){

    }

    onExecute(pCallback){
        this.listeners.execute = pCallback;
    }

    init(){
        let self = this;
        this._view = this.$('#'+this.view).last();
        this.updateListener();
    }

    reset(){
        this.state = [];
        this._curr = null;
        this._view.empty();
    }

    choose(pNode, pRoot=false){


        let node = this._curr.nodes;
        let o=null;
        
        if(pRoot==true){
            this._curr = { type:RequestHelperTYPES.T_NODE, root:false, current:pNode, nodes:RequestHelperMAP[ pNode ]}; 
            o = RequestHelperMAP[ pNode ]; 
            o.token = pNode;  
            this.state.push(o);
        }else if(node[pNode].type == RequestHelperTYPES.T_NODE || pRoot==true){
            this._curr = { type:RequestHelperTYPES.T_NODE, root:false, current:pNode, nodes:RequestHelperMAP[ node[pNode].ref ]};
            this.state.push(node[pNode]);
        }else{
            this._curr = { type:RequestHelperTYPES.T_LITTERAL, root:false };
            this.state.push(node[pNode]);
        }

        return null;
    }

    execute(){
        let cmd="",end=false;

        cmd = this.state[0].token+'("';

        for(let i=1; i<this.state.length; i++){
            if(i>1) cmd+=".";
            if(end) alert("error in RequestHelper.execute()");

            switch(this.state[i].type)
            {
                case RequestHelperTYPES.T_NODE:
                    cmd += this.state[i].token;
                    break;
                case RequestHelperTYPES.T_LITTERAL:
                    cmd += this.state[i].token+":"+this.data;
                    break;
            }
        }


        this.listeners.execute(`${this.ppts.nocase?"nocase().":""}${cmd}")${this.ppts.apponly?'.filter("tags:ds")':""}`);
    }

    render(){
        let body = '';

        if(this._curr == null){
            body = `<div id="${this.view}-choicelist"><ul class="dxc-badge-list">`;
            for(let i in RequestHelperMAP){
                body += `<li><span class="badge badge-pill badge-primary ${this.view}-choice" rootChoice="1" choiceValue="${i}">${i}</span></li>`;
            }
            this._view.append(body+`</ul></div>`);
            this._curr = { type:RequestHelperTYPES.T_NODE, root:true, nodes:RequestHelperMAP };
            this.updateListener();
        }else if(this._curr.type == RequestHelperTYPES.T_NODE){
            body = `<div id="${this.view}-choicelist"><ul class="dxc-badge-list">`;
            for(let i in this._curr.nodes){
                body += `<li><span class="badge badge-pill badge-purple ${this.view}-choice" rootChoice="0" choiceValue="${i}">${i}</span></li>`;
            }
            this._view.append(body+`</ul></div>`);
            this.updateListener();
        }else{
            let path = "";
            this.state.map(function(o,k){

                path += o.token+" &gt; ";
            })
            
            this.$(`#${this.view} > div.dxc-badge-list`).each(function(pOffset,pEl){
                pEl.remove();
            });

            this._view.append(`<div id="${this.view}-choicelist" class="input-group input-group-sm mb-3">
                <div class="input-group-prepend">
                    <span class="input-group-text border-dark badge-pink"><i>${path}</i></span>
                    <span class="input-group-text">
                        <input type="checkbox" checked id="${this.view}-case" value="1" aria-label="case sensitive search">
                        <span>&nbsp;Case sensitive</span>
                    </span>
                    <span class="input-group-text">
                        <input type="checkbox" id="${this.view}-apponly" value="1" aria-label="app only search">
                        <span>&nbsp;App only</span>
                    </span>
                </div>  
                <input type="text" class="form-control"  width="20em" id="${this.view}-data" aria-label="Search pattern" aria-describedby="request-helper-btn1">
                <div class="input-group-append">
                    <button class="btn btn-primary btn-sm ${this.view}-run" type="button" id="request-helper-btn1"><span class="fa fa-search"></span>&nbsp;search</button>
                </div>
            </div>`);

            this.$(`#${this.view}-data`).focus();
            this.updateListener();

        }

        return this.$;
    }

}

class RequestHelperChoice
{
    constructor(pRef){
        this.choices = 0;//RequestHelper.MAP[pRef];
    }
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
        finderLink: function(pType, pName){
            return "/pages/finder.html?"+pType+"="+btoa(encodeURIComponent(pName))+"";
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
        },
        list: function(success=null, error=null){
            $.ajax("/api/device", {
                method: "get",
                data: {
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
        autoSave: function(status, success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "autosave",
                    status: status,
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
        autosaveStatus: function(success, error){
            $.ajax("/api/inspectors/saver", {
                method: "get",
                data: {
                    action: "autosave-status",
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
        start: function(pType, callbackSuccess, callbackErr){
            let o = {_t: (new Date()).getTime()};
            for(let i in pType) o[i]=pType[i];


            $.ajax('/api/probe/start',{
                method: 'post',
                data: o,
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
        },
        intent: {
            send: function(data,callbacks){
                let postdata = {_t: (new Date()).getTime()};
                for(let i in data) postdata[i] = data[i];

                //DexcaliburAPI.ui.alert.warning("Sending intent ...");

                $.ajax('/api/intent/send',{
                    method: 'post',
                    data: postdata,
                    statusCode: callbacks
                });
            }
        }
    },
    context: {
        tags: []
    },
    util: {
        encodeLocationAction: function(val){
            return btoa(encodeURIComponent(val));
        },
        decodeLocationAction: function(val){
            return decodeURIComponent(atob(val))
        },
        onLocation: function( locationObj, actions){

            let q = locationObj.href.indexOf('?');
            if(q==-1){
                locationObj.query = "";
            } else{
                locationObj.query = location.href.substr(
                    q+1,
                    locationObj.href.length-q-1-locationObj.hash.length
                );                
            }
        
            if(locationObj.query.length>0){
                let o = locationObj.query.indexOf("=");
                let tag = locationObj.query.substr(0, o);

                if(actions[tag]!=null){
                    actions[tag]( locationObj.query.substr(o+1));
                }
            }
        }
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