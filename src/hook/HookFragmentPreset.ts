import {AbstractHook, HOOK_FRAGMENT_POS, UID_POS_MAPPING} from "./AbstractHook.js";
import HookTemplateFragment from "./HookTemplateFragment.js";
import ModelMethod from "../ModelMethod.js";
import HookStrategy from "./HookStrategy.js";
import {CryptoUtils} from "../CryptoUtils.js";

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
                        frag.setUID(HookFragmentPreset.generateFragmentUID(pHook, HOOK_FRAGMENT_POS.BEFORE, frag, null));
                    }else{
                        frag.name = "trace_return_value";
                        frag.description = "To trace the return value";
                        frag.setCodeTemplate(this._createMethodTrack(pHook, pOptions, false ));
                        frag.setUID(HookFragmentPreset.generateFragmentUID(pHook, HOOK_FRAGMENT_POS.AFTER, frag, null));
                    }
                }
                break;
            case HookFragmentPresetType.TAMPER_PARAM:
                if(ModelMethod.TYPE.is(pHook.getTarget()) && pLocation=='before'){
                    frag.name = "tamper_param";
                    frag.description = "To tamper the values from parameters before the call";
                    frag.setCodeTemplate(this._createTamperJavaParam(pHook, pOptions ));
                    frag.setUID(HookFragmentPreset.generateFragmentUID(pHook, HOOK_FRAGMENT_POS.BEFORE, frag, null));
                }
                break;
            case HookFragmentPresetType.TAMPER_RET:
                if(ModelMethod.TYPE.is(pHook.getTarget()) && pLocation=='after'){
                    frag.name = "trace_return_value";
                    frag.description = "To tamper the value returned by the method after the call";
                    frag.setCodeTemplate(this._createTamperJavaRet(pHook, pOptions ));
                    frag.setUID(HookFragmentPreset.generateFragmentUID(pHook, HOOK_FRAGMENT_POS.AFTER, frag, null));
                }
                break;
        }
        return frag;
    }

    /**
     * To generate an UID for a hook fragment
     *
     * @param pPosition
     * @param pFrag
     * @param {HookStrategy} pStrategy  The parent strategy
     * @return {string} Generate UID for hook fragment template for a specified strategy
     * @method
     * @static
     */
    static generateFragmentUID( pHook:AbstractHook, pPosition:HOOK_FRAGMENT_POS, pFrag:HookTemplateFragment, pStrategy:HookStrategy = null):string {
        return CryptoUtils.md5( ':::'+pHook.getGUID()+':'+UID_POS_MAPPING[pPosition]+':'+pFrag.name );
    }
}