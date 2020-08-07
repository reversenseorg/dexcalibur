DEXC_MODULE.common = {
    class: {
        java: {
            lang:{
                Class: Java.use("java.lang.Class"),
                System: Java.use('java.lang.System'),
                String: Java.use('java.lang.String'),
                Runtime: Java.use('java.lang.Runtime'),
                Thread: Java.use('java.lang.Thread'),
                reflect: {
                    Method: Java.use("java.lang.reflect.Method"),
                    Field: Java.use("java.lang.reflect.Field")
                }
            },
            io: {
                File: Java.use("java.io.File"),
                FileInputStream: Java.use("java.io.FileInputStream"),
                FileOutputStream: Java.use("java.io.FileOutputStream")
            }
        },
        dalvik: {
            system: {
                VMStack: Java.use('dalvik.system.VMStack')
            }
        }
    },
    obj: {}
};


DEXC_MODULE.common.obj.thread = DEXC_MODULE.common.class.java.lang.Thread.$new();

DEXC_MODULE.common.printStackTrace = function() {
    var stack = DEXC_MODULE.common.obj.thread.currentThread().getStackTrace();
    var msg = "";
    // the two firsts stack trace elements are skipped
    for (var i = 2; i < stack.length; i++) {
        msg = msg + i + " => " + stack[i].toString()+"<br>&nbsp;&nbsp;";
    }
    return msg;
}

DEXC_MODULE.common.readFile = function(input_file){

    var fin = DEXC_MODULE.common.class.java.io.FileInputStream.$new(input_file);
    var content = [];
    var b=null;
    var jsBuffer = new Uint8Array(4096);
    var buffer = Java.array('byte', jsBuffer);
    var lastSize = 0;
    do{
        b=fin.read(buffer);
        if(b != -1) {
            //console.log("read " + b + " bytes, writing it into a JS array");
            for(var i =0; i < b; i++) {
                content.push(buffer[i]);
            }
        }
    }while(b != -1);
    
    
    console.log("finished flatting array");
    return content;
}

DEXC_MODULE.common.getStackTrace = function() {
    var stack = DEXC_MODULE.common.obj.thread.currentThread().getStackTrace();
    var msg = [];
    // the two firsts stack trace elements are skipped
    for (var i = 2; i < stack.length; i++) {
        msg.push({ 
            cls:stack[i].getClassName(), 
            meth:stack[i].getMethodName(),
            file:stack[i].getFileName(),
            line:stack[i].getLineNumber()
        });
    }
    return msg;
}

/*

const System = Java.use('java.lang.System'); 
        const Runtime = Java.use('java.lang.Runtime'); 
        const SystemLoad_2 = System.loadLibrary.overload('java.lang.String'); 
        const VMStack = Java.use('dalvik.system.VMStack'); 

function ptr2str(ptr){
    var clsname = Java.cast( ptr.getClass(), CLS.Java.lang.Class);
    var str = clsname.getCanonicalName()+"[";
}*/
