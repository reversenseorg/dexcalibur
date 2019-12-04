const HOOK = require("../../src/HookManager.js");
const CLASS = require("../../src/CoreClass.js");
const Inspector = require("../../src/Inspector.js");
const Event = require("../../src/Event.js");
const Logger = require("../../src/Logger.js")();
const ut = require("../../src/Utils.js");

const SaveManager = require('./SaveManager.js');


// ===== INIT =====

var Saver = new Inspector.Inspector({
    hookSet: new HOOK.HookSet({
        id: "saver",
        name: "Saver",
        description: "It offers a way to backup alias/hook and restore it as any save/open feature."
    })
});

// ===== Enable GUI =======
Saver.useGUI();


Saver.on("save.autosave.start", {
    task: function(ctx, event){
        ctx.saveManager.enable();
    }
});

Saver.on("save.autosave.stop", {
    task: function(ctx, event){
        ctx.saveManager.disable();
    }
});

Saver.on("dxc.fullscan.post", {
    task: function(ctx, event){
        ctx.saveManager = new SaveManager(ctx);
    }
});


Saver.on("dxc.initialized", {
    task: function(ctx, event){
        ctx.saveManager._ready = true;
        ctx.saveManager.restore();
    }
});


Saver.on("method.alias.update", {
    task: function(ctx, event){
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
    }
});

Saver.on("field.alias.update", {
    task: function(ctx, event){
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
    }
});

Saver.on("class.alias.update", {
    task: function(ctx, event){
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
    }
});


Saver.on("probe.new", {
    task: function(ctx, event){
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
    }
});

Saver.on("probe.post_code_change", {
    task: function(ctx, event){
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
    }
});


Saver.on("probe.enable", {
    task: function(ctx, event){
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
    }
});


Saver.on("probe.disable", {
    task: function(ctx, event){
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
});

module.exports = Saver;