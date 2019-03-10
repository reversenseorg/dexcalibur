const HOOK = require("../HookManager.js");
const CLASS = require("../CoreClass.js");

var DeObfuscationScanner = new HOOK.HookSet({
    id: "DeObfuscation",
    name: "De-obfuscation",
    description: "Update the application representation with dynamic discovered definition"
});

DeObfuscationScanner.addHookShare({
    virtualStackTrace: [],
    buildingInvoke: {
        class: null,
        method: null,
        args: null
    }
});

// add code before hooks 
// add @@__CTX__@@_ before each symbol

DeObfuscationScanner.addPrologue(`

    var @@__CTX__@@_ThreadDef = Java.use('java.lang.Thread');

    var @@__CTX__@@_ThreadObj = @@__CTX__@@_ThreadDef.$new();


    function @@__CTX__@@_stackTrace() {
        var stack = @@__CTX__@@_ThreadObj.currentThread().getStackTrace();
        var msg = "";
        for (var i = 0; i < stack.length; i++) {
            msg = msg + i + " => " + stack[i].toString()+"<br>&nbsp;&nbsp;";
        }
        return msg;
    }
`);

/*
DeObfuscationScanner.addIntercept({
    when: HOOK.BEFORE,
    method_signature: "dalvik.system.DexFile.loadClass(<java.lang.String><java.lang.ClassLoader>)<java.lang.Class>",
    interceptAfter: `
        var arg_cls = Java.cast(arguments[0], Java.use("java.lang.String"));
        var ret_cls = Java.cast(ret, Java.use("java.lang.Class"));
        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: arg_cls,
            after: true, 
            msg: "DexFile.loadClass()", 
            action:"Updating graph" 
        });
    `
});
*/
// Java.use('java.lang.String')
/*DeObfuscationScanner.addPrologue(`
    var @@__CTX__@@_string_class = Java.use('java.lang.String');
`);
*/

DeObfuscationScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.lang.Class.forName(<java.lang.String><boolean><java.lang.ClassLoader>)<java.lang.Class>",
    onMatch: function(ctx,event){
   
        // follow match
        ctx.hook.lastSession().addMatch(
            DeObfuscationScanner.id,
            "java.lang.Class.forName"
        );
        
        DeObfuscationScanner.share.buildingInvoke.class = event.data.cls;

        console.log("[LISTENER][Class.forName]",event.data.cls,event.data.stack);

/*
        let dbo = ctx.find.get.class(event.data);
        
        if(dbo == null){
            console.log("NEW CLASS DISCOVERED",event.data);
         
            let cls = new CLASS.Class({
                name: event.data    
            });
            cls.signature();

            ctx.analyze.updateWithClass(cls);
        } */
    },
    interceptReplace: `        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: {
                cls: arguments[0],
                stack: @@__CTX__@@_stackTrace()
            },
            after: true, 
            msg: "Class.forName()", 
            action: "-"
        });

        return meth_@@__METHDEF__@@.call(this, arguments[0], arguments[1], arguments[2]);
    `
});

// java.lang.Class.getConstructor(<java.lang.Class>[])<java.lang.reflect.Constructor>

DeObfuscationScanner.addIntercept({
    when: HOOK.BEFORE,
    method: "java.lang.Class.getConstructor(<java.lang.Class>[])<java.lang.reflect.Constructor>",
    onMatch: function(ctx,event){
   
        // follow match
        ctx.hook.lastSession().addMatch(
            DeObfuscationScanner.id,
            "java.lang.Class.getConstructor"
        );
        
        DeObfuscationScanner.share.buildingInvoke.new = true;

        console.log("[LISTENER][Class.getConstructor]",event.data);
    },
    interceptReplace: `        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: "", //this.getCanonicalName(),
            after: true, 
            msg: "Class.getConstructor()", 
            action:"Updating graph" 
        });

        return meth_@@__METHDEF__@@.call(this, arguments[0]);
    `
});


DeObfuscationScanner.addIntercept({
    when: HOOK.BEFORE,
    raw: new CLASS.Method({
        enclosingClass: new CLASS.Class({ name: "java.lang.Class" }),
        name: "getMethod",
        args: [
            new CLASS.ObjectType("java.lang.String"),
            new CLASS.ObjectType("java.lang.Object",true) 
        ],
        ret: new CLASS.ObjectType("java.lang.reflect.Method")
    }),
/*    raw_declaration: true,
    raw_class: "java",
    raw_methodname: "getMethod",
    raw_args: "",
    method_signature: "java.lang.Class.getMethod(<java.lang.String><java.lang.Class>[])<java.lang.reflect.Method>",
  */  onMatch: function(ctx,event){
        
        //DeObfuscationScanner.share.buildingInvoke.method = event.data;

        // follow match
        ctx.hook.lastSession().addMatch(
            DeObfuscationScanner.id,
            "java.lang.Class.getMethod"
        );
                
        console.log("[LISTENER][Class.getMethod]",event.data);
    },
    interceptReplace: `        
        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: "",//this.getName(),
            after: true, 
            msg: "Class.getMethod()", 
            action:"Updating graph" 
        });

        return meth_@@__METHDEF__@@.call(this, arguments[0], arguments[1]);
    `
});

/*
DeObfuscationScanner.addIntercept({
    when: HOOK.BEFORE,
    method_signature: "java.lang.reflect.Method.invoke(<java.lang.Object><java.lang.Object>[])<java.lang.Object>",
    onMatch: function(ctx,event){
   
        // follow match
        ctx.hook.lastSession().addMatch(
            DeObfuscationScanner.id,
            "java.lang.Method.invoke"
        );
        
        DeObfuscationScanner.share.buildingInvoke.name = event.data;

        console.log("[LISTENER][Method.invoke]",event.data);
    },
    interceptAfter: `        
        send({ 
            id:"@@__HOOK_ID__@@", 
            match: true, 
            data: "",//this.getName(),
            after: true, 
            msg: "Method.invoke()", 
            action:"Updating graph" 
        });

        //return meth_@@__METHDEF__@@.call(this, arguments[0], arguments[1]);
    `
});
*/
/*
DeObfuscationScanner.addMatchListener(function(ctx,msg){

});
*/

module.exports = DeObfuscationScanner;