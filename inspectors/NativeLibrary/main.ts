import {INSPECTOR_TYPE} from "../../src/Inspector.js";
import InspectorFactory from "../../src/InspectorFactory.js";
import ModelMethod from "../../src/ModelMethod.js";
// ===== INIT =====

var NativeLibraryInspector:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.POST_APP_SCAN,

    version: "1.0.3",
    hookSet: {
        id: "NativeLibrary",
        name: "native library inspector",
        description: "Find and copy native library loaded at runtime",
        require: ["Common"],
        hookShare: {
            fd: [],
            stream: [],
            refs: {}
        },
        strategies: [{
            name: "loadLibrary",
            descr: "To detect loading of native library with System.loadLibrary",
            search: {
                type: ModelMethod.TYPE.getName(),
                uid: ["java.lang.System.loadLibrary(<java.lang.String>)<void>"]
            },
            autoEmit: true,
            emitEvent: "hook.nativelib.loadLibrary.inject",
            /*
            preprocessor: ` 
                pCtx.getInspector("NativeLibrary").emits("hook.nativelib.inject",pEvent);
            `,/*
            onMatch: function(ctx:DexcaliburProject,event:Event):any{
                ctx.getInspector("NativeLibrary").emits("hook.nativelib.inject",event);
            },*/
            replace: `
                // <ts>={
                // Source: https://cs.android.com/android/platform/superproject/+/android-13.0.0_r39:libcore/ojluni/src/main/java/java/lang/Runtime.java;l=978
                let ret;
                try { 
                    let callingClassLoader = DXC.java.class.dalvik.system.VMStack.getCallingClassLoader();
                    let callerClass = DXC.java.class.dalvik.system.VMStack.getStackClass2();
                    if (callingClassLoader === null) {
                        // Bootstrap class loader
                        let bootstrapLoader = Java.use("java.lang.ClassLoader").getSystemClassLoader().getParent();
                        ret = DXC.java.class.java.lang.Runtime.getRuntime().loadLibrary0(bootstrapLoader, callerClass, arg0);
                    } else {
                        // Custom class loader
                        ret = DXC.java.class.java.lang.Runtime.getRuntime().loadLibrary0(callingClassLoader, callerClass, arg0);
                    }
                    DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {library: arg0, message: 'Successfully load library with Runtime, instead of System'}
                    );
                } catch(ex) {
                    // Call original method
                    DXC.send(
                                "@@__HOOK_ID__@@",
                                "@@__FRAG_ID__@@",
                                {library: arg0, message: 'Could not load library with Runtime. Using System loadLibrary'}
                    );
                    ret = meth_@@__METHDEF__@@.call(this, arg0);
                } 
                return ret;
                `
            },
            {
                name: "load",
                descr: "To detect loading of native library with System.load on a filename",
                search: {
                    type: ModelMethod.TYPE.getName(),
                    uid: ["java.lang.System.load(<java.lang.String>)<void>"]
                },
                autoEmit: true,
                emitEvent: "hook.nativelib.load.inject",
                replace: `
                    // <ts>={
                    // Source: https://cs.android.com/android/platform/superproject/+/android-13.0.0_r39:libcore/ojluni/src/main/java/java/lang/Runtime.java;l=978
                    // https://cs.android.com/android/platform/superproject/+/android14-qpr3-release:libcore/ojluni/src/main/java/jdk/internal/reflect/Reflection.java;l=74?q=getCallerClass&sq=&ss=android%2Fplatform%2Fsuperproject
                    let ret;
                    try {
                        let callerClass = DXC.java.class.dalvik.system.VMStack.getStackClass2();
                        ret = DXC.java.class.java.lang.Runtime.getRuntime().load0(callerClass, arg0);
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {library: arg0, message: 'Successfully load filename as a library with Runtime, instead of using System load'}
                        );
                    } catch(ex) {
                        DXC.send(
                            "@@__HOOK_ID__@@",
                            "@@__FRAG_ID__@@",
                            {filename: arg0, message: 'Could not load filename as library with Runtime. Using System load'}
                        );
                        ret = meth_@@__METHDEF__@@.call(this, arg0);
                    } 
                    return ret;
                `
            }
        ]
    },
    eventListeners: {
        /*"hook.nativelib.load": function(ctx:any,event:any):any{
            //TODO
        }*/
    }
});

export  default NativeLibraryInspector;
