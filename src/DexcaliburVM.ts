import ModelMethod from "./ModelMethod";
import DDVM_ClassInstance from "./android/DDVM_ClassInstance";


export interface DexcaliburVM {

   // defineHook( pMethodSignature:string, pHook:Function ):void;

    setupHooks():void;

    //runMethod( pMethod:ModelMethod):void;

    setConfig( pConfig:any):void;

    softReset():void;

    reset():void;

    start( pMethod:ModelMethod, pThis:any, pArguments:any):void;

    getPseudoCode():string[];

    printStackTrace():any;

    getLog():any;
}