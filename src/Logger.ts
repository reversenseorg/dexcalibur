/*
IMPORTANT :
-----------
This file should not include dexcalibur ./src/* file (recursive dependency)
*/


import chalk from "chalk";
import Process = require("process");

class LoggerAction {
    static exit(){
        Process.exit();
    }
}

export enum MessageType {
     T_ERROR = 1,
     T_INFO = 2,
     T_DEBUG = 3,
     T_WARN = 4,
     T_RAW = 5,
     T_SUCCESS = 6,
    T_DEBUG_RAW
}

interface TestMessage {
    type: MessageType,
    val: any
}

/**
 * To concate several strings contained into an array and return a string
 *
 * @param msg String[] An array of string
 * @function
 */
function multi_concat(msg:any[]):string{
    let ret:string="";
    for(let i=0; i<msg.length; i++)
        ret += msg[i];

    return ret;
}


export interface Logger {

    prefix: string[];
    debugEnabled: boolean;

    error(...args:string[]):LoggerAction;
    debug(...args:string[]):LoggerAction;
    debugPink(...args:string[]):LoggerAction;
    debugRAW(...args:any[]):LoggerAction;
    debugBgRed(...args :any[]):LoggerAction;
    info(...args:string[]):LoggerAction;
    warn(...args:string[]):LoggerAction;
    success(...args:string[]):LoggerAction;
    raw(...args:string[]):LoggerAction;
    pop():string;
    push(prefix:string):string[];
}


export class TestLogger implements Logger
{

    prefix: string[] = [];
    cache: TestMessage[] = [];
    cacheTag: string = null;
    debugEnabled: boolean = false;

    constructor(debugMode:boolean){
        this.debugEnabled = debugMode;
    }

    error(...args :any[]):LoggerAction{
        this.cache.push( { type:MessageType.T_ERROR, val:multi_concat(args) });
        return LoggerAction;
    }

    debug(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
        return LoggerAction;
    }

    debugPink(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
        return LoggerAction;
    }

    debugBgRed(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            this.cache.push({ type:MessageType.T_DEBUG, val:multi_concat(args) });
        return LoggerAction;
    }

    debugRAW(...args :any[]):LoggerAction{
        this.cache.push({ type:MessageType.T_DEBUG_RAW, val:args });
        return LoggerAction;
    }

    info(...args :any[]):LoggerAction{
        this.cache.push({ type:MessageType.T_INFO, val:multi_concat(args) });
        return LoggerAction;
    }

    warn(...args :any[]):LoggerAction{
        this.cache.push({ type:MessageType.T_WARN, val:multi_concat(args) });
        return LoggerAction;
    }

    success(...args :any[]):LoggerAction{
        this.cache.push({ type:MessageType.T_SUCCESS, val:multi_concat(args) });
        return LoggerAction;
    }

    raw(...args :any[]):LoggerAction{
        this.cache.push({ type:MessageType.T_RAW, val:multi_concat(args) });
        return LoggerAction;
    }

    setTagCache(tag:string){
        this.cacheTag = tag;
    }


    expect(expected:TestMessage, fn:any =null):boolean{
        let f = false;
        this.cache.map(x => {
            if(x.type==expected.type){
                if(typeof fn == "function")
                    f = fn(expected, x);
                else
                    f = (x.val===expected.val);
            }
        });
        return f;
    }

    clearCache(){
        this.cache = [];
    }

    pop():string{
        return this.prefix.pop()
    }

    push(prefix:string): string[]{
        this.prefix.push(prefix);
        return this.prefix;
    }
}


export class ProdLogger implements Logger
{
    prefix: string[] = [];
    debugEnabled: boolean = false;

    constructor(debugMode:boolean){
        this.prefix = [];
        this.debugEnabled = debugMode;
    }

    enableDebug(){
        this.debugEnabled = true;
    }

    error(...args :any[]):LoggerAction{
        console.log(chalk.bold.red('[ERROR] '+this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }

    debug(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            console.log(chalk.bold.blue('[DEBUG] '+this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }


    debugRAW(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            console.log(args);
        return LoggerAction;
    }

    /**
     * TODO : TestLogger
     */
    debugPink(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            console.log(chalk.bold.magenta('[DEBUG] '+this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }


    debugBgRed(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            console.log(chalk.white.bgRed.bold('[DEBUG] '+this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }

    warn(...args :any[]):LoggerAction{
        if(this.debugEnabled)
            console.log(chalk.bold.yellow('[DEBUG] '+this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }

    success(...args :any[]):LoggerAction{
        console.log(chalk.bold.green(this.prefix.join("")+multi_concat(args)));
        return LoggerAction;
    }

    info(...args :any[]):LoggerAction{
        console.log('[INFO] '+this.prefix.join("")+multi_concat(args));
        return LoggerAction;
    }

    raw(...args :any[]):LoggerAction{
        console.log(multi_concat(args));
        return LoggerAction;
    }

    pop():string{
        return this.prefix.pop()
    }

    push(prefix:string):string[]{
        this.prefix.push(prefix);
        return this.prefix;
    }
}


let loggerInstance:TestLogger|ProdLogger = null;


export function newLogger(config:any =null, override:boolean =false):TestLogger|ProdLogger {
    if(loggerInstance===null || override){
        if(config===null){
            config={
                testMode: false,
                debugMode: false
            };
        }

        if((config!==null && config.testMode) || Process.env.DEXCALIBUR_TEST)
            loggerInstance = new TestLogger(config.debugMode);
        else
            loggerInstance = new ProdLogger(config.debugMode);
    }

    return loggerInstance;
}
