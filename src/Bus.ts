import DexcaliburProject from "./DexcaliburProject";
import Event from "./Event";


interface BusPreventList {
    [eventID :string] :boolean
}

export default class Bus
{
    context:DexcaliburProject = null;
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

    prevent(eventName:string):Bus{
        this.prevented[eventName] = true;
        return this;
    }

    unprevent(eventName:string):Bus{
        this.prevented[eventName] = false;
        return this;
    }

    // inspector
    getListener(eventName:string):any{
        for(let i:number=0; i<this.listener.length; i++)
            if(this.listener[i].name == eventName)
                return this.listener[i];
        return null;
    }

    subscribe(listener:any):Bus{
        this.listener.push(listener);
        return this;
    }


    unscribe(listener:any):boolean{
        for(let i=0; i<this.listener.length; i++){
            if(this.listener[i].getId()==listener.getID()){
                this.listener[i] = null;
            }
        }
        return true;
    }

// TODO fix it
    send(event:Event):boolean{

        if(this.prevented[event.type] != undefined && this.prevented[event.type]===true){
            this.prevented[event.type] = false;
            return false;
        }


        for(let i=0; i<this.listener.length; i++){
            // TODO : async / co
            this.listener[i].broadcastEvent(event);
        }
        return true;
    }
}

