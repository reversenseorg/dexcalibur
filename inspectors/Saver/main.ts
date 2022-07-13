import * as Log from "../../src/Logger";
import InspectorFactory from "../../src/InspectorFactory";
import {INSPECTOR_TYPE} from "../../src/Inspector";
import DexcaliburProject from "../../src/DexcaliburProject";
import BusEvent from "../../src/BusEvent";
import SaveManager from "./SaveManager";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

// ===== INIT =====

var Saver:InspectorFactory = new InspectorFactory({

    startStep: INSPECTOR_TYPE.BOOT,

    useGUI: true,

    hookSet: {
        id: "Saver",
        name: "Saver",
        description: "It offers a way to backup alias/hook and restore it as any save/open feature."
    },

    eventListeners: {
        "save.autosave.start": function(ctx:DexcaliburProject, event:BusEvent):any{
            ctx.saveManager.enable();
        },
        "save.autosave.stop": function(ctx:DexcaliburProject, event:BusEvent):any{
            ctx.saveManager.disable();
        },
        "dxc.fullscan.post": function(ctx:DexcaliburProject, event:BusEvent):any{
            ctx.setSaveManager( new SaveManager(ctx));
        },
        "dxc.initialized": function(ctx:DexcaliburProject, event:BusEvent):any{
            ctx.saveManager._ready = true;
            //ctx.saveManager.restore();
        },
        "function.alias.update": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    console.log(event,event.data);
                    ctx.saveManager.updateAlias("functions", event.data.meth);
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] updateAlias() failed");
            }
        },
        "method.alias.update": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    console.log(event,event.data);
                    ctx.saveManager.updateAlias("methods", event.data.meth);
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] updateAlias() failed");
            }
        },
        "field.alias.update": function(ctx:DexcaliburProject, event:BusEvent):any{
            console.log(event);
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateAlias("fields", event.data.field);
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] updateAlias() failed");
            }
        },
        "class.alias.update": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateAlias("classes", (event as any).cls);
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] updateAlias() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] updateAlias() failed");
            }
        },
        "probe.new": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateHook(event.data); 
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] newHook() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] newHook() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] newHook() failed : ");
            }
        },
        "probe.post_code_change": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateHook(event.data); 
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] updateHook() saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] updateHook() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] updateHook() failed");
            }
        },
        "probe.enable": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateHookStatus(event.data.hook, true); 
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] enable hook saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] enable hook called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] hook.enable() failed : ");
            }
        },
        "probe.disable": function(ctx:DexcaliburProject, event:BusEvent):any{
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateHookStatus(event.data.hook, false); 
                    ctx.saveManager.save();
                    Logger.debug("[INSPECTOR][SAVE] disable status saved");
                }else{
                    Logger.debug("[INSPECTOR][SAVE] disable hook called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] hook.disable() failed : ");
            }
        }
    }

});


export default Saver;