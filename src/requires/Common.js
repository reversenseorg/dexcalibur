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
                File: Java.use("java.io.File")
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
    for (var i = 0; i < stack.length; i++) {
        msg = msg + i + " => " + stack[i].toString()+"<br>&nbsp;&nbsp;";
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