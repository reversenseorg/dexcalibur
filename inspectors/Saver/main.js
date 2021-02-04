const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const InspectorFactory = require("../../src/InspectorFactory.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js")();
const ut = require("../../src/Utils.js");

const SaveManager = require('./SaveManager.js');


// ===== INIT =====

var Saver = new InspectorFactory({

    startStep: Inspector.STEP.BOOT,

    useGUI: true,

    hookSet: {
        id: "Saver",
        name: "Saver",
        description: "It offers a way to backup alias/hook and restore it as any save/open feature."
    },

    eventListeners: {
        "save.autosave.start": function(ctx, event){
            ctx.saveManager.enable();
        },
        "save.autosave.stop": function(ctx, event){
            ctx.saveManager.disable();
        },
        "dxc.fullscan.post": function(ctx, event){
            ctx.saveManager = new SaveManager(ctx);
        },
        "dxc.initialized": function(ctx, event){
            ctx.saveManager._ready = true;
            ctx.saveManager.restore();
        },
        "method.alias.update.mult": function(ctx, event){
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    // pause

                    Logger.info("[INSPECTOR][SAVE] multiple alias update() : auto-save disabled");
                    ctx.saveManager.disable()
                    // update

                    Logger.info("[INSPECTOR][SAVE] multiple alias update() : browsing "+event.meths.length+" methods");
                    event.meths.map( vMeth => {
                        ctx.saveManager.updateAlias(SaveManager.T_METHOD, vMeth);
                    });
                    // run
                    Logger.info("[INSPECTOR][SAVE] multiple alias update() : auto-save enabled");
                    ctx.saveManager.enable()
                    // save

                    Logger.info("[INSPECTOR][SAVE] multiple alias update() : saving ...");
                    ctx.saveManager.save();
                    Logger.info("[INSPECTOR][SAVE] multiple alias update() saved");
                }else{
                    Logger.info("[INSPECTOR][SAVE] multiple alias update() called but not saved : auto-save is disabled");
                }
            }catch(e){
                console.log(e);
                Logger.error("[INSPECTOR][SAVE] multiple alias update() failed");
            }
        },
        "method.alias.update": function(ctx, event){
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateAlias(SaveManager.T_METHOD, event.meth); 
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
        "field.alias.update": function(ctx, event){
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateAlias(SaveManager.T_FIELD, event.field); 
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
        "class.alias.update": function(ctx, event){
            try{
                if(ctx.saveManager.isReady() && ctx.saveManager.isEnabled()){
                    ctx.saveManager.updateAlias(SaveManager.T_CLASS, event.cls); 
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
        "probe.new": function(ctx, event){
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
        "probe.post_code_change": function(ctx, event){
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
        "probe.enable": function(ctx, event){
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
        "probe.disable": function(ctx, event){
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



module.exports = Saver;