/**
 * Class managing the heap area. This component handle data
 * shared by several thread. There is a single heap area per VM instance.
 *
 * This class handles class instances, class loaders, static field, and more
 *
 * @class
 * @classdesc Class managing the heap area
 */
import DDVM_ClassLoader from "./DDVM_ClassLoader.js";
import ModelClass from "../ModelClass.js";
import DDVM_ClassInstance from "./DDVM_ClassInstance.js";
import * as Log from "../Logger.js";


let Logger:Log.Logger = Log.newLogger() as Log.Logger;

export class DDVM_HeapEntry
{
    name:string = null;
    type:any = null;
    value:any = null;

    constructor( pName:string, pType:any, pValue:any){
        this.name = pName;
        this.type = pType;
        this.value = pValue;
    }
}


export class DDVM_HeapArea
{
    heap:DDVM_HeapEntry[] = null;
    free:any = null;
    vm:any = null;
    classloader:DDVM_ClassLoader = null;

    /**
     * To constructr Heap Area
     *
     * @param {DexcaliburDVM} pVM The VM instance
     * @param {VM_ClassLoader} pClassLoader The default class loader
     */
    constructor( pVM:any, pClassLoader:DDVM_ClassLoader){
        this.heap = [];
        this.free = [];
        this.vm = pVM;
        this.classloader = pClassLoader;
    }

    /**
     * To clear heap area
     */
    clear():void{
        this.heap = [];
        this.free = [];
    }

    /**
     * To load a class.
     *
     * Actually only built-in classloader is supported
     *
     * @method
     * @param {Class} pClass The class to load
     *
     */
    loadClass( pClass:ModelClass|string):ModelClass{
        return this.classloader.load( pClass);
    }

    /**
     * To instanciante a new object from specified class.
     *
     * @method
     * @param {Class} pClass the class to instanciate
     * @param {ObjectType[]|BasicType[]|Symbol[]} pArgs Array of argument to pass to constructor
     * @returns {VM_ClassInstance} An instance of the class
     */
    newInstance( pClass:ModelClass|string, pArgs:any=[], pConstructor=null):DDVM_ClassInstance{
        let clz:ModelClass;
        let obj:DDVM_ClassInstance;

        if(pClass instanceof ModelClass)
            Logger.debugBgRed(`[VM] [HEAP] START : New instance of ${pClass.name}`);
        else
            Logger.debugBgRed(`[VM] [HEAP] START : New instance of ${pClass}`);

        // load class if needded
        clz = this.loadClass(pClass);
        obj = new DDVM_ClassInstance(clz);

        // old
        // this.heap.push( obj);
        this.heap.push( new DDVM_HeapEntry( clz.getName()+'@1', clz, obj ));

        // future, 'instances' will be indexed using value returned by the call to obj.hashcode()
        // function. Into the worst case, it calls the hook of Object.hashcode()
        // this.heap[ this.newHashcode(obj) ] = obj;

        if(pClass instanceof ModelClass)
            Logger.debugBgRed(`[VM] [HEAP] END  : New instance of ${pClass.name}`);
        else
            Logger.debugBgRed(`[VM] [HEAP] END : New instance of ${pClass}`);

        //return ref;
        return this.heap[this.heap.length-1].value;
    }

    /**
     * To get an element from Heap Area
     *
     * @method
     * @param {ObjectType} pType
     * @param {String} pName
     */
    get( pType:any, pName:string):DDVM_HeapEntry{
        for(let i=0; i<this.heap.length; i++){
            if((this.heap[i].type ==pType) && (this.heap[i].name == pName)){
                return this.heap[i];
            }
        }
        return null;
    }

    getObject( pRef:string):DDVM_HeapEntry{
        return this.heap[pRef];
    }

    add( pName:string, pObject:any, pType:any){
        if(this.free.length > 0){
            this.heap[this.free.pop()] = new DDVM_HeapEntry( pName, pType, pObject);
        }
    }

    remove( pName:string, pType:any):void{
        for(let i:number=0; i<this.heap.length; i++){
            if((this.heap[i].type == pType) && (this.heap[i].name == pName)){
                this.heap[i] = null;
                this.free.push(i);
            }
        }
    }
}
