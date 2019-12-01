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
        console.log("Trigger save restore");
        ctx.saveManager = new SaveManager(ctx);
        ctx.saveManager.restore();
    }
});



Saver.on("method.alias.update", {
    task: function(ctx, event){
        try{
            if(ctx.saveManager.isEnabled()){
                console.log(event);
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
            if(ctx.saveManager.isEnabled()){
                console.log(event);
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
            if(ctx.saveManager.isEnabled()){
                console.log(event);
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
            if(ctx.saveManager.isEnabled()){
                console.log(event);
                ctx.saveManager.updateHook(event.data); 
                ctx.saveManager.save();
                Logger.debug("[INSPECTOR][SAVE] newHook() saved");
            }else{
                Logger.debug("[INSPECTOR][SAVE] newHook() called but not saved : auto-save is disabled");
            }
/*
            console.log(event.type, event.data);
            ctx.saveManager.newHook(event.data); 
            ctx.saveManager.save();
            Logger.debug("[INSPECTOR][SAVE] newHook() saved");*/
        }catch(e){
            console.log(e);
            Logger.error("[INSPECTOR][SAVE] newHook() failed");
        }
    }
});

Saver.on("probe.post_code_change", {
    task: function(ctx, event){
        try{
            if(ctx.saveManager.isEnabled()){
                console.log(event);
                ctx.saveManager.updateHook(event.data); 
                ctx.saveManager.save();
                Logger.debug("[INSPECTOR][SAVE] updateHook() saved");
            }else{
                Logger.debug("[INSPECTOR][SAVE] updateHook() called but not saved : auto-save is disabled");
            }
            /*
            console.log(event.type, event.data);
            ctx.saveManager.updateHook(event.data); 
            ctx.saveManager.save();
            Logger.debug("[INSPECTOR][SAVE] updateHook() saved");*/
        }catch(e){
            console.log(e);
            Logger.error("[INSPECTOR][SAVE] updateHook() failed");
        }
    }
});

module.exports = Saver;