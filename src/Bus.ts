import DexcaliburProject from "./DexcaliburProject.js";
import BusEvent from "./BusEvent.js";
import * as Log from "./Logger.js";
import {Subject, Subscriber, Subscription} from "rxjs";

let Logger:Log.Logger = Log.newLogger() as Log.Logger;


export type BusEventHandler = ((pEvent:BusEvent<any>)=>void);


interface BusPreventList {
    [eventID :string] :boolean
}


interface EventSubscribers {
    [eventID :string] :BusSubscriber[]
}

export interface BusBroadcaster {
    getUID():string;
    broadcastEvent(pEvent:BusEvent<any>):void
}


var gSubs_CTR:number = 1;

/**
 * @class
 */
export class BusSubscriber {
    _f:BusEventHandler;
    _uid:number;
    _p:boolean = false;

    constructor( pUID:number, pFunc:BusEventHandler) {
        this._uid = pUID;
        this._f = (pEvent: BusEvent<any>)=>{
            try{
                //console.log(pEvent);
                pFunc.apply(null, [pEvent]);
            }catch (err){
                Logger.error("[BUS][EVENT_HANDLER][uid="+pEvent.type+"] Execution crash : "+err.message);
            }
        }
    }

    /**
     * To create a stateful BusSubscriber insatnce from a lambda function
     *
     * @param {BusEventHandler} pFunc Listener function
     * @return {BusSubscriber}
     * @method
     * @static
     */
    static from(pFunc:BusEventHandler):BusSubscriber {
        return new BusSubscriber( gSubs_CTR++, pFunc);
    }


    /**
     * A switch to disable the listener
     *
     * @method
     */
    prevent():void {
        this._p = true;
    }

    /**
     A switch to enable the listener
     *
     * @method
     */
    unprevent():void {
        this._p = false;
    }

    /**
     * To get prevent flag
     *
     * @return {boolean} TRUE if subscriber is prevented, else FALSE
     * @method
     */
    isPrevented():boolean {
        return this._p;
    }

    /**
     * To execute a listener
     *
     * The listener is executed if the event is not prevented.
     *
     * @param {BusEvent<any>} pEvent The event to pass to the listener
     */
    exec(pEvent:BusEvent<any>):void {
        if(!this._p){
            this._f.apply(null, [null, pEvent]);
        }
    }

    getListener():BusEventHandler {
        return this._f;
    }

    toRxSubscriber(pCtx:DexcaliburProject):((vEvent:BusEvent<any>)=>void) {
        return ((pEvent:any)=>{
            this._f.apply(null, [pCtx, pEvent]);
        });
    }
}

export interface  BusSubscription {
    subscription?: Subscription;
    subscriber: BusSubscriber;
    weight? :number;
}

export interface BusState<T> {
    bus: Subject<BusEvent<T>>;
    subscriptions: BusSubscription[];
}


