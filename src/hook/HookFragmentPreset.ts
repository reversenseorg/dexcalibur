import {AbstractHook} from "./AbstractHook";
import HookTemplateFragment from "./HookTemplateFragment";
import ModelMethod from "../ModelMethod";

export enum HookFragmentPresetType {
    TRACK='track',
    TAMPER_PARAM='tpar',
    TAMPER_RET='tret'
}
export interface HookFragmentPresetOptions{
    before:boolean,
    tamper?:any
}

export default class HookFragmentPreset {

    private _createMethodTrack(pHook:AbstractHook, pOptions:HookFragmentPresetOptions):string{
        if(pOptions.before){
            return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__ARGS_DATA__@@ )`;
        }else{
            return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__RET_DATA__@@ )`;
        }
    }

    private _createTamperJavaParam(pHook:AbstractHook, pOptions:HookFragmentPresetOptions):string{
        return `
        const __args = @@__ARGS_DATA__@@ ;
        __args[${pOptions.tamper.param.offset}] = ${pOptions.tamper.param.value};
        DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", __args)
        `;
    }

    private _createTamperJavaRet(pHook:AbstractHook, pOptions:HookFragmentPresetOptions):string{
        return `DXC.send("@@__HOOK_ID__@@","@@__FRAG_ID__@@", @@__RET_DATA__@@ )`;
    }

    generateFragment( pType:HookFragmentPresetType, pHook:AbstractHook, pOptions:HookFragmentPresetOptions):HookTemplateFragment {
        const frag = new HookTemplateFragment();

        switch (pType){
            case HookFragmentPresetType.TRACK:
                if(ModelMethod.TYPE.is(pHook.getTarget())){
                    frag.setCodeTemplate(this._createMethodTrack(pHook, pOptions ));
                }
                break;
            case HookFragmentPresetType.TAMPER_PARAM:
                if(ModelMethod.TYPE.is(pHook.getTarget())){
                    frag.setCodeTemplate(this._createTamperJavaParam(pHook, pOptions ));
                }
                break;
            case HookFragmentPresetType.TAMPER_RET:
                if(ModelMethod.TYPE.is(pHook.getTarget())){
                    frag.setCodeTemplate(this._createTamperJavaRet(pHook, pOptions ));
                }
                break;
        }
        return frag;
    }
}