

export enum ACTION_DATE {
    START="start",
    STOP="stop",
    PAUSE="pause",
    ORDER="order",
    WAITING="waiting",
}


export interface ActionDates {
    start:number;
    stop:number;
    pause?:number;
    order?:number;
    waiting?:number;
}