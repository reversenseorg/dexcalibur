import {AbstractHook} from "./AbstractHook";
import HookTemplateFragment from "./HookTemplateFragment";
import ModelMethod from "../ModelMethod";

export enum HookFragmentPresetType {
    TRACK='track',
    TRACK_PARAM='trackpar',
    TRACK_RET='trackret',
    TAMPER='tamper',
    TAMPER_PARAM='tpar',
    TAMPER_RET='tret',
    TRACK_JAVA_NEW_INST='jnewobj'
}

export interface HookFragmentPresetOptions{
   // before:boolean,
    type:HookFragmentPresetType,
    tplOpts:any
}

export default class HookFragmentPreset {

    private _createMethodTrack(pHook:AbstractHook, pOptions:HookFragmentPresetOptions, pBefore:boolean):string{
        if(pBefore){
            return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__ARGS_DATA__@@ )`;
        }else{
            return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__RET_DATA__@@ )`;
        }
    }

    private _createTamperJavaParam(pHook:AbstractHook, pOptions:HookFragmentPresetOptions):string{
        return `
        const __args = @@__ARGS_DATA__@@ ;
        __args[${pOptions.tplOpts.param.offset}] = ${pOptions.tplOpts.param.value};
        DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", __args)
        `;
    }

    private _createTamperJavaRet(pHook:AbstractHook, pOptions:HookFragmentPresetOptions):string{
        return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__RET_DATA__@@ )`;
    }

    generateFragment( pHook:AbstractHook, pOptions:HookFragmentPresetOptions, pLocation:any):HookTemplateFragment {
        const frag = new HookTemplateFragment();

        switch (pOptions.type){
            case HookFragmentPresetType.TRACK:
                if(ModelMethod.TYPE.is(pHook.getTarget())){
                    if(pLocation == 'before'){
                        frag.name = "trace_args";
                        frag.description = "To trace the params value";
                        frag.setCodeTemplate(this._createMethodTrack(pHook, pOptions, true ));
                    }else{
                        frag.name = "trace_return_value";
                        frag.description = "To trace the return value";
                        frag.setCodeTemplate(this._createMethodTrack(pHook, pOptions, false ));
                    }
                }
                break;
            case HookFragmentPresetType.TAMPER_PARAM:
                if(ModelMethod.TYPE.is(pHook.getTarget()) && pLocation=='before'){
                    frag.name = "tamper_param";
                    frag.description = "To tamper the values from parameters before the call";
                    frag.setCodeTemplate(this._createTamperJavaParam(pHook, pOptions ));
                }
                break;
            case HookFragmentPresetType.TAMPER_RET:
                if(ModelMethod.TYPE.is(pHook.getTarget()) && pLocation=='after'){
                    frag.name = "trace_return_value";
                    frag.description = "To tamper the value returned by the method after the call";
                    frag.setCodeTemplate(this._createTamperJavaRet(pHook, pOptions ));
                }
                break;
        }
        return frag;
    }
}