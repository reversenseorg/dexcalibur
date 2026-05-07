
import {AnalyzerState} from "../AnalyzerState.js";
import {AppIcon} from "../AppIcon.js";
import DataScope from "../DataScope.js";
import {Nullable} from "@dexcalibur/dxc-core-api";
import ModelFile from "../ModelFile.js";
import ModelCall from "../ModelCall.js";
import ModelStringValue from "../ModelStringValue.js";
import {NativeBackend} from "../types/common.js";

export interface NativeDiscoverOpts {
    backend: NativeBackend,
    extra: any,
}

export interface IAppAnalyzer {
    prepareFullScan(pNewProject:boolean, pDataScope:Nullable<DataScope>):Promise<boolean>;

    /**
     * To get the path of the file or folder to scan by default
     *
     * @return {string}
     * @method
     */
    getDefaultTargetPath():string;

    getAppUid():string;

    getPackageName():string;

    importMeta():Promise<boolean>;

    hasMissingMeta():boolean;

    restoreState(pState:AnalyzerState):boolean;

    postScan():void;

    extractAppIcons():Promise<AppIcon[]>;

    performXrefAnalysis():Promise<any>;

    isReady():boolean;

    importToSlave():Promise<any>;

    /**
     * This method MUST update the context but never return null or undefined
     *
     * @param vPath
     * @param vFile
     * @param vIsDir
     * @param vCtx
     *
     * @method
     */
    getPathContext(vPath:string, vFile:string, vIsDir:boolean, vCtx:any):any;

    performNativeDiscover(pFile:ModelFile, pExtra:{ sysc:ModelCall[], strings:ModelStringValue[]}, pOptions:NativeDiscoverOpts):Promise<any>;
}