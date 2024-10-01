import {HookVariable, HookVariableArray, HookVariableObject} from "../HookVariable.js";


export enum InspectorState {
    RUNNING="running",
    DEPRECATED="deprecated",
    REMOVED="removed"
}

export enum TargetLanguage {
    JS='js',
    TS="ts"
}

export enum ScriptLanguage {
    JS='js',
    C='c',
    BYTECODE='bd'
}

export interface HookVariableMap {
    [name:string] :(HookVariable|HookVariableArray|HookVariableObject);
}

export interface ScriptBuilderOptions {
    /**
     * To flush previously generated script for all hooks
     * @type {boolean}
     */
    flushGeneratedCode?:boolean;
    targetLanguage?:TargetLanguage
}

export interface ScriptWriterOptions {
    /**
     * To flush previously generated script for all hooks
     * @type {boolean}
     */
    flushGeneratedCode?:boolean;
    targetLanguage:TargetLanguage
}