/**
 *
 * TODO : two types of classes should be able to subscribe
 *  - BusBroadcast => such instances catches all events
 *  - BusListener => such instances are listener assoiacted to a specific event
 *
 *  @class
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

    private _buses:Record<string, BusState<any>> = {};


    /**
     * @param pContext
     * @constructor
     */
    constructor(pContext:DexcaliburProject){
        this.context = pContext;
        this.listener = [];
        this.provider = [];
        this.broadcast = {};
        this.prevented = {};

        return this;
    }

    /**
     * To set or change context of the bus
     * *chainable*
     *
     * @param {DexcaliburProject} pContext The projet associated to this bus
     * @return {Bus} Current bus instance
     * @method
     */
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

    /*getEventSubscribers(pEventName:string):Subscriber<any>[]{
        return this._buses
    }*/
    /**
     * To attach a listener to one or more event types
     *
     * *Chainable*
     *
     * Event if second argument is a BusEventHandler (a function), a BusSubsriber instance
     * will be created from the BusEventHandler. Instead of a function, a BusSubscriber is
     * stateful and can be atomically prevent.
     *
     * @param {string|string[]} pEventName Event types to listen
     * @param {BusSubscriber|BusEventHandler} pSubscriber Listener instance or a lambda function
     * @return {Bus} Instance of the current bus
     * @method
     */
    subscribe<T>(pEventName:string|string[], pSubscriber:BusSubscriber):Bus{


        let subscriber:BusSubscriber;
        if(pSubscriber instanceof BusSubscriber){
            subscriber = pSubscriber as BusSubscriber;
        }else{
            subscriber = BusSubscriber.from(pSubscriber as BusEventHandler);
        }

        if((typeof pEventName)==='string'){

            this.singleSubscribe<T>(pEventName as string, subscriber);

            /*
            //this.listener.push(listener);
            if(!this.subs.hasOwnProperty(pEventName as string)){
                this.subs[pEventName as string] = [];
            }

            // TODO : add weight-based priority
            this.subs[pEventName as string].push(subscriber);*/

            return this;
        }else{
            (pEventName as string[]).map((x) => {
               // this.subscribe<T>(x, pSubscriber)
                this.singleSubscribe<T>(x, subscriber);
            });
        }
    }

    /**
     *
     * @param pEventName
     * @param pSubscriber
     * @param pWeight
     */
    singleSubscribe<T>(pEventName:string, pSubscriber:BusSubscriber, pWeight:number = 0):void {

        if(this._buses[pEventName]==null){
            this._buses[pEventName] = {
                bus: new Subject<BusEvent<T>>(),
                subscriptions: []
            }
        }

        let subscr:BusSubscription = {
            subscription: this._buses[pEventName].bus.subscribe(pSubscriber.getListener()),
            subscriber: pSubscriber,
            weight: pWeight
        };

        this._buses[pEventName].subscriptions.push(subscr);


        // TODO : remove, legacy code, old style / deprecated
        if(!this.subs.hasOwnProperty(pEventName as string)){
            this.subs[pEventName as string] = [];
        }

        // TODO : add weight-based priority
        this.subs[pEventName as string].push(pSubscriber);
    }

    /**
     * To remove all BusSubscriber attached to the specified event type
     *
     * @param {string} pEventName The event type
     * @return {boolean} TRUE when it's done.
     * @method
     */
    unscribeAll(pEventName:string):boolean{
        this.subs[pEventName] = [];
        return true;
    }


    /**
     * To emit an event into the bus.
     *
     * Events are forwarded :
     * - conditionally to associated listeners
     * - inconditionnaly to broadcasters already registered
     *
     * @param {BusEvent<any>} event
     * @return {boolean} Return TRUE if the event is emitted, else FALSE if this event type is globally & currently prevented
     * @method
     */
    send(event:BusEvent<any>):boolean{

        if(this.prevented.hasOwnProperty(event.type) && this.prevented[event.type]===true){
            Logger.info("[BUS] <"+event.type+"> prevented ...");
            this.prevented[event.type] = false;
            return false;
        }

        //inject context if missing
        if(event.context==null){
            event.context = this.context;
        }


        // TODO : async / co

        // exec local subscribers
        const evName = event.getType();

        if(this._buses[evName]!=null){
            this._buses[evName].bus.next(event);
        }
        /*
        if(this.subs.hasOwnProperty(evName)){
            Logger.debug('[BUS] Trigger events : '+evName);
            Logger.debugRAW(event.getData());
            for(let  i=0; i<this.subs[evName].length; i++){
                this.subs[evName][i].exec(event);
            }
        }*/

        return true;
    }

    /**
     * To register a broadcaster
     *
     * @param {BusBroadcaster} pBroadcaster The broadcaster listening for event
     * @method
     */
    register(pBroadcaster:BusBroadcaster):void {
        Logger.debug('[BUS] Register broadcaster : '+pBroadcaster.getUID());
        this.broadcast[pBroadcaster.getUID()] = pBroadcaster;
    }


    /**
     * To check if there is subscription to a specific event type
     *
     * This method helps to optimize heap by avoiding to create useless event.
     * i.e. Help to trigger only catchable event
     *
     *
     * @param {string} pType Event type
     * @returns {boolean} TRUE is there is subscriptions, else FALSE
     * @method
     */
    hasSubscriptionsTo(pType:string):boolean {
        const state = this._buses[pType];
        return (state!=null && state.subscriptions.length>0);
    }


    /**
     * To get the list of name of event with subscribers
     *
     * Important : event types without subscribers are not
     * contained in this list
     *
     */
    getSupportedEventNames():string[] {
       return Object.keys(this._buses);
    }
}

