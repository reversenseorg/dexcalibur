import KeyPoint from "./KeyPoint";
import KeyPointManager from "./KeyPointManager";
import ModelFile from "../ModelFile";
import {NodeInternalType} from "../NodeInternalType";
import {INode} from "../INode";

export const KeyPointFileEvent = {
    LINKER: 'linker',
    DLOPEN: 'dlopen',
    READ: 'read',
    WRITE: 'write',
    STAT: 'fstat',
    UNLINK: 'del'
};

/**
 * Represent options required to generate code of a key point
 *
 * @class
 */
export class KeyPointOptions {
    parent:string;
    token:string;
    weight:number;
    descr:string;

    /**
     * Condition ID
     * @field
     * @type {string}
     */
    condition = "";

    /**
     * Condition Name
     * @field
     * @private
     * @type {string}
     */
    private cname:string = null;

    /**
     * Key point name
     * @field
     * @type {string}
     */
    name: string;

    /**
     *
     * @param pConfig {any} Optional. Poor object containing config
     * @constructor
     */
    constructor(pConfig:any = null) {
        if(pConfig != null){
            for(const i in pConfig) this[i] = pConfig[i];
        }
    }

    /**
     * To get the condition name
     *
     * It is the last part of the condition ID. Ex: 'read' in 'fldpkg_read'
     *
     * @return {string} Condition name. Meaning depends of targeted node.
     * @method
     */
    getConditionName(){
        if(this.cname!=null){
            return this.cname;
        }else{
            return (this.cname = this.condition.split('_')[1]);
        }
    }
}


/**
 * A generator to generate fragment of code for key point
 */
export class KeyPointGenerator {

    mgr:KeyPointManager = null;

    constructor(pKeyPointMgr:KeyPointManager) {
        this.mgr = pKeyPointMgr;
    }

    generateToken(pKeyPoint:KeyPoint, pEvent:string):string {
        switch (pKeyPoint.getFirstNode().__) {
            case NodeInternalType.FILE:
                return `@@__KP::FILE::${pEvent}::${(pKeyPoint.getFirstNode() as ModelFile).getName()}__@@`;
                break;
            default:
                return `@@__KP::CUSTOM::${pKeyPoint.getName()}_${pEvent}__@@`;
                break;
        }
    }

    private generateForField( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        switch(pOptions.getConditionName()){
            case 'r':
                // read access
                break
            case 'w':
                // write access
                break
            case 'vis':
                // visibility change over reflection
                break
            case 'def':
                // define
                break
        }
        return pKeyPoint;
    }

    private generateForMethod( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        switch(pOptions.getConditionName()){
            case 'def':
                // on method defined
                break
            case 'bef':
                // before method call
                break
            case 'aft':
                // after call
                break
        }
        return pKeyPoint;
    }

    private generateForClass( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        switch(pOptions.getConditionName()){
            case 'load':
                // on class load
                break
            case 'def':
                // on class define
                break
            case 'new_1st':
                // for only the first new instance
                break
            case 'new_any':
                // for each new instance
                break
        }
        return pKeyPoint;
    }

    private generateForPackage( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        switch(pOptions.getConditionName()){
            case 'load':
                // load a class from the target package
                break
        }
        return pKeyPoint;
    }

    private generateForFile( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        const lib:ModelFile = (pKeyPoint.getFirstNode() as ModelFile);
        const libName = lib.getName();

        switch(pOptions.getConditionName()){
            case 'load':
                // JNI Onload if native lib
                // DexClassLoader if dex file, ...
                if(lib.isExecutable()){
                    pKeyPoint.code = `  Interceptor.attach( 
    Process.findModuleByName("${libName}").findExportByName,
    { 
        onEnter:function(args){
            DXC.JVM["${libName}"] = args[0];
        },
        onLeave:function(args){
            /*@@__CONTENT__@@*/
        }
    });
`;
                }/*else if (lib.hasExt("dex")){

                }*/

                // else if()
                // pKeyPoint.code = "Interruptor.newAgent({ @@__CONTENT__@@ }).startOnLoad('"+lib+"')";
                break
            case 'link':
                // if no instruction hook are enabled, then use only linker64 hook
                pKeyPoint.description = "This point is trigged when the lib '"+libName+"' is linked by the dynamic linker.";
                if(!this.mgr.hasActiveInstructionHook()){
                    // add a function to the list callback executed on load
                    pKeyPoint.code = `__:function(vMod){ /*@@__CONTENT__@@*/ },`;
                }else{
                    // use interruptor + onStart()
                    pKeyPoint.require("interruptor/LinuxArm64");
                    pKeyPoint.code = `onStart: function(vMod){ /*@@__CONTENT__@@*/ }`;
                }
                break
            case 'dlo':
                // DL_OPEN
                break
            case 'o':
                // FS open
                break
            case 'w':
                // FS write
                break
            case 'r':
                // FS read
                break
            case 'del':
                // FS delete
                break
        }
        return pKeyPoint;
    }

    private generateForFunction( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint {
        switch(pOptions.getConditionName()){
            case 'bef':
                break
            case 'aft':
                break
            case 'dlsym':
                break
        }
        return pKeyPoint;
    }

    generate( pKeyPoint:KeyPoint, pOptions:KeyPointOptions):KeyPoint{

        const target:INode = pKeyPoint.getFirstNode();

        // search for existing keypoint targeting the same node

        switch (target.__) {
            case NodeInternalType.FILE:
                this.generateForFile( pKeyPoint, pOptions);
                break;
            case NodeInternalType.PACKAGE:
                this.generateForPackage( pKeyPoint, pOptions);
                break;
            case NodeInternalType.CLASS:
                this.generateForClass( pKeyPoint, pOptions);
                break;
            case NodeInternalType.METHOD:
                this.generateForMethod( pKeyPoint, pOptions);
                break;
            case NodeInternalType.FIELD:
                this.generateForField( pKeyPoint, pOptions);
                break;
            case NodeInternalType.FUNC:
                this.generateForFunction( pKeyPoint, pOptions);
                break;
        }

        pKeyPoint.token = this.generateToken(pKeyPoint, pOptions.getConditionName());

        return pKeyPoint;
    }
}