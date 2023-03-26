import DexcaliburProject from "./DexcaliburProject.js";
import BusEvent from "./BusEvent.js";
import * as Log from "./Logger.js";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;

interface BusPreventList {
    [eventID :string] :boolean
}


interface EventSubscribers {
    [eventID :string] :BusSubscriber[]
}

export interface BusBroadcaster {
    getUID():string;
    broadcastEvent(pEvent:BusEvent):void
}


var gSubs_CTR:number = 1;

export class BusSubscriber {
    _f:Function;
    _uid:number;
    _p:boolean = false;

    constructor( pUID:number, pFunc:Function) {
        this._uid = pUID;
        this._f = pFunc;
    }

    static from(pFunc:Function):BusSubscriber {
        return new BusSubscriber( gSubs_CTR++, pFunc);
    }

    prevent():void {
        this._p = true;
    }

    unprevent():void {
        this._p = false;
    }

    exec(pEvent:BusEvent):void {
        if(!this._p) this._f(pEvent);
    }
}


/**
 *
 * TODO : two types of classes should be able to subscribe
 *  - BusBroadcast => such instances catches all events
 *  - BusListener => such instances are listener assoiacted to a specific event
 */
export default class Bus
{
    context:DexcaliburProject = null;

    /**
     * @type {EventSubscribers}
     */
    subs:EventSubscribers = {};

    listener:any = [];
    provider:any = [];
    broadcast:any = {};
    prevented:BusPreventList = null;

    constructor(pContext:DexcaliburProject){
        this.context = pContext;
        this.listener = [];
        this.provider = [];
        this.broadcast = {};
        this.prevented = {};

        return this;
    }


    setContext(pContext:DexcaliburProject):Bus{
        this.context = pContext;
        return this;
    }

    /**
     * To prevent all events for a specific event type
     *
     * @param {string} eventName Name of event
     * @return {Bus} Dexcalibur main bus
     * @method
     */
    prevent(eventName:string):Bus{
        this.prevented[eventName] = true;
        return this;
    }

    /**
     * To unprevent event by event type
     *
     * @param {string} eventName Name of event
     * @return {Bus} Dexcalibur main bus
     * @method
     */
    unprevent(eventName:string):Bus{
        this.prevented[eventName] = false;
        return this;
    }

    /**
     * To get all listeners for specific event type
     *
     * It returns only listeners declared into Bus. Not into BusBroadcaster
     *
     * @param {string} eventName Event name
     * @return {BusSubscriber[]} An array of Bus subscriber
     * @method
     */
    getListener(eventName:string):any{
        throw new Error("Bus.getListener() is deprecated");

        /*
        for(let i:number=0; i<this.listener.length; i++)
            if(this.listener[i].name == eventName)
                return this.listener[i];

        */

        return null;
    }

    /**
     * To get all subscriber for specific event type
     *
     * @param {string} eventName Event name
     * @return {BusSubscriber[]} An array of Bus subscriber
     * @method
     */
    getSubscribers(eventName:string):BusSubscriber[]{
        return this.subs[eventName];
    }


    /**
     * To get all broadcasters
     *
     *
     * @return {BusBroadcaster[]} An array of Bus subscriber
     * @method
     */
    getBroadcasters():BusBroadcaster[]{
        return this.broadcast;
    }

    /**
     * To subscribe to an event
     *
     * @param listener
     */
    subscribe(pEventName:string, pSubscriber:BusSubscriber):Bus{
        //this.listener.push(listener);
        if(!this.subs.hasOwnProperty(pEventName)){
            this.subs[pEventName] = [];
        }

        // TODO : add weight-based priority
        this.subs[pEventName].push(pSubscriber);

        return this;
    }


    unscribeAll(pEventName:string):boolean{
        this.subs[pEventName] = [];
        return true;
    }


    unscribe(pSubscriber:BusSubscriber):boolean{

        throw new Error("Bus.unscribe() is deprecated");
/*
        for(let i=0; i<this.listener.length; i++){
            if(this.listener[i].getId()==listener.getID()){
                this.listener[i] = null;
            }
        }*/
        return true;
    }

    /**
     * To emit an event into the bus.
     *
     * Events are forwarded :
     * - conditionally to associated listeners
     * - inconditionnaly to broadcasters already registered
     *
     * @param event
     */
    send(event:BusEvent):boolean{

        if(this.prevented.hasOwnProperty(event.type) && this.prevented[event.type]===true){
            Logger.info("[BUS] <"+event.type+"> prevented ...");
            this.prevented[event.type] = false;
            return false;
        }


        // TODO : async / co

        // exec local subscribers
        const evName = event.getType();
        if(this.subs.hasOwnProperty(evName)){
            this.subs[evName].map( pSubs => pSubs.exec(event));
        }

        // broadcast events
        for(let uid in this.broadcast){
            this.broadcast[uid].broadcastEvent(event);
        }

        return true;
    }

    /**
     * To register a broadcast
     *
     * @param {BusBroadcaster} pBroadcaster The broadcaster listening for event
     * @method
     */
    register(pBroadcaster:BusBroadcaster):void {
        this.broadcast[pBroadcaster.getUID()] = pBroadcaster;
    }
}

